import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'

function useInView<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-in')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -70px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}

/** Staggered rise. Delay is expressed in ms and applied via a CSS variable. */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useInView(ref)
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ '--rd': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  )
}

/** Headline line that wipes up from behind a rule. */
export function Wipe({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useInView(ref)
  return (
    <span className={`wipe-mask block ${className}`}>
      <span ref={ref} className="wipe block" style={{ '--rd': `${delay}ms` } as CSSProperties}>
        <span className="block">{children}</span>
      </span>
    </span>
  )
}
