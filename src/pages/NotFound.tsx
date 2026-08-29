import { LinkButton } from '../components/Button'
import { ShaderCanvas } from '../components/ShaderCanvas'

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <ShaderCanvas className="absolute inset-0 -z-20 size-full" energy={0.6} seed={9.2} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-void/80" />
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-8">
        <p className="label text-amber">Error 404</p>
        <h1 className="mt-5 t-hero leading-[0.84]">
          This page took
          <br />
          a break.
        </h1>
        <p className="mt-6 max-w-md text-base text-ash">
          The link is dead. The catalogue is not — tempered glass still starts at R89.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton to="/shop" size="lg">
            Browse the catalogue
          </LinkButton>
          <LinkButton to="/" variant="outline" size="lg">
            Back home
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
