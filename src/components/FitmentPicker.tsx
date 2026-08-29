import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Smartphone } from 'lucide-react'
import { deviceBrands } from '../lib/products'
import { useDevice } from '../lib/device'
import { Button } from './Button'

/**
 * Two-step fitment gate. Brand, then model, then straight into a filtered
 * catalogue. Selection persists so the rest of the site can flag exact fits.
 */
export function FitmentPicker({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const { model, setModel } = useDevice()
  const [brandId, setBrandId] = useState<string | null>(
    () => deviceBrands.find((b) => model && b.models.includes(model))?.id ?? null,
  )

  const brand = deviceBrands.find((b) => b.id === brandId)

  return (
    <div className={compact ? '' : 'border border-hair bg-ink p-5 sm:p-8'}>
      <div className="flex items-center gap-3">
        <Smartphone className="size-4 text-amber" aria-hidden="true" />
        <span className="label text-ash">Step 01 — Make</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {deviceBrands.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBrandId(b.id === brandId ? null : b.id)}
            aria-pressed={brandId === b.id}
            className={`h-11 border px-4 font-sans text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
              brandId === b.id
                ? 'border-amber bg-amber text-void'
                : 'border-hair-lit text-bone hover:border-amber hover:text-amber'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className={`mt-7 transition-opacity duration-300 ${brand ? 'opacity-100' : 'opacity-40'}`}>
        <div className="flex items-center gap-3">
          <span className="label text-ash">Step 02 — Model</span>
        </div>

        {brand ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {brand.models.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                aria-pressed={model === m}
                className={`inline-flex h-11 items-center gap-2 border px-4 font-sans text-xs font-medium tracking-[0.04em] transition-colors duration-200 ${
                  model === m
                    ? 'border-mint bg-mint/12 text-mint'
                    : 'border-hair text-ash hover:border-hair-lit hover:text-bone'
                }`}
              >
                {model === m && <Check className="size-3.5" aria-hidden="true" />}
                {m}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-dim">Pick a make above to load its model list.</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-hair pt-6">
        <Button
          size="lg"
          disabled={!model}
          onClick={() => model && navigate(`/fitment?model=${encodeURIComponent(model)}`)}
        >
          {model ? `Show gear for ${model}` : 'Select a model'}
        </Button>
        {model && (
          <button
            type="button"
            onClick={() => {
              setModel(null)
              setBrandId(null)
            }}
            className="label text-dim underline decoration-hair-lit underline-offset-4 transition-colors duration-200 hover:text-bone"
          >
            Clear device
          </button>
        )}
      </div>
    </div>
  )
}
