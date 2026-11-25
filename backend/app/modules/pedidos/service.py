from datetime import datetime, time

from app.core.pagination import Pagination
from app.core.utils import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoError(Exception):
    """Base de las excepciones de dominio de pedidos."""


class PedidoNoEncontrado(PedidoError):
    pass


class PedidoAjeno(PedidoError):
    pass


class StockInsuficiente(PedidoError):
    pass


class ProductoNoDisponible(PedidoError):
    pass


class ProductoRepetido(PedidoError):
    pass


class TransicionInvalida(PedidoError):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---- helpers ----
    @staticmethod
    def _existente(pedido: Pedido | None) -> Pedido:
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve el stock de cada línea en la misma transacción."""
        for linea in pedido.items:
            producto = uow.productos.get_by_id_for_update(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad

    def _aplicar_transicion(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(
                f"Transición inválida: {pedido.estado} → {nuevo_estado}"
            )
        if nuevo_estado == CANCELADO:
            self._restituir_stock(uow, pedido)
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)

    # ---- casos de uso ----
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """RN-01: todo en una transacción; si algo falla no se persiste nada."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=PENDIENTE,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe o está inactivo")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto «{producto.nombre}» no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para «{producto.nombre}» (disponible: {producto.stock})"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,  
                        producto_id=producto.id, 
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: Usuario, estado: str | None, pagination: Pagination
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all(estado, pagination.skip, pagination.limit)
            else:
                total, items = uow.pedidos.list_by_usuario(
                    usuario.id, estado, pagination.skip, pagination.limit  
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items],
                page=pagination.page,
                size=pagination.size,
                pages=pagination.pages(total),
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow.pedidos.get_by_id(pedido_id))
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        """Solo admin (RN-02, RN-03, RN-04)."""
        with self.uow as uow:
            pedido = self._existente(uow.pedidos.get_by_id(pedido_id))
            self._aplicar_transicion(uow, pedido, data.estado)
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        """El dueño cancela su pedido, solo desde PENDIENTE (RN-03, RN-04)."""
        with self.uow as uow:
            pedido = self._existente(uow.pedidos.get_by_id(pedido_id))
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, CANCELADO)
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.combine(utcnow().date(), time.min)
            return ResumenPedidos(
                pendientes=por_estado.get(PENDIENTE, 0),
                en_preparacion=por_estado.get(EN_PREPARACION, 0),
                entregados=por_estado.get(ENTREGADO, 0),
                cancelados=por_estado.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(ENTREGADO),
            )
