import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { deviceBrands } from './products'

const KEY = 'g2h.device.v1'

interface DeviceContextValue {
  model: string | null
  brandName: string | null
  setModel: (model: string | null) => void
}

const DeviceContext = createContext<DeviceContextValue | null>(null)

const allModels = deviceBrands.flatMap((b) => b.models)

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [model, setModelState] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored && allModels.includes(stored)) setModelState(stored)
    } catch {
      /* storage blocked — selection stays in memory */
    }
  }, [])

  const setModel = useCallback((next: string | null) => {
    setModelState(next)
    try {
      if (next) localStorage.setItem(KEY, next)
      else localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<DeviceContextValue>(() => {
    const brand = model ? deviceBrands.find((b) => b.models.includes(model)) : undefined
    return { model, brandName: brand?.name ?? null, setModel }
  }, [model, setModel])

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}

export function useDevice() {
  const ctx = useContext(DeviceContext)
  if (!ctx) throw new Error('useDevice must be used inside DeviceProvider')
  return ctx
}
