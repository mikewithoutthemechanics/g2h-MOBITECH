import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'ember' | 'outline' | 'ghost' | 'bone'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group relative inline-flex items-center justify-center overflow-hidden font-sans font-bold ' +
  'uppercase tracking-[0.1em] leading-none transition-colors duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-40 select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-amber text-void hover:bg-amber-lit',
  ember: 'bg-ember text-void hover:bg-ember-lit',
  outline: 'border border-hair-lit text-bone hover:border-amber hover:text-amber',
  ghost: 'text-ash hover:text-bone',
  bone: 'bg-bone text-void hover:bg-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-[11px]',
  md: 'h-12 px-6 text-xs',
  lg: 'h-14 px-8 text-sm',
}

function Sweep({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/25 transition-transform duration-700 ease-[cubic-bezier(0.16,0.84,0.28,1)] group-hover:translate-x-[420%]"
    />
  )
}

interface Common {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <Sweep show={variant === 'primary' || variant === 'ember' || variant === 'bone'} />
      <span className="relative z-10 flex items-center gap-2.5">
        {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
        {children}
      </span>
    </button>
  )
}

interface LinkProps extends Common {
  to: string
  ariaLabel?: string
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ariaLabel,
  children,
}: LinkProps) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <Sweep show={variant === 'primary' || variant === 'ember' || variant === 'bone'} />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </Link>
  )
}
