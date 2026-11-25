from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaError(Exception):
    """Base de las excepciones de dominio de categorías."""


class CategoriaNoEncontrada(CategoriaError):
    pass


class NombreDuplicado(CategoriaError):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activa(categoria: Categoria | None) -> Categoria:
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow.categorias.get_by_id(categoria_id))
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria(nombre=data.nombre, descripcion=data.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow.categorias.get_by_id(categoria_id))
            campos = data.model_dump(exclude_unset=True)
            nuevo_nombre = campos.get("nombre")
            if nuevo_nombre is not None and nuevo_nombre != categoria.nombre:
                if uow.categorias.get_by_nombre(nuevo_nombre) is not None:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
            if nuevo_nombre is not None:
                categoria.nombre = nuevo_nombre
            if "descripcion" in campos:
                categoria.descripcion = campos["descripcion"]
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._activa(uow.categorias.get_by_id(categoria_id))
            categoria.activo = False  # baja lógica
            uow.categorias.add(categoria)
