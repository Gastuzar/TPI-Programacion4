from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True)


def create_all_tables() -> None:
    from app.modules.categorias import models as _categorias  
    from app.modules.pedidos import models as _pedidos 
    from app.modules.productos import models as _productos  
    from app.modules.usuarios import models as _usuarios  

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Iterator[Session]:
    with session_factory() as session:
        yield session
