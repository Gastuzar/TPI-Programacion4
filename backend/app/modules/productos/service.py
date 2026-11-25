from app.core.pagination import Pagination
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoError(Exception):
    """Base de las excepciones de dominio de productos."""


class ProductoNoEncontrado(ProductoError):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activo(producto: Producto | None) -> Producto:
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

    def listar(
        self,
        pagination: Pagination,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search, categoria_id, disponible, pagination.skip, pagination.limit
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
                page=pagination.page,
                size=pagination.size,
                pages=pagination.pages(total),
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(producto_id))
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = Producto(**data.model_dump())
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(producto_id))
            campos = {
                k: v
                for k, v in data.model_dump(exclude_unset=True).items()
                if v is not None or k in ("descripcion", "imagen_url")
            }
            if "categoria_id" in campos:
                self._validar_categoria(uow, campos["categoria_id"])
            for campo, valor in campos.items():
                setattr(producto, campo, valor)
            uow.productos.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(producto_id))
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._activo(uow.productos.get_by_id(producto_id))
            producto.activo = False  # baja lógica
            uow.productos.add(producto)
