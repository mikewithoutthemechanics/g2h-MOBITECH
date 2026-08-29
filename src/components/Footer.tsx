import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { categories } from '../lib/products'

export function Footer() {
  return (
    <footer className="relative mt-28 border-t border-hair bg-void">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2.5">
              <Zap className="size-5 text-amber" strokeWidth={2.5} aria-hidden="true" />
              <span className="font-display text-2xl leading-none text-bone">Goods2Hoods</span>
            </p>
            <p className="mt-5 max-w-sm text-sm text-ash">
              Phone gear engineered for South African conditions. Dust, heat, potholes, taxis and a
              grid that takes breaks.
            </p>
            <p className="label mt-6 text-dim">Cape Town · Johannesburg · Durban</p>
          </div>

          <nav aria-label="Catalogue">
            <h2 className="label text-amber">Catalogue</h2>
            <ul className="mt-4 grid gap-2.5">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/shop?category=${c.id}`}
                    className="text-sm text-ash transition-colors duration-200 hover:text-bone"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support">
            <h2 className="label text-amber">Support</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-ash">
              <li><Link to="/fitment" className="transition-colors duration-200 hover:text-bone">Check my fitment</Link></li>
              <li><Link to="/shop" className="transition-colors duration-200 hover:text-bone">Track an order</Link></li>
              <li><Link to="/shop" className="transition-colors duration-200 hover:text-bone">Returns — 30 days</Link></li>
              <li><Link to="/design-system" className="transition-colors duration-200 hover:text-bone">Design system</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="label text-amber">Pay your way</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-ash">
              <li>Payfast · Ozow · SnapScan</li>
              <li>Instant EFT</li>
              <li>Cash on delivery (metro)</li>
              <li>PayJustNow — 3 x interest free</li>
            </ul>
          </div>
        </div>

        {/* oversized wordmark, cropped by the viewport edge */}
        <div className="overflow-hidden border-t border-hair pt-8" aria-hidden="true">
          <p className="whitespace-nowrap font-display text-[19vw] leading-[0.78] tracking-tighter text-carbon">
            GOODS2HOODS
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair py-6">
          <p className="label text-dim">
            © {new Date().getFullYear()} Goods2Hoods (Pty) Ltd · Prices incl. 15% VAT
          </p>
          <p className="label text-dim">Tokenised design system · WCAG 2.2 AA</p>
        </div>
      </div>
    </footer>
  )
}
