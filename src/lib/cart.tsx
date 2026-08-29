import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from './products'

export interface CartLine {
  key: string
  productId: string
  variant?: string
  qty: number
}

interface CartState {
  lines: CartLine[]
}

type CartAction =
  | { type: 'add'; productId: string; variant?: string; qty: number }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] }

const STORAGE_KEY = 'g2h.cart.v1'
const MAX_QTY = 10

const lineKey = (productId: string, variant?: string) =>
  variant ? `${productId}::${variant}` : productId

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return { lines: action.lines }
    case 'add': {
      const key = lineKey(action.productId, action.variant)
      const existing = state.lines.find((l) => l.key === key)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.qty) } : l,
          ),
        }
      }
      return {
        lines: [
          ...state.lines,
          { key, productId: action.productId, variant: action.variant, qty: Math.min(MAX_QTY, action.qty) },
        ],
      }
    }
    case 'setQty': {
      if (action.qty <= 0) return { lines: state.lines.filter((l) => l.key !== action.key) }
      return {
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l,
        ),
      }
    }
    case 'remove':
      return { lines: state.lines.filter((l) => l.key !== action.key) }
    case 'clear':
      return { lines: [] }
    default:
      return state
  }
}

export interface ResolvedLine extends CartLine {
  product: Product
  lineTotal: number
}

interface CartContextValue {
  lines: ResolvedLine[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  add: (productId: string, variant?: string, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  lastAdded: string | null
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[]
        if (Array.isArray(parsed)) {
          dispatch({
            type: 'hydrate',
            lines: parsed.filter((l) => products.some((p) => p.id === l.productId)),
          })
        }
      }
    } catch {
      /* storage unavailable — cart stays in memory */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines))
    } catch {
      /* quota or privacy mode — ignore */
    }
  }, [state.lines, hydrated])

  const lines = useMemo<ResolvedLine[]>(
    () =>
      state.lines
        .map((l) => {
          const product = products.find((p) => p.id === l.productId)
          if (!product) return null
          return { ...l, product, lineTotal: product.price * l.qty }
        })
        .filter((l): l is ResolvedLine => l !== null),
    [state.lines],
  )

  const add = useCallback((productId: string, variant?: string, qty = 1) => {
    dispatch({ type: 'add', productId, variant, qty })
    setLastAdded(productId)
    window.setTimeout(() => setLastAdded((cur) => (cur === productId ? null : cur)), 1600)
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      setQty: (key, qty) => dispatch({ type: 'setQty', key, qty }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      lastAdded,
    }),
    [lines, isOpen, add, lastAdded],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
