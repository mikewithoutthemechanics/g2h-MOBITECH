import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import type { Product } from '../lib/products'
import { isUniversal } from '../lib/products'
import { compactUnits } from '../lib/format'
import { useCart } from '../lib/cart'
import { useDevice } from '../lib/device'
import { Badge, Price, Stars } from './Bits'

export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const { add, lastAdded } = useCart()
  const { model } = useDevice()
  const justAdded = lastAdded === product.id
  const saving = product.was ? product.was - product.price : 0
  const exactFit = model && !isUniversal(product) && product.fits.includes(model)

  return (
    <article className="group relative flex h-full flex-col border border-hair bg-ink transition-colors duration-200 hover:border-hair-lit">
      <div className="relative aspect-square overflow-hidden bg-carbon">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover opacity-80 grayscale-[35%] transition-all duration-700 ease-[cubic-bezier(0.16,0.84,0.28,1)] group-hover:scale-[1.06] group-hover:opacity-100 group-hover:grayscale-0"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent"
        />

        {index !== undefined && (
          <span className="label-sm tnum absolute left-3 top-3 text-bone/80">
            {index.toString().padStart(2, '0')}
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {product.badge && (
            <Badge tone={product.badge === 'Bundle' ? 'mint' : product.badge === 'Grid-free' ? 'amber' : 'ember'}>
              {product.badge}
            </Badge>
          )}
          {exactFit && <Badge tone="mint">Fits {model}</Badge>}
        </div>

        {product.stock < 30 && (
          <span className="label absolute bottom-3 left-3 bg-void/85 px-2 py-1 text-danger tnum">
            {product.stock} left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="label text-dim">{product.brand}</span>
          <span className="label tnum text-dim">{compactUnits(product.sold)}/mo</span>
        </div>

        <h3 className="font-display text-xl leading-[0.92] text-bone transition-colors duration-200 group-hover:text-amber">
          <Link to={`/product/${product.id}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        <p className="label truncate text-ash">{product.compat}</p>

        <Stars value={product.rating} reviews={product.reviews} />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-hair pt-3.5">
          <div>
            <Price value={product.price} was={product.was} size="sm" />
            {saving > 0 && <p className="label mt-1 text-mint tnum">Save R{saving}</p>}
          </div>
          <button
            type="button"
            onClick={() => add(product.id, product.variants?.options[0])}
            aria-label={`Add ${product.name} to cart`}
            className={`relative z-10 grid size-11 shrink-0 place-items-center border transition-colors duration-200 ${
              justAdded
                ? 'border-mint bg-mint text-void'
                : 'border-hair-lit text-bone hover:border-amber hover:bg-amber hover:text-void'
            }`}
          >
            {justAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
        </div>
      </div>
    </article>
  )
}
