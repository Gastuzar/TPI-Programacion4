from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; commit/rollback y close en __exit__."""

    session: Session

    def __enter__(self) -> Self:
        self.session = session_factory()
        self._init_repositories(self.session)
        return self

    def _init_repositories(self, session: Session) -> None:
        """Las subclases exponen sus repositorios sobre la misma sesión."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
