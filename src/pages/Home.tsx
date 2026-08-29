import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { ShaderCanvas } from '../components/ShaderCanvas'
import { Reveal, Wipe } from '../components/motion'
import { Mark, Price } from '../components/Bits'
import { Button, LinkButton } from '../components/Button'
import { ProductCard } from '../components/ProductCard'
import { CategoryIndex } from '../components/CategoryIndex'
import { FitmentPicker } from '../components/FitmentPicker'
import { products } from '../lib/products'
import { zar } from '../lib/format'

const tickerItems = [
  ['Tempered glass 2-pack', 89],
  ['L1R1 trigger buttons', 99],
  ['USB-C 60W braided', 119],
  ['3-in-1 fast cable', 139],
  ['Armour Grip case', 149],
  ['Magnetic vent mount', 159],
  ['Rechargeable bulbs', 189],
  ['10 000mAh power bank', 199],
  ['Case + glass bundle', 249],
  ['Pulse TWS earbuds', 299],
] as const

const notes = [
  {
    quote:
      'Ordered the case and glass bundle on Monday, collected from the PUDO locker in Soweto on Wednesday. Fits my A54 exactly.',
    name: 'Lerato M.',
    place: 'Johannesburg',
    tilt: '-1.1deg',
  },
  {
    quote:
      'The 20 000mAh bank ran my router and two phones through a full four-hour block. Best R429 I have spent this year.',
    name: 'Sipho D.',
    place: 'Durban',
    tilt: '0.8deg',
  },
  {
    quote:
      'Triggers and the cooling fan came to under R300 together. My K/D says thank you.',
    name: 'Ruan V.',
    place: 'Cape Town',
    tilt: '-0.6deg',
  },
]

const promises = [
  { icon: Truck, title: 'Two to four days', copy: 'PUDO lockers from R60, door courier R99, free over R500.' },
  { icon: ShieldCheck, title: 'Twelve-month cover', copy: 'Faulty gear is replaced, not argued about.' },
  { icon: RefreshCw, title: 'Thirty-day returns', copy: 'Wrong model? Send it back unopened, we swap it free.' },
  { icon: PackageCheck, title: 'Fitment checked', copy: 'Send your model on WhatsApp and we confirm before you pay.' },
]

export default function Home() {
  const railRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle')

  const drop = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8)
  const gridFree = products.filter((p) => p.category === 'loadshedding')

  const nudge = (direction: number) =>
    railRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
    setStatus(valid ? 'done' : 'error')
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════ 00 · HERO */}
      <section className="relative isolate overflow-hidden border-b border-hair">
        <ShaderCanvas className="absolute inset-0 -z-20 size-full" energy={0.42} seed={1.4} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#08080ae6_0%,#08080ab8_42%,transparent_78%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-void to-transparent"
        />

        <div className="mx-auto grid max-w-[1320px] items-end gap-12 px-4 pb-10 pt-14 sm:px-8 lg:min-h-[86vh] lg:grid-cols-12 lg:pb-14 lg:pt-20">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label flex items-center gap-3 text-amber">
                <span className="h-px w-10 bg-amber" aria-hidden="true" />
                Cape Town · Est. 2019 · Ships nationwide
              </p>
            </Reveal>

            <h1 className="mt-6 t-hero leading-[0.82]">
              <Wipe delay={80}>Keep</Wipe>
              <Wipe delay={180}>your phone</Wipe>
              <Wipe delay={280} className="text-amber">
                alive.
              </Wipe>
            </h1>

            <Reveal delay={420}>
              <p className="mt-8 max-w-xl text-lg text-ash">
                Cases, tempered glass, cables, power banks and light — engineered for potholes, dust,
                taxis and a grid that takes breaks. From{' '}
                <span className="text-bone">R80</span>, at your door in two to four days.
              </p>
            </Reveal>

            <Reveal delay={520}>
              <div className="mt-9 flex flex-wrap gap-3">
                <LinkButton to="/fitment" size="lg">
                  Find gear for my phone <ArrowRight className="size-4" aria-hidden="true" />
                </LinkButton>
                <LinkButton to="/shop" variant="outline" size="lg">
                  Browse the catalogue
                </LinkButton>
              </div>
            </Reveal>
          </div>

          {/* offset product plate — deliberately breaks the column grid */}
          <Reveal delay={620} className="lg:col-span-5">
            <div className="relative ml-auto w-full max-w-[380px]">
              <div className="absolute -left-4 -top-4 z-10 border border-amber bg-void px-3 py-2">
                <span className="label text-amber">Save R89</span>
              </div>
              <Link
                to="/product/case-glass-bundle"
                className="group block border border-hair-lit bg-ink/85 backdrop-blur-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/images/cases.jpg"
                    alt="Case and tempered glass bundle"
                    className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,0.84,0.28,1)] group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="label text-dim">Best pairing · outsells solo cases 2.3:1</p>
                  <p className="mt-2 font-display text-3xl leading-none text-bone group-hover:text-amber">
                    Case + glass bundle
                  </p>
                  <div className="mt-4 flex items-end justify-between border-t border-hair pt-4">
                    <Price value={249} was={338} size="sm" />
                    <ArrowUpRight
                      className="size-5 text-dim transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-amber"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* instrument strip */}
        <div className="relative border-t border-hair bg-void/70 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-[1320px] grid-cols-2 sm:grid-cols-4">
            {[
              ['29 000+', 'glass sheets shipped'],
              ['2–4 days', 'metro & regional'],
              ['4.6 / 5', 'from 38 412 reviews'],
              ['R80', 'entry price point'],
            ].map(([big, small], i) => (
              <div
                key={small}
                className={`px-4 py-5 sm:px-8 ${i > 0 ? 'sm:border-l sm:border-hair' : ''} ${
                  i % 2 === 1 ? 'border-l border-hair sm:border-l' : ''
                } ${i > 1 ? 'border-t border-hair sm:border-t-0' : ''}`}
              >
                <dt className="tnum font-display text-3xl leading-none text-bone">{big}</dt>
                <dd className="label mt-2 text-dim">{small}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ PRICE TICKER */}
      <div className="rail-host overflow-hidden border-b border-hair bg-amber py-2.5">
        <div className="rail-track flex w-max items-center gap-10">
          {[...tickerItems, ...tickerItems].map(([name, price], i) => (
            <span key={i} className="label flex items-center gap-3 whitespace-nowrap text-void">
              {name}
              <span className="tnum font-bold">{zar(price as number)}</span>
              <span className="text-void/40" aria-hidden="true">
                —
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ 01 · FITMENT */}
      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-8">
        <Mark index="01" label="Fitment gate" />
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="t-sect leading-[0.88]">
                Wrong model is the
                <br />
                <span className="text-ember">only</span> reason gear
                <br />
                gets returned.
              </h2>
              <p className="mt-6 max-w-md text-base text-ash">
                Tell us what you carry once. We filter the catalogue to what actually fits, flag exact
                matches on every card, and remember it for next time.
              </p>
              <ul className="mt-7 grid gap-3">
                {[
                  'Exact-fit items surface first',
                  'Universal gear is labelled, never guessed',
                  'Stored on this device only',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ash">
                    <span className="mt-2 size-1 shrink-0 bg-amber" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={120} className="lg:col-span-7">
            <FitmentPicker />
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ 02 · INDEX */}
      <section className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-8">
        <Mark index="02" label="The index" />
        <div className="mb-8 mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2 className="t-sect leading-[0.88]">
            Eight aisles.
            <br />
            Nothing over R500.
          </h2>
          <p className="max-w-sm text-sm text-ash">
            Every line solves one obvious problem and costs less than a takeaway for two.
          </p>
        </div>
        <CategoryIndex />
      </section>

      {/* ═════════════════════════════════════════════════════════ 03 · DROP */}
      <section className="border-y border-hair bg-ink py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
          <Mark index="03" label="Moving fastest" />
          <div className="mb-8 mt-8 flex flex-wrap items-end justify-between gap-6">
            <h2 className="t-sect leading-[0.88]">This week's repeat buys</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nudge(-1)}
                className="grid size-11 place-items-center border border-hair text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                <span className="sr-only">Scroll products left</span>
              </button>
              <button
                type="button"
                onClick={() => nudge(1)}
                className="grid size-11 place-items-center border border-hair text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
              >
                <ArrowRight className="size-4" aria-hidden="true" />
                <span className="sr-only">Scroll products right</span>
              </button>
              <LinkButton to="/shop" variant="outline" className="ml-2">
                All 29
              </LinkButton>
            </div>
          </div>

          <div
            ref={railRef}
            tabIndex={0}
            aria-label="Best selling products, horizontally scrollable"
            className="no-bar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            {drop.map((product, i) => (
              <div key={product.id} className="w-[260px] shrink-0 snap-start sm:w-[300px]">
                <ProductCard product={product} index={i + 1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ 04 · GRID-FREE */}
      <section className="relative isolate overflow-hidden border-b border-hair">
        <ShaderCanvas className="absolute inset-0 -z-20 size-full" energy={0.92} seed={5.1} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#08080af2_0%,#08080acc_35%,#08080af7_100%)]"
        />

        <div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-8">
          <Mark index="04" label="Grid-free range" />

          <div className="mt-10 grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="t-page leading-[0.84]">
                When the lights
                <br />
                <span className="flicker text-amber">go out,</span>
                <br />
                you don't.
              </h2>
              <p className="mt-7 max-w-md text-base text-ash">
                Banks that carry a fibre router. Bulbs that screw into the fitting you already own and
                keep glowing after the drop. A work light that doubles as a charger.
              </p>
              <ul className="mt-8 grid gap-3.5">
                {[
                  'Auto-switch bulbs — no wiring, no inverter',
                  'Four to eight hours of runtime per charge',
                  'Everything recharges over one USB-C cable',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-bone">
                    <BatteryCharging className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <LinkButton to="/shop?category=loadshedding" size="lg">
                  Shop grid-free
                </LinkButton>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
              {gridFree.map((product, i) => (
                <Reveal key={product.id} delay={i * 90}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ 05 · THE MATHS */}
      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-8">
        <Mark index="05" label="The maths" />
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="t-sect leading-[0.88]">
              R249 does what
              <br />
              R338 does.
            </h2>
            <p className="mt-6 max-w-md text-base text-ash">
              A bare screen costs about R2 400 to replace at a Cape Town repair counter. The bundle is
              roughly one tenth of one percent of that, and it ships in a single parcel on one
              delivery fee.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to="/product/case-glass-bundle" size="lg">
                Get the bundle
              </LinkButton>
              <LinkButton to="/product/loadshed-kit" variant="outline" size="lg">
                Grid-free kit — R499
              </LinkButton>
            </div>
          </div>

          <Reveal delay={100} className="lg:col-span-7">
            <div className="border border-hair bg-ink">
              <div className="hatch h-2 border-b border-hair" aria-hidden="true" />
              <dl className="divide-y divide-hair">
                {[
                  ['Armour Grip rugged case', 199],
                  ['9H tempered glass, 2-pack', 129],
                  ['Alignment tray + wipes', 10],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between px-5 py-4">
                    <dt className="text-sm text-ash">{label}</dt>
                    <dd className="tnum font-display text-xl text-bone">{zar(value as number)}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-carbon px-5 py-4">
                  <dt className="label text-dim">Bought separately</dt>
                  <dd className="tnum font-display text-2xl text-dim line-through">{zar(338)}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-5">
                  <dt className="label text-amber">Bundle price</dt>
                  <dd className="tnum font-display text-5xl leading-none text-amber">{zar(249)}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <dt className="label text-mint">You keep</dt>
                  <dd className="tnum font-display text-2xl text-mint">{zar(89)}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════ 06 · FIELD NOTES */}
      <section className="border-t border-hair bg-ink py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
          <Mark index="06" label="Field notes" />
          <h2 className="mb-10 mt-8 t-sect leading-[0.88]">
            What buyers say in week three
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {notes.map((note, i) => (
              <li key={note.name}>
                <Reveal delay={i * 110}>
                  <figure
                    className="flex h-full flex-col border border-hair bg-carbon p-6"
                    style={{ transform: `rotate(${note.tilt})` }}
                  >
                    <span className="font-display text-5xl leading-none text-amber" aria-hidden="true">
                      “
                    </span>
                    <blockquote className="mt-2 flex-1 text-base text-bone">{note.quote}</blockquote>
                    <figcaption className="label mt-6 border-t border-hair pt-4 text-dim">
                      {note.name} — {note.place}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>

          <ul className="mt-14 grid gap-px border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-4">
            {promises.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="bg-ink p-6">
                <Icon className="size-5 text-amber" aria-hidden="true" />
                <p className="mt-4 font-display text-2xl leading-none text-bone">{title}</p>
                <p className="mt-2.5 text-sm text-ash">{copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ 07 · DISPATCH */}
      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-8">
        <div className="grid items-stretch gap-px border border-hair bg-hair lg:grid-cols-2">
          <div className="bg-ink p-8 sm:p-12">
            <Mark index="07" label="Restock list" />
            <h2 className="mt-8 t-sect leading-[0.88]">
              Know before
              <br />
              it sells out.
            </h2>
            <p className="mt-5 max-w-md text-base text-ash">
              One email a week: new stock, price drops and bundle codes. No spam, unsubscribe in a
              single click.
            </p>

            <form onSubmit={submit} noValidate className="mt-8 max-w-md">
              <label htmlFor="newsletter-email" className="label block text-ash">
                Email address
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (status !== 'idle') setStatus('idle')
                  }}
                  placeholder="you@example.co.za"
                  aria-invalid={status === 'error'}
                  aria-describedby="newsletter-help"
                  className={`h-12 flex-1 border bg-void px-4 text-base text-bone placeholder:text-dim transition-colors duration-200 ${
                    status === 'error'
                      ? 'border-danger'
                      : 'border-hair-lit hover:border-ash focus:border-amber'
                  }`}
                />
                <Button type="submit" size="lg">
                  {status === 'done' ? 'On the list' : 'Notify me'}
                </Button>
              </div>
              <p
                id="newsletter-help"
                role={status === 'error' ? 'alert' : undefined}
                className={`label mt-3 ${
                  status === 'error' ? 'text-danger' : status === 'done' ? 'text-mint' : 'text-dim'
                }`}
              >
                {status === 'error'
                  ? 'Enter a valid email address, for example thabo@gmail.com'
                  : status === 'done'
                    ? `Done — ${email} is on the list`
                    : 'We only email about stock and pricing'}
              </p>
            </form>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-ink">
            <img
              src="/images/delivery.jpg"
              alt="Courier handing over a parcel"
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-55 grayscale"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
            />
            <dl className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-px bg-hair">
              {[
                ['R60', 'PUDO locker'],
                ['R99', 'Door courier'],
                ['R500+', 'Free delivery'],
                ['14:00', 'Dispatch cutoff'],
              ].map(([big, small]) => (
                <div key={small} className="bg-ink/95 px-5 py-4">
                  <dt className="tnum font-display text-2xl leading-none text-amber">{big}</dt>
                  <dd className="label mt-1.5 text-dim">{small}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
