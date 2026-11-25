from collections.abc import Sequence

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_id_for_update(self, producto_id: int) -> Producto | None:
        """Bloquea la fila (SELECT ... FOR UPDATE en PostgreSQL) para descontar stock sin carreras."""
        return self.session.exec(
            select(Producto).where(Producto.id == producto_id).with_for_update()
        ).first()

    def search(
        self,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[int, Sequence[Producto]]:
        """Productos activos filtrados por nombre (sin distinguir mayúsculas), categoría y disponibilidad."""
        condiciones = [col(Producto.activo).is_(True)]
        if search:
            condiciones.append(func.lower(Producto.nombre).like(f"%{search.strip().lower()}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        items = self.session.exec(
            select(Producto).where(*condiciones).order_by(Producto.id).offset(skip).limit(limit)
        ).all()
        return total, items
