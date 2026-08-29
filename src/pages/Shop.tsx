import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { categories, products, fitsDevice, isUniversal, type CategoryId } from '../lib/products'
import { useDevice } from '../lib/device'
import { ProductCard } from '../components/ProductCard'
import { Mark } from '../components/Bits'
import { Button } from '../components/Button'

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating'

const bands = [
  { id: 'all', label: 'Any price', test: () => true },
  { id: 'under-150', label: 'Under R150', test: (p: number) => p < 150 },
  { id: '150-250', label: 'R150–R250', test: (p: number) => p >= 150 && p <= 250 },
  { id: '250-350', label: 'R250–R350', test: (p: number) => p > 250 && p <= 350 },
  { id: 'over-350', label: 'Over R350', test: (p: number) => p > 350 },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const { model } = useDevice()
  const activeCategory = (params.get('category') ?? 'all') as CategoryId | 'all'
  const query = params.get('q') ?? ''

  const [band, setBand] = useState('all')
  const [sort, setSort] = useState<SortKey>('popular')
  const [fitOnly, setFitOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const bandTest = bands.find((b) => b.id === band)?.test ?? (() => true)
    const q = query.trim().toLowerCase()

    const filtered = products.filter((p) => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false
      if (!bandTest(p.price)) return false
      if (fitOnly && model && !fitsDevice(p, model)) return false
      if (q && !`${p.name} ${p.brand} ${p.compat} ${p.blurb}`.toLowerCase().includes(q)) return false
      return true
    })

    switch (sort) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating)
      default:
        return [...filtered].sort((a, b) => b.sold - a.sold)
    }
  }, [activeCategory, band, fitOnly, model, query, sort])

  const category = categories.find((c) => c.id === activeCategory)
  const title = category?.name ?? 'Full catalogue'
  const dirty = activeCategory !== 'all' || band !== 'all' || fitOnly || query !== ''

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true })
    setBand('all')
    setFitOnly(false)
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-8">
      <Mark index={category?.index ?? '—'} label="Catalogue" />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <nav aria-label="Breadcrumb" className="label mb-4 text-dim">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="transition-colors duration-200 hover:text-bone">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ash">{title}</li>
            </ol>
          </nav>
          <h1 className="t-page leading-[0.86]">{title}</h1>
          <p className="label mt-4 text-ash tnum" aria-live="polite">
            {results.length} product{results.length === 1 ? '' : 's'}
            {query && <> matching “{query}”</>}
            {category && <> · {category.range}</>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-dim"
              aria-hidden="true"
            />
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search…"
              className="h-11 w-full min-w-[200px] border border-hair bg-ink pl-10 pr-4 text-sm text-bone placeholder:text-dim transition-colors duration-200 hover:border-hair-lit focus:border-amber"
            />
          </div>

          <label htmlFor="shop-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="label h-11 border border-hair bg-ink px-3 text-bone transition-colors duration-200 hover:border-hair-lit"
          >
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filter-rail"
            className="lg:hidden"
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" /> Filters
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside
          id="filter-rail"
          aria-label="Product filters"
          className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}
        >
          <div className="sticky top-32 grid gap-8">
            {model ? (
              <label className="flex cursor-pointer items-start gap-3 border border-hair bg-ink p-4">
                <input
                  type="checkbox"
                  checked={fitOnly}
                  onChange={(e) => setFitOnly(e.target.checked)}
                  className="mt-0.5 size-4 accent-[#ffb300]"
                />
                <span>
                  <span className="block text-sm text-bone">Only what fits</span>
                  <span className="label text-mint">{model}</span>
                </span>
              </label>
            ) : (
              <div className="border border-amber/40 bg-amber/6 p-4">
                <p className="text-sm text-bone">Set your device once.</p>
                <p className="mt-1.5 text-sm text-ash">
                  We'll hide what doesn't fit and flag exact matches.
                </p>
                <Link
                  to="/fitment"
                  className="label mt-3 inline-flex text-amber underline underline-offset-4 transition-colors duration-200 hover:text-amber-lit"
                >
                  Check my fitment
                </Link>
              </div>
            )}

            <fieldset>
              <legend className="label text-dim">Aisle</legend>
              <ul className="mt-3 border-t border-hair">
                {[{ id: 'all', name: 'Everything', index: '00' }, ...categories].map((c) => {
                  const active = activeCategory === c.id
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setParam('category', c.id)}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 border-b border-hair py-2.5 text-left text-sm transition-colors duration-200 ${
                          active ? 'text-amber' : 'text-ash hover:text-bone'
                        }`}
                      >
                        <span className="label tnum text-dim">{c.index}</span>
                        {c.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </fieldset>

            <fieldset>
              <legend className="label text-dim">Price</legend>
              <ul className="mt-3 border-t border-hair">
                {bands.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setBand(b.id)}
                      aria-pressed={band === b.id}
                      className={`w-full border-b border-hair py-2.5 text-left text-sm transition-colors duration-200 ${
                        band === b.id ? 'text-amber' : 'text-ash hover:text-bone'
                      }`}
                    >
                      {b.label}
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>

            {dirty && (
              <button
                type="button"
                onClick={reset}
                className="label inline-flex items-center gap-2 text-amber transition-colors duration-200 hover:text-amber-lit"
              >
                <X className="size-3.5" aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-hair-lit px-6 py-24 text-center">
              <p className="font-display text-4xl leading-none text-bone">No matches</p>
              <p className="mt-4 max-w-sm text-sm text-ash">
                Nothing fits that combination. Widen the price band or clear the search to see all 29
                products from R89.
              </p>
              <div className="mt-7">
                <Button onClick={reset}>Reset filters</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {results.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i + 1} />
              ))}
            </div>
          )}

          {model && results.length > 0 && (
            <p className="label mt-8 text-dim">
              Showing fitment for {model} ·{' '}
              {results.filter((p) => !isUniversal(p) && p.fits.includes(model)).length} exact matches
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
