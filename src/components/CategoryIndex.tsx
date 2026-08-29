import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { categories } from '../lib/products'

/**
 * Printed-catalogue index. On fine pointers a preview plate trails the cursor;
 * on touch and reduced-motion the same information is carried by an inline
 * thumbnail, so nothing is hover-only.
 */
export function CategoryIndex() {
  const [active, setActive] = useState<number | null>(null)
  const plateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (!fine || reduced) return

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0 }
    pos.tx = pos.x
    pos.ty = pos.y
    let raf = 0

    const onMove = (event: PointerEvent) => {
      pos.tx = event.clientX
      pos.ty = event.clientY
    }

    const loop = () => {
      pos.x += (pos.tx - pos.x) * 0.13
      pos.y += (pos.ty - pos.y) * 0.13
      if (plateRef.current) {
        plateRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        ref={plateRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-30 hidden h-64 w-52 border border-hair-lit bg-carbon transition-opacity duration-300 lg:block ${
          active === null ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {categories.map((c, i) => (
          <img
            key={c.id}
            src={c.image}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
              active === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <ul className="border-t border-hair">
        {categories.map((c, i) => (
          <li key={c.id}>
            <Link
              to={`/shop?category=${c.id}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group flex items-center gap-4 border-b border-hair py-5 transition-colors duration-200 hover:bg-carbon sm:gap-8 sm:py-7"
            >
              <span className="label tnum w-8 shrink-0 pl-1 text-dim transition-colors duration-200 group-hover:text-amber">
                {c.index}
              </span>

              <img
                src={c.image}
                alt=""
                loading="lazy"
                className="size-12 shrink-0 border border-hair object-cover grayscale transition-all duration-300 group-hover:grayscale-0 sm:size-14 lg:hidden"
              />

              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl leading-[0.9] text-bone transition-all duration-300 ease-[cubic-bezier(0.16,0.84,0.28,1)] group-hover:translate-x-2 group-hover:text-amber sm:text-3xl lg:text-4xl">
                  {c.name}
                </span>
                <span className="mt-1.5 hidden text-sm text-ash sm:block">{c.blurb}</span>
              </span>

              <span className="label tnum hidden shrink-0 text-ash sm:block">{c.range}</span>

              <ArrowUpRight
                className="size-5 shrink-0 text-dim transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-amber"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
