import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" className="mr-3 text-lg font-bold text-orange-600">
            🍔 Food Store
          </NavLink>
          <NavLink to="/" end className={linkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={linkClass}>
            Carrito{cantidad > 0 && <span className="ml-1 rounded-full bg-orange-600 px-1.5 text-xs text-white">{cantidad}</span>}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={linkClass}>
              Mis pedidos
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {usuario ? (
            <>
              <span className="text-slate-600">
                {usuario.full_name} <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase">{usuario.role}</span>
              </span>
              <Button variant="secondary" size="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
      {usuario?.role === 'admin' && (
        <nav className="border-t border-slate-100 bg-slate-800">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-1.5 text-sm">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Panel</span>
            {[
              ['/admin/resumen', 'Resumen'],
              ['/admin/categorias', 'Categorías'],
              ['/admin/productos', 'Productos'],
              ['/admin/pedidos', 'Pedidos'],
              ['/admin/usuarios', 'Usuarios'],
            ].map(([to, texto]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded px-2.5 py-1 ${isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`
                }
              >
                {texto}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
