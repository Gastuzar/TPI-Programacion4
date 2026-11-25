"""Carga datos iniciales (idempotente): python -m app.db.seed"""
from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {"username": "admin", "full_name": "Administrador", "email": "admin@foodstore.com", "password": "Admin1234!"}

CATEGORIAS = {
    "Hamburguesas": "Clásicas y especiales, con papas",
    "Pizzas": "Pizzas a la piedra",
    "Bebidas": "Gaseosas, jugos y agua",
    "Postres": "Dulces para cerrar la comida",
}

# nombre, categoría, precio, stock, descripción
PRODUCTOS = [
    ("Hamburguesa Clásica", "Hamburguesas", 6500.0, 25, "Carne, lechuga, tomate y queso"),
    ("Hamburguesa Doble Cheddar", "Hamburguesas", 8200.0, 20, "Doble carne y cheddar fundido"),
    ("Pizza Muzzarella", "Pizzas", 7400.0, 15, "Salsa de tomate y muzzarella"),
    ("Pizza Napolitana", "Pizzas", 8100.0, 12, "Muzzarella, tomate fresco y ajo"),
    ("Gaseosa Cola 500ml", "Bebidas", 1800.0, 60, "Botella 500 ml"),
    ("Agua Mineral 500ml", "Bebidas", 1200.0, 80, "Sin gas"),
    ("Flan con Dulce de Leche", "Postres", 3200.0, 18, "Flan casero con crema"),
    ("Brownie con Helado", "Postres", 4300.0, 14, "Brownie tibio y helado de crema"),
]


def seed() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        session = uow.session

        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS.items():
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria

        for nombre, cat, precio, stock, descripcion in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        categoria_id=categorias[cat].id,  
                    )
                )
    print("Seed completo: admin / Admin1234!, 4 categorías y 8 productos.")


if __name__ == "__main__":
    seed()
