import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { categories, products } from '../lib/products'
import { zar } from '../lib/format'

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input',
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
  }, [open, onClose])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products
      .filter((p) =>
        `${p.name} ${p.brand} ${p.compat} ${p.blurb}`.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-default bg-void/90 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="absolute inset-x-0 top-0 border-b border-hair bg-ink"
      >
        <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-8">
          <div className="flex items-center gap-4 border-b border-hair pb-4">
            <Search className="size-5 shrink-0 text-amber" aria-hidden="true" />
            <label htmlFor="g2h-search" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="g2h-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cases, glass, power banks…"
              className="h-11 flex-1 bg-transparent font-display text-3xl uppercase tracking-tight text-bone placeholder:text-dim focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center border border-hair-lit text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close search</span>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto py-4">
            {query.trim() === '' ? (
              <div>
                <p className="label text-dim">Jump to a category</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${c.id}`}
                      onClick={onClose}
                      className="label border border-hair px-3 py-2 text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
                    >
                      {c.index} {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <p className="py-6 text-sm text-ash">
                Nothing matches “{query}”. Try “glass”, “cable” or “power”.
              </p>
            ) : (
              <ul aria-live="polite">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/product/${p.id}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 border-b border-hair py-3 transition-colors duration-200 hover:bg-carbon"
                    >
                      <img src={p.image} alt="" className="size-12 border border-hair object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-xl text-bone group-hover:text-amber">
                          {p.name}
                        </span>
                        <span className="label text-dim">{p.compat}</span>
                      </span>
                      <span className="label tnum text-bone">{zar(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
