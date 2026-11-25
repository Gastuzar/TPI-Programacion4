from sqlmodel import Session

from app.core.base_repository import BaseRepository
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.models import DetallePedido
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Repositorios de pedidos y de productos sobre la misma sesión"""

    pedidos: PedidoRepository
    detalles: BaseRepository[DetallePedido]
    productos: ProductoRepository

    def _init_repositories(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.detalles = BaseRepository(session, DetallePedido)
        self.productos = ProductoRepository(session)
