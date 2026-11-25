from dataclasses import dataclass
from math import ceil

from fastapi import Query


@dataclass
class Pagination:
    skip: int
    limit: int
    page: int | None = None
    size: int | None = None

    def pages(self, total: int) -> int | None:
        return ceil(total / self.limit) if self.page is not None else None


def get_pagination(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    page: int | None = Query(None, ge=1),
    size: int | None = Query(None, ge=1, le=100),
) -> Pagination:
    """skip/limit (default 0/20, máx. 100); opcionalmente page/size."""
    if page is not None or size is not None:
        limit = size or limit
        current = page or 1
        return Pagination(skip=(current - 1) * limit, limit=limit, page=current, size=limit)
    return Pagination(skip=skip, limit=limit)
