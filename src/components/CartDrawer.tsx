import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../lib/cart'
import { zar, FREE_DELIVERY_THRESHOLD } from '../lib/format'
import { Button, LinkButton } from './Button'

export function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, setQty, remove, count, clear } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCart()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
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
      previous?.focus?.()
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 size-full cursor-default bg-void/85 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-hair bg-ink"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-hair px-5 py-4">
          <h2 className="font-display text-2xl leading-none text-bone">
            Cart <span className="tnum text-dim">[{count}]</span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="grid size-10 place-items-center border border-hair-lit text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close cart</span>
          </button>
        </div>

        {lines.length > 0 && (
          <div className="shrink-0 border-b border-hair px-5 py-4">
            <p className="label text-ash">
              {remaining > 0 ? (
                <>
                  Add <span className="tnum text-amber">{zar(remaining)}</span> for free delivery
                </>
              ) : (
                <span className="text-mint">Free delivery unlocked</span>
              )}
            </p>
            <div
              className="mt-2.5 h-1 bg-slate"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={FREE_DELIVERY_THRESHOLD}
              aria-valuenow={Math.min(subtotal, FREE_DELIVERY_THRESHOLD)}
              aria-label="Progress towards free delivery"
            >
              <div
                className={`h-full transition-[width] duration-300 ${remaining > 0 ? 'bg-amber' : 'bg-mint'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
              <ShoppingBag className="size-8 text-dim" aria-hidden="true" />
              <div>
                <p className="font-display text-3xl leading-none text-bone">Nothing in here</p>
                <p className="mt-2.5 text-sm text-ash">
                  Tempered glass starts at R89. Power banks at R199.
                </p>
              </div>
              <Button variant="outline" onClick={closeCart}>
                Back to catalogue
              </Button>
            </div>
          ) : (
            <ul>
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 border-b border-hair p-5">
                  <img
                    src={line.product.image}
                    alt=""
                    className="size-20 shrink-0 border border-hair object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/product/${line.product.id}`}
                        onClick={closeCart}
                        className="font-display text-lg leading-tight text-bone transition-colors duration-200 hover:text-amber"
                      >
                        {line.product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="shrink-0 p-1 text-dim transition-colors duration-200 hover:text-danger"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="sr-only">Remove {line.product.name}</span>
                      </button>
                    </div>
                    {line.variant && <p className="label mt-1 text-dim">{line.variant}</p>}

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center border border-hair">
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className="grid size-9 place-items-center text-ash transition-colors duration-200 hover:bg-carbon hover:text-bone"
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                          <span className="sr-only">Decrease quantity of {line.product.name}</span>
                        </button>
                        <span aria-live="polite" className="tnum w-8 text-center text-sm text-bone">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty + 1)}
                          disabled={line.qty >= 10}
                          className="grid size-9 place-items-center text-ash transition-colors duration-200 hover:bg-carbon hover:text-bone disabled:opacity-30"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                          <span className="sr-only">Increase quantity of {line.product.name}</span>
                        </button>
                      </div>
                      <span className="tnum font-display text-xl text-bone">{zar(line.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="shrink-0 border-t border-hair p-5">
            <div className="flex items-end justify-between pb-4">
              <span className="label text-ash">Subtotal incl. VAT</span>
              <span className="tnum font-display text-4xl leading-none text-bone">{zar(subtotal)}</span>
            </div>
            <LinkButton to="/checkout" size="lg" fullWidth>
              Checkout
            </LinkButton>
            <div className="mt-3 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={closeCart}>
                Keep shopping
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Empty cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
