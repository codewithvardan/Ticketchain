import { Link, Outlet, useLocation } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'
import ContractBanner from './ContractBanner'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Browse Events' },
  { to: '/create', label: 'Create Event' },
  { to: '/my-tickets', label: 'My Tickets' },
  { to: '/verify', label: 'Verify Ticket' },
]

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-950 transition-opacity hover:opacity-90">
            Ticket<span className="text-base-blue font-black">Chain</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname === to
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ConnectWallet />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <ContractBanner />
        <Outlet />
      </main>
    </div>
  )
}
