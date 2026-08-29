import { useEffect, useRef, useState } from 'react'
import { mountShader, type ShaderHandle } from '../lib/gl'

interface Props {
  seed?: number
  energy?: number
  className?: string
}

/**
 * Decorative surface only — aria-hidden, never carries content or contrast
 * responsibility. Text above it always sits on its own scrim.
 */
export function ShaderCanvas({ seed = 0, energy = 0.35, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleRef = useRef<ShaderHandle | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const handle = mountShader(canvas, { seed, energy, reducedMotion })
    if (!handle) {
      setSupported(false)
      return
    }
    handleRef.current = handle
    return () => {
      handle.destroy()
      handleRef.current = null
    }
    // seed/energy are initial-only; energy updates go through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    handleRef.current?.setEnergy(energy)
  }, [energy])

  if (!supported) {
    return (
      <div
        aria-hidden="true"
        className={`${className} bg-[radial-gradient(120%_90%_at_20%_100%,rgba(217,79,30,0.35),transparent_58%),radial-gradient(90%_70%_at_85%_10%,rgba(255,179,0,0.16),transparent_60%),linear-gradient(180deg,#08080a,#120d14)]`}
      />
    )
  }

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
