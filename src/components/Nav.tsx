import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingBag, Smartphone, X, Zap } from 'lucide-react'
import { useCart } from '../lib/cart'
import { useDevice } from '../lib/device'
import { dispatchCutoff } from '../lib/format'
import { categories } from '../lib/products'
import { SearchOverlay } from './SearchOverlay'

const primary = [
  { to: '/shop', label: 'Catalogue', index: '01' },
  { to: '/fitment', label: 'Find my fit', index: '02' },
  { to: '/shop?category=loadshedding', label: 'Grid-free', index: '03' },
  { to: '/shop?category=gaming', label: 'Gaming', index: '04' },
  { to: '/design-system', label: 'System', index: '05' },
]

const railItems = [
  'Free delivery over R500',
  'PUDO locker R60',
  'Door courier R99',
  '12-month warranty',
  '30-day returns',
  'Payfast · Ozow · SnapScan',
]

export function Nav() {
  const { count, openCart } = useCart()
  const { model } = useDevice()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cutoff, setCutoff] = useState(() => dispatchCutoff())
  const menuRef = useRef<HTMLDivElement>(null)
  const menuCloseRef = useRef<HTMLButtonElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => setCutoff(dispatchCutoff()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  // Overlay contract: lock scroll, trap focus, close on Escape, restore focus.
  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    menuCloseRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        return
      }
      if (event.key !== 'Tab' || !menuRef.current) return
      const nodes = menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      menuTriggerRef.current?.focus()
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* dispatch rail */}
        <div className="rail-host border-b border-hair bg-void">
          <div className="mx-auto flex h-8 max-w-[1320px] items-center gap-6 px-4 sm:px-8">
            <p className="label flex shrink-0 items-center gap-2 text-bone">
              <span
                className={`size-1.5 rounded-full ${cutoff.open ? 'bg-mint' : 'bg-dim'}`}
                aria-hidden="true"
              />
              {cutoff.open ? (
                <>
                  Ships today · <span className="tnum text-amber">{cutoff.label}</span> left
                </>
              ) : (
                cutoff.label
              )}
            </p>
            <div className="hidden flex-1 overflow-hidden md:block">
              <div className="rail-track rail-track-slow flex w-max gap-8">
                {[...railItems, ...railItems].map((item, i) => (
                  <span key={i} className="label whitespace-nowrap text-dim">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* main bar */}
        <div className="border-b border-hair bg-ink/92 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-5 px-4 sm:px-8">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <Zap className="size-5 text-amber" strokeWidth={2.5} aria-hidden="true" />
              <span className="font-display text-2xl leading-none tracking-tight text-bone">
                Goods2Hoods
              </span>
            </Link>

            <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
              {primary.map((item) => {
                const active = location.pathname + location.search === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`label px-3 py-2.5 transition-colors duration-200 ${
                      active ? 'text-amber' : 'text-ash hover:text-bone'
                    }`}
                  >
                    <span className="tnum text-dim">{item.index}</span>{' '}
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/fitment"
                className="label hidden h-10 items-center gap-2 border border-hair px-3 text-ash transition-colors duration-200 hover:border-amber hover:text-amber sm:inline-flex"
              >
                <Smartphone className="size-3.5" aria-hidden="true" />
                {model ?? 'Set device'}
              </Link>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="grid size-10 place-items-center border border-hair text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
              >
                <Search className="size-4" aria-hidden="true" />
                <span className="sr-only">Search products</span>
              </button>

              <button
                type="button"
                onClick={openCart}
                aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
                className="label inline-flex h-10 items-center gap-2.5 border border-hair px-3 text-bone transition-colors duration-200 hover:border-amber hover:text-amber"
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cart</span>
                <span
                  className={`tnum grid h-5 min-w-5 place-items-center px-1 ${
                    count > 0 ? 'bg-amber text-void' : 'bg-slate text-dim'
                  }`}
                >
                  {count}
                </span>
              </button>

              <button
                ref={menuTriggerRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                className="grid size-10 place-items-center border border-hair text-bone lg:hidden"
              >
                <Menu className="size-4" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* full-bleed mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col bg-void lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-hair px-4">
            <span className="label text-dim">Menu</span>
            <button
              ref={menuCloseRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid size-10 place-items-center border border-hair-lit text-bone"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
            <ul>
              {primary.map((item) => (
                <li key={item.to} className="border-b border-hair">
                  <Link
                    to={item.to}
                    className="flex items-baseline gap-4 py-5 font-display text-4xl leading-none text-bone"
                  >
                    <span className="label tnum text-amber">{item.index}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="label mt-8 text-dim">Categories</p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/shop?category=${c.id}`}
                    className="label block border border-hair px-3 py-3 text-ash"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
