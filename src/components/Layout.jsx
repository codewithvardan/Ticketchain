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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">
            Ticket<span className="text-base-blue">Chain</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === to
                    ? 'bg-base-blue text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ConnectWallet />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ContractBanner />
        <Outlet />
      </main>
    </div>
  )
}
