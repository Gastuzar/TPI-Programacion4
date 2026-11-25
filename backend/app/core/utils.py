from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha/hora UTC sin zona horaria (columnas datetime naive)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
