import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AlertTriangle, Check, Minus, Plus, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import { getProduct, relatedTo, categoryName, isUniversal, categories } from '../lib/products'
import { zar, compactUnits } from '../lib/format'
import { Badge, Mark, Stars } from '../components/Bits'
import { Button } from '../components/Button'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../lib/cart'
import { useDevice } from '../lib/device'

export default function ProductPage() {
  const { id } = useParams()
  const product = id ? getProduct(id) : undefined
  const { add, openCart } = useCart()
  const { model } = useDevice()

  const [variant, setVariant] = useState<string | undefined>(product?.variants?.options[0])
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  if (!product) return <Navigate to="/shop" replace />

  const saving = product.was ? product.was - product.price : 0
  const related = relatedTo(product)
  const category = categories.find((c) => c.id === product.category)

  const universal = isUniversal(product)
  const fitState: 'none' | 'exact' | 'universal' | 'mismatch' = !model
    ? 'none'
    : universal
      ? 'universal'
      : product.fits.includes(model)
        ? 'exact'
        : 'mismatch'

  const handleAdd = () => {
    setAdding(true)
    window.setTimeout(() => {
      add(product.id, variant, qty)
      setAdding(false)
      setAdded(true)
      openCart()
      window.setTimeout(() => setAdded(false), 2000)
    }, 300)
  }

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-8">
        <Mark index={category?.index ?? '—'} label={categoryName(product.category)} />

        <nav aria-label="Breadcrumb" className="label mt-6 text-dim">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="transition-colors duration-200 hover:text-bone">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={`/shop?category=${product.category}`}
                className="transition-colors duration-200 hover:text-bone"
              >
                {categoryName(product.category)}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ash">{product.name}</li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          {/* media */}
          <div className="lg:col-span-7">
            <div className="relative border border-hair bg-ink">
              <img
                src={product.image}
                alt={`${product.name} — ${product.compat}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {product.badge && (
                  <Badge tone={product.badge === 'Bundle' ? 'mint' : product.badge === 'Grid-free' ? 'amber' : 'ember'}>
                    {product.badge}
                  </Badge>
                )}
                {saving > 0 && <Badge tone="mint">Save {zar(saving)}</Badge>}
              </div>
            </div>

            <ul className="mt-4 grid gap-px border border-hair bg-hair sm:grid-cols-3">
              {[
                { icon: Truck, label: 'Ships in 2–4 days' },
                { icon: ShieldCheck, label: '12-month warranty' },
                { icon: RefreshCw, label: '30-day returns' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="label flex items-center gap-2.5 bg-ink px-4 py-3.5 text-ash">
                  <Icon className="size-3.5 shrink-0 text-mint" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="label border-b border-hair pb-3 text-amber">In the box</h2>
                <ul className="mt-4 grid gap-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ash">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="label border-b border-hair pb-3 text-amber">Specification</h2>
                <dl className="mt-1">
                  {product.spec.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 border-b border-hair py-3"
                    >
                      <dt className="label text-dim">{key}</dt>
                      <dd className="text-sm text-bone">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* buy panel */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <p className="label text-dim">{product.brand}</p>
              <h1 className="mt-3 t-sect leading-[0.88]">{product.name}</h1>
              <p className="mt-5 text-base text-ash">{product.blurb}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Stars value={product.rating} reviews={product.reviews} />
                <span className="label tnum text-dim">{compactUnits(product.sold)} sold/month</span>
              </div>

              <div className="mt-7 flex flex-wrap items-end gap-4 border-y border-hair py-6">
                <span className="tnum font-display text-6xl leading-[0.8] text-bone">
                  {zar(product.price)}
                </span>
                {product.was && (
                  <span className="tnum label pb-2 text-dim line-through">{zar(product.was)}</span>
                )}
                <p className="label w-full text-dim">
                  Incl. VAT · or 3 x {zar(Math.round(product.price / 3))} with PayJustNow
                </p>
              </div>

              {/* fitment verdict */}
              <div
                className={`mt-6 flex items-start gap-3 border px-4 py-3.5 ${
                  fitState === 'exact'
                    ? 'border-mint/40 bg-mint/8'
                    : fitState === 'mismatch'
                      ? 'border-danger/40 bg-danger/8'
                      : 'border-hair bg-ink'
                }`}
              >
                {fitState === 'mismatch' ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                ) : (
                  <Check
                    className={`mt-0.5 size-4 shrink-0 ${fitState === 'exact' ? 'text-mint' : 'text-dim'}`}
                    aria-hidden="true"
                  />
                )}
                <p className="text-sm text-ash">
                  {fitState === 'exact' && (
                    <>
                      Confirmed fit for your <span className="text-mint">{model}</span>.
                    </>
                  )}
                  {fitState === 'universal' && (
                    <>
                      Universal — works with your <span className="text-bone">{model}</span> and
                      everything else.
                    </>
                  )}
                  {fitState === 'mismatch' && (
                    <>
                      Not cut for the <span className="text-danger">{model}</span>.{' '}
                      <Link to="/fitment" className="text-bone underline underline-offset-4">
                        See what does fit
                      </Link>
                      .
                    </>
                  )}
                  {fitState === 'none' && (
                    <>
                      Fits {product.compat}.{' '}
                      <Link to="/fitment" className="text-amber underline underline-offset-4">
                        Set your device
                      </Link>{' '}
                      to confirm.
                    </>
                  )}
                </p>
              </div>

              {product.variants && (
                <fieldset className="mt-7">
                  <legend className="label text-dim">{product.variants.label}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.variants.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setVariant(option)}
                        aria-pressed={variant === option}
                        className={`h-11 border px-4 text-sm transition-colors duration-200 ${
                          variant === option
                            ? 'border-amber bg-amber text-void'
                            : 'border-hair text-ash hover:border-hair-lit hover:text-bone'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-14 items-center border border-hair">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="grid size-12 place-items-center text-ash transition-colors duration-200 hover:bg-carbon hover:text-bone disabled:opacity-30"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Decrease quantity</span>
                  </button>
                  <span aria-live="polite" className="tnum w-10 text-center font-display text-2xl text-bone">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                    disabled={qty >= 10}
                    className="grid size-12 place-items-center text-ash transition-colors duration-200 hover:bg-carbon hover:text-bone disabled:opacity-30"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Increase quantity</span>
                  </button>
                </div>

                <Button size="lg" loading={adding} onClick={handleAdd} className="flex-1 min-w-[200px]">
                  {added ? (
                    <>
                      <Check className="size-4" aria-hidden="true" /> Added
                    </>
                  ) : (
                    <>Add to cart — {zar(product.price * qty)}</>
                  )}
                </Button>
              </div>

              <p className="label mt-4 text-dim tnum" aria-live="polite">
                {product.stock < 30
                  ? `Only ${product.stock} left in the Cape Town warehouse`
                  : `${product.stock} units ready to ship today`}
              </p>
            </div>
          </div>
        </div>

        {/* related */}
        <section className="mt-20">
          <Mark index="—" label="Buy it with" />
          <h2 className="mb-8 mt-8 t-sect leading-[0.88]">One parcel, one delivery fee</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>

      {/* sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-hair bg-ink/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="label truncate text-dim">{product.name}</p>
          <p className="tnum font-display text-2xl leading-none text-bone">
            {zar(product.price * qty)}
          </p>
        </div>
        <Button loading={adding} onClick={handleAdd}>
          {added ? 'Added' : 'Add to cart'}
        </Button>
      </div>
    </div>
  )
}
