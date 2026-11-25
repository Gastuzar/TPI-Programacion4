from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_active_user, require_role
from app.core.pagination import Pagination, get_pagination
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoError,
    PedidoNoEncontrado,
    PedidoService,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
CurrentUser = Annotated[Usuario, Depends(get_current_active_user)]
AdminUser = Annotated[Usuario, Depends(require_role(["admin"]))]
PaginationDep = Annotated[Pagination, Depends(get_pagination)]


def _to_http(exc: Exception) -> HTTPException:
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(exc))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, service: ServiceDep, user: CurrentUser) -> PedidoRead:
    try:
        return service.crear(data, user.id)  
    except (PedidoError, ProductoNoEncontrado) as exc:
        raise _to_http(exc) from exc


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    service: ServiceDep,
    user: CurrentUser,
    pagination: PaginationDep,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(user, estado, pagination)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(service: ServiceDep, _admin: AdminUser) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, service: ServiceDep, user: CurrentUser) -> PedidoRead:
    try:
        return service.obtener(pedido_id, user)
    except PedidoError as exc:
        raise _to_http(exc) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, service: ServiceDep, _admin: AdminUser
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data)
    except PedidoError as exc:
        raise _to_http(exc) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, service: ServiceDep, user: CurrentUser) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, user)
    except PedidoError as exc:
        raise _to_http(exc) from exc
