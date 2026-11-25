from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaError,
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
AdminUser = Annotated[Usuario, Depends(require_role(["admin"]))]


def _to_http(exc: CategoriaError) -> HTTPException:
    if isinstance(exc, CategoriaNoEncontrada):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, NombreDuplicado):
        return HTTPException(status.HTTP_409_CONFLICT, str(exc))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaError as exc:
        raise _to_http(exc) from exc


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, service: ServiceDep, _admin: AdminUser) -> CategoriaRead:
    try:
        return service.crear(data)
    except CategoriaError as exc:
        raise _to_http(exc) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, service: ServiceDep, _admin: AdminUser
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaError as exc:
        raise _to_http(exc) from exc


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, service: ServiceDep, _admin: AdminUser) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaError as exc:
        raise _to_http(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
