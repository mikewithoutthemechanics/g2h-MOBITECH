import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag, Truck, X, Zap } from 'lucide-react'
import { useCart } from '../lib/cart'

const nav = [
  { to: '/shop', label: 'Shop all' },
  { to: '/shop?category=loadshedding', label: 'Load-shedding' },
  { to: '/shop?category=gaming', label: 'Gaming' },
  { to: '/shop?category=power', label: 'Power banks' },
  { to: '/design-system', label: 'Design system' },
]

export function Header() {
  const { count, openCart } = useCart()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname, location.search])

  return (
    <header className="sticky top-0 z-40">
      <div className="on-ink bg-ink text-fg-inverse">
        <div className="mx-auto flex h-9 max-w-[1200px] items-center gap-4 overflow-hidden px-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="size-3.5 text-solar" aria-hidden="true" /> Free delivery over R500
          </span>
          <span className="hidden items-center gap-1.5 whitespace-nowrap sm:flex">
            <Zap className="size-3.5 text-solar" aria-hidden="true" /> PUDO lockers nationwide from R60
          </span>
          <span className="ml-auto hidden whitespace-nowrap text-fg-inverse/70 md:block">
            12-month warranty · 30-day returns
          </span>
        </div>
      </div>

      <div className="border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lead font-extrabold tracking-tight text-fg-strong"
          >
            <span className="grid size-9 place-items-center rounded-card bg-ink">
              <Zap className="size-5 text-solar" strokeWidth={2.5} aria-hidden="true" />
            </span>
            Goods2Hoods
          </Link>

          <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-pill px-3.5 py-2 text-md font-semibold transition-colors duration-150 ${
                    isActive && item.to === location.pathname + location.search
                      ? 'bg-ink text-fg-inverse'
                      : 'text-fg hover:bg-sunken hover:text-fg-strong'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-11 items-center gap-2 rounded-pill border border-line bg-raised px-4 text-md font-semibold text-fg-strong transition-colors duration-150 hover:border-line-strong hover:bg-sunken"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              <span
                className={`grid min-w-6 place-items-center rounded-pill px-1.5 text-xs font-bold ${
                  count > 0 ? 'bg-accent text-white' : 'bg-sunken text-fg-muted'
                }`}
              >
                {count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="grid size-11 place-items-center rounded-pill border border-line bg-raised text-fg-strong lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="border-t border-line bg-canvas px-4 py-3 lg:hidden"
          >
            <ul className="grid gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block rounded-card px-3.5 py-3 text-md font-semibold text-fg-strong hover:bg-sunken"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
