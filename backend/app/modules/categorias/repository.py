from collections.abc import Sequence

from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Incluye las dadas de baja: la baja lógica no libera el nombre único."""
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.id)
        ).all()
