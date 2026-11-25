# 🍔 Food Store — TPI Programación IV

Aplicación web para un negocio de comidas: catálogo, carrito, pedidos con control de stock y panel de administración.

- **Backend:** FastAPI + SQLModel + PostgreSQL, arquitectura en capas con Unit of Work, JWT en cookie HttpOnly y roles (`user` / `admin`).
- **Frontend:** React 19 + TypeScript (strict) + Vite + Tailwind CSS 4, TanStack Query / Form / Table, Zustand y Axios.

## 🔗 Enlaces de la entrega

- **Repositorio público (GitHub):** `https://github.com/Gastuzar/TPI-Programacion4`  
- **Video de demostración:** `https://drive.google.com/file/d/1BccbN9HswsVa6Wf6gPLTUGyIOSZ8J-A8/view?usp=sharing`  

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14) |
| PostgreSQL | 15 o superior (para desarrollo local también sirve SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior |

## Estructura

```
.
├── backend/     API REST (FastAPI)  →  app/core, app/modules/*, app/db/seed.py
├── frontend/    SPA (React + Vite)  →  src/features/*, src/shared, src/store, src/routes
└── README.md
```

## Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate      Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Windows: copy .env.example .env  
python -m app.db.seed         # crea tablas + admin, categorías y productos 
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1> — documentación en <http://localhost:8000/docs> y <http://localhost:8000/redoc>.
- Las tablas también se crean al iniciar la aplicación.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (dev: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT (mín. 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de token y cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (con credenciales) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si se sirve por HTTPS | `false` |

### Usuario del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

El seed también carga 4 categorías y 8 productos con stock. Los clientes se crean desde **/register** (rol `user`).

## Frontend

```bash
cd frontend
cp .env.example .env          # Windows: copy .env.example .env
pnpm install
pnpm build                    # verifica los tipos (tsc) y genera el bundle
pnpm dev                      # http://localhost:5173
```

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API (con `/api/v1`) | `http://localhost:8000/api/v1` |


## Qué incluye

**Cliente:** registro y login (TanStack Form), catálogo paginado en el servidor con búsqueda, filtro por categoría, skeleton y estado vacío, carrito persistido (Zustand + `persist`), checkout con dirección y forma de pago, «Mis pedidos» con detalle y cancelación en `PENDIENTE`.

**Admin:** resumen con indicadores, ABM de categorías y productos (TanStack Table + Form, cambio de stock y disponibilidad), gestión de pedidos con cambio de estado según la máquina de estados, gestión de usuarios (activar / desactivar).

## Reglas de negocio implementadas

- **RN-01** Crear pedido en una única transacción: sin ítems repetidos; producto existente, activo, disponible y con stock; se descuenta el stock y se copian nombre y precio en cada línea. Si algo falla, no se persiste nada.
- **RN-02** Máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, con `CANCELADO` desde los dos primeros; los estados terminales no cambian (400).
- **RN-03** Cancelar restituye el stock de cada línea en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos y solo en `PENDIENTE`; el admin ve todos.
- **RN-05** Líneas y total inmutables; no existen endpoints de edición ni borrado de pedidos.
- **RN-06** `forma_pago` ∈ {`EFECTIVO`, `TRANSFERENCIA`}; `direccion_entrega` de 5 a 200 caracteres.

## Arquitectura del backend

`Router → Service → Unit of Work → Repository → Model`. El `commit` ocurre únicamente en `UnitOfWork.__exit__`; los Services abren `with self.uow as uow:` y devuelven el schema dentro del bloque; los Routers obtienen el Service con `Depends(get_<modulo>_service)` y traducen las excepciones de dominio a `HTTPException`.
