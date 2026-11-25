from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.core.pagination import Pagination, get_pagination
from app.modules.categorias.service import CategoriaError
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoError, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
AdminUser = Annotated[Usuario, Depends(require_role(["admin"]))]
PaginationDep = Annotated[Pagination, Depends(get_pagination)]


def _to_http(exc: Exception) -> HTTPException:
    # ProductoNoEncontrado y CategoriaNoEncontrada responden 404
    return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    pagination: PaginationDep,
    search: Annotated[str | None, Query(description="Búsqueda por nombre")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(pagination, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise _to_http(exc) from exc


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, service: ServiceDep, _admin: AdminUser) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaError as exc:
        raise _to_http(exc) from exc


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, data: ProductoUpdate, service: ServiceDep, _admin: AdminUser
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoError, CategoriaError) as exc:
        raise _to_http(exc) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, data: ProductoStockUpdate, service: ServiceDep, _admin: AdminUser
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoError as exc:
        raise _to_http(exc) from exc


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, service: ServiceDep, _admin: AdminUser) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoError as exc:
        raise _to_http(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
