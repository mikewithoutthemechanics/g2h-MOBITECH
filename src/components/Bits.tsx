import type { ReactNode } from 'react'
import { Star } from 'lucide-react'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'amber' | 'ember' | 'mint' | 'danger'
}) {
  const tones: Record<string, string> = {
    neutral: 'border-hair-lit text-ash',
    amber: 'border-amber/50 bg-amber/12 text-amber',
    ember: 'border-ember/50 bg-ember/14 text-ember-lit',
    mint: 'border-mint/40 bg-mint/10 text-mint',
    danger: 'border-danger/45 bg-danger/12 text-danger',
  }
  return (
    <span className={`label inline-flex items-center border px-2 py-1 ${tones[tone]}`}>{children}</span>
  )
}

export function Stars({ value, reviews }: { value: number; reviews: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-center gap-px" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`size-3 ${i < Math.round(value) ? 'fill-amber text-amber' : 'text-hair-lit'}`}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="sr-only">{value} out of 5 stars from {reviews} reviews.</span>
      <span className="label tnum text-ash">
        {value.toFixed(1)} · {reviews.toLocaleString('en-ZA')}
      </span>
    </span>
  )
}

/** Editorial section marker: index, rule, label. */
export function Mark({ index, label, right }: { index: string; label: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="label tnum text-amber">{index}</span>
      <span className="h-px flex-1 bg-hair" aria-hidden="true" />
      <span className="label text-ash">{label}</span>
      {right}
    </div>
  )
}

export function Price({
  value,
  was,
  size = 'md',
}: {
  value: number
  was?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }
  return (
    <span className="flex items-baseline gap-2.5">
      <span className={`font-display font-black leading-none tracking-tight text-bone tnum ${sizes[size]}`}>
        R{value.toLocaleString('en-ZA')}
      </span>
      {was && (
        <span className="label tnum text-dim line-through">R{was.toLocaleString('en-ZA')}</span>
      )}
    </span>
  )
}
