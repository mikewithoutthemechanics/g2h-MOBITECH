import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Smartphone } from 'lucide-react'
import { FitmentPicker } from '../components/FitmentPicker'
import { ProductCard } from '../components/ProductCard'
import { Mark } from '../components/Bits'
import { LinkButton } from '../components/Button'
import { Reveal } from '../components/motion'
import { deviceBrands, forDevice, isUniversal } from '../lib/products'
import { useDevice } from '../lib/device'

const allModels = deviceBrands.flatMap((b) => b.models)

export default function Fitment() {
  const [params] = useSearchParams()
  const { model, setModel } = useDevice()
  const paramModel = params.get('model')

  useEffect(() => {
    if (paramModel && allModels.includes(paramModel) && paramModel !== model) {
      setModel(paramModel)
    }
  }, [paramModel, model, setModel])

  const results = useMemo(() => (model ? forDevice(model) : []), [model])
  const exact = results.filter((p) => !isUniversal(p))
  const universal = results.filter(isUniversal)

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-8">
      <Mark index="—" label="Fitment" />

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="t-page leading-[0.86]">
            What are you
            <br />
            carrying?
          </h1>
          <p className="mt-6 max-w-md text-base text-ash">
            Pick your make and model. We split the catalogue into gear cut for your exact device and
            gear that fits anything with a charging port.
          </p>

          {model && (
            <div className="mt-8 flex items-center gap-3 border border-mint/40 bg-mint/8 px-4 py-3.5">
              <Check className="size-4 shrink-0 text-mint" aria-hidden="true" />
              <p className="text-sm text-bone">
                Saved. We'll flag exact fits for the{' '}
                <span className="text-mint">{model}</span> across the site.
              </p>
            </div>
          )}

          <div className="mt-8">
            <FitmentPicker compact />
          </div>
        </div>

        <div className="lg:col-span-7">
          {!model ? (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center border border-dashed border-hair-lit p-10 text-center">
              <Smartphone className="size-8 text-dim" aria-hidden="true" />
              <p className="mt-5 font-display text-3xl leading-none text-bone">No device set</p>
              <p className="mt-3 max-w-xs text-sm text-ash">
                Choose a make and model on the left and the matching catalogue loads here.
              </p>
              <div className="mt-6">
                <LinkButton to="/shop" variant="outline">
                  Skip — browse everything
                </LinkButton>
              </div>
            </div>
          ) : (
            <div className="grid gap-10">
              <div>
                <div className="flex items-baseline justify-between gap-4 border-b border-hair pb-3">
                  <h2 className="font-display text-2xl leading-none text-bone">Cut for your device</h2>
                  <span className="label tnum text-mint" aria-live="polite">
                    {exact.length} items
                  </span>
                </div>
                {exact.length === 0 ? (
                  <p className="mt-5 text-sm text-ash">
                    Nothing model-specific for the {model} yet. The universal range below still
                    covers charging, audio, power and mounts.
                  </p>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {exact.map((product, i) => (
                      <Reveal key={product.id} delay={i * 60}>
                        <ProductCard product={product} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-4 border-b border-hair pb-3">
                  <h2 className="font-display text-2xl leading-none text-bone">Fits anything</h2>
                  <span className="label tnum text-ash">{universal.length} items</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-3">
                  {universal.slice(0, 9).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-6">
                  <LinkButton to="/shop" variant="outline">
                    See the full catalogue
                  </LinkButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
