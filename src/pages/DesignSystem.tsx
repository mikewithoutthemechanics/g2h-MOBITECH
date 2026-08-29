import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, Check, Copy, Cpu, Minus, Plus, ShieldCheck, X } from 'lucide-react'
import { Button } from '../components/Button'
import { Mark } from '../components/Bits'

/* ------------------------------------------------------------------ utils */

const luminance = (hex: string) => {
  const clean = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(clean.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const INK = '#0d0e12'

/* ------------------------------------------------------------------- data */

const surfaceTokens = [
  { token: 'surface.void', value: '#08080a', use: 'Page floor, rails, overlays' },
  { token: 'surface.ink', value: '#0d0e12', use: 'Default panel and card fill' },
  { token: 'surface.carbon', value: '#14161b', use: 'Raised / hovered fill' },
  { token: 'surface.slate', value: '#1c1f26', use: 'Track fill only — never carries copy' },
  { token: 'border.hair', value: '#262a33', use: 'The editorial grid rule' },
  { token: 'border.hairLit', value: '#3b414e', use: 'Interactive border, hover' },
]

const textTokens = [
  { token: 'text.bone', value: '#f4efe6', use: 'Headlines and prices' },
  { token: 'text.ash', value: '#a9a49b', use: 'Body copy' },
  { token: 'text.dim', value: '#8a857d', use: 'Mono labels and meta' },
  { token: 'accent.amber', value: '#ffb300', use: 'Primary action, live values' },
  { token: 'accent.ember', value: '#e4561f', use: 'Secondary heat, emphasis' },
  { token: 'status.mint', value: '#4fcf94', use: 'Confirmed fit, savings, success' },
  { token: 'status.danger', value: '#ff6a5c', use: 'Errors, fitment mismatch' },
]

const typeScale = [
  { token: 'text.mono', px: 11, sample: '01 / CATALOGUE', cls: 'label text-bone' },
  { token: 'text.sm', px: 13, sample: 'Helper and legal copy', cls: 'text-sm text-ash' },
  { token: 'text.base', px: 15, sample: 'Body default — product copy', cls: 'text-base text-ash' },
  { token: 'text.lg', px: 17, sample: 'Lead paragraph', cls: 'text-lg text-ash' },
  { token: 'text.2xl', px: 26, sample: 'Card title', cls: 'font-display text-2xl text-bone' },
  { token: 'text.4xl', px: 48, sample: 'Section heading', cls: 'font-display text-4xl text-bone' },
  { token: 'text.6xl', px: 92, sample: 'Hero', cls: 'font-display text-6xl text-bone' },
]

const spacing = [
  ['space.1', 4],
  ['space.2', 8],
  ['space.3', 12],
  ['space.4', 16],
  ['space.5', 20],
  ['space.6', 32],
  ['space.7', 48],
  ['space.8', 80],
] as const

const buttonStates = [
  {
    state: 'Default',
    rule: 'bg accent.amber, text surface.void, square corners, 44px min height',
    must: 'Label must name the outcome and, where money moves, the amount.',
  },
  {
    state: 'Hover',
    rule: 'bg → amber.lit, 200ms, diagonal sweep overlay',
    must: 'Hover must never be the only signal that something is interactive.',
  },
  {
    state: 'Focus-visible',
    rule: '2px accent.amber outline, 3px offset, drawn outside the box',
    must: 'Focus must never be removed or clipped by an overflow container.',
  },
  {
    state: 'Active',
    rule: 'Sweep completes, fill holds',
    must: 'Press feedback must resolve inside motion.instant (150ms).',
  },
  {
    state: 'Disabled',
    rule: 'opacity 40%, pointer-events none',
    must: 'A disabled control must be paired with visible text saying what is missing.',
  },
  {
    state: 'Loading',
    rule: 'Spinner + aria-busy="true", width locked before entry',
    must: 'Loading must block duplicate submits, not merely dim the control.',
  },
  {
    state: 'Error',
    rule: 'Message below the control, role="alert"',
    must: 'Error text must state the fix, not just the failure.',
  },
]

const fieldStates = [
  ['Default', '1px border.hair on surface.void, 48px height, persistent label above'],
  ['Hover', 'border → border.hairLit'],
  ['Focus-visible', 'Global amber ring at 3px offset; border shifts to amber'],
  ['Filled', 'text.bone at text.base'],
  ['Disabled', 'opacity 40%, aria-disabled; label keeps full contrast'],
  ['Loading', 'Field is read-only; the submit button owns the spinner'],
  ['Error', 'border status.danger, aria-invalid="true", aria-describedby to the message'],
]

const shaderRules = [
  { level: 'must' as const, text: 'The canvas must carry aria-hidden="true" and never hold content, controls or contrast responsibility.' },
  { level: 'must' as const, text: 'Text over the shader must sit on its own scrim so the measured ratio is independent of the animation frame.' },
  { level: 'must' as const, text: 'Under prefers-reduced-motion the engine must render exactly one static frame and never schedule a rAF loop.' },
  { level: 'must' as const, text: 'Rendering must pause when the tab is hidden or the canvas leaves the viewport, via IntersectionObserver.' },
  { level: 'must' as const, text: 'A failed WebGL context must fall back to a static CSS gradient of the same palette, not a blank surface.' },
  { level: 'must' as const, text: 'webglcontextlost must be handled: cancel the loop, keep the last frame, never throw.' },
  { level: 'should' as const, text: 'Device pixel ratio should be capped at 1.75 — mid-range Android is the reference device, not a desktop GPU.' },
  { level: 'should' as const, text: 'Pointer response should be damped (lerp ≈ 0.055) so the field drifts rather than snaps.' },
  { level: 'should' as const, text: 'No more than two live canvases per route; additional atmosphere should use CSS.' },
]

const a11yCriteria = [
  { id: 'A11Y-01', criterion: 'All text clears 4.5:1; display type ≥ 24px clears 3:1.', check: 'Axe scan on /, /shop, /fitment, /product/:id, /checkout returns zero contrast violations.' },
  { id: 'A11Y-02', criterion: 'Every interactive element shows a visible focus ring.', check: 'Tab each route; the amber ring is visible on 100% of stops, including inside overlays.' },
  { id: 'A11Y-03', criterion: 'Cart, search and menu overlays trap focus and restore it.', check: 'Open each, Tab past the last control → focus wraps. Esc closes and returns focus to the trigger.' },
  { id: 'A11Y-04', criterion: 'Icon-only controls carry an accessible name.', check: 'Screen reader announces "Add Armour Grip Rugged Case to cart", not "button".' },
  { id: 'A11Y-05', criterion: 'Form errors are linked and announced.', check: 'Submit an empty checkout: focus moves to the first invalid field; each message has role="alert".' },
  { id: 'A11Y-06', criterion: 'Touch targets are at least 44 x 44 CSS px.', check: 'Measure steppers, add buttons and nav chips at 375px width.' },
  { id: 'A11Y-07', criterion: 'Dynamic values are announced without stealing focus.', check: 'Quantity and result counts update an aria-live="polite" region; focus stays put.' },
  { id: 'A11Y-08', criterion: 'All motion respects prefers-reduced-motion.', check: 'Enable reduce-motion: shader freezes, rails stop, reveals resolve instantly.' },
  { id: 'A11Y-09', criterion: 'Pages zoom to 200% without loss of content.', check: 'Zoom to 200% at 1280px: no horizontal scroll, no clipped price or CTA.' },
  { id: 'A11Y-10', criterion: 'Colour is never the only carrier of meaning.', check: 'Fitment verdicts pair colour with an icon and explicit wording.' },
  { id: 'A11Y-11', criterion: 'Nothing critical is hover-only.', check: 'With a touch device, category images, prices and CTAs are all reachable without hover.' },
]

const contentRules = [
  { do: '"Add to cart — R149"', dont: '"Click here"', why: 'Actions name the outcome and the amount.' },
  { do: '"Enter a 10-digit SA mobile number, for example 0821234567"', dont: '"Invalid input"', why: 'Errors state the fix in the local format.' },
  { do: '"Only 22 left in the Cape Town warehouse"', dont: '"Hurry! Almost gone!!!"', why: 'Urgency must be countable and true.' },
  { do: '"Not cut for the Galaxy A54. See what does fit."', dont: '"May not be compatible"', why: 'A verdict beats a hedge; always offer the next step.' },
  { do: '"Ships in 2–4 working days"', dont: '"Fast delivery"', why: 'Quantify in units the buyer can plan around.' },
]

const antiPatterns = [
  'Raw hex in component code. Every colour resolves to a semantic token.',
  'outline: none without a replacement of equal or greater visibility.',
  'One-off spacing such as p-[13px]. Use the eight-step scale.',
  'Placeholder text as the only label — it disappears on input.',
  'Centred hero with a paragraph and two pill buttons. Break the grid instead.',
  'Evenly weighted icon-card triplets standing in for real content.',
  'Rounded-everything surfaces. This system is square by default; the cut corner is the only exception.',
  'Purple-on-white gradient washes, or any palette not derived from the tokens.',
  'Hover-only reveal of price, stock or CTA — unreachable on touch.',
  'A decorative canvas that blocks pointer events or holds text.',
  'Cart badge rendering an empty string at zero instead of "0".',
  'Truncated product names with no full accessible name preserved.',
]

const densityInventory = [
  { component: 'Buttons', count: 43, rule: 'One primary per viewport. Everything else outline or ghost.' },
  { component: 'Links', count: 7, rule: 'Descriptive out of context; underline on hover at 4px offset.' },
  { component: 'Inputs', count: 1, rule: 'Newsletter capture. Persistent label, submit-time validation, one message.' },
  { component: 'Navigation', count: 1, rule: 'One primary landmark; the mobile overlay mirrors its order exactly.' },
]

const qaChecklist = [
  'Every colour, size and radius in the diff resolves to a token.',
  'All seven states exist for each new interactive component.',
  'Keyboard-only pass completes fitment → add to cart → checkout → confirmation.',
  'Focus order matches visual order at every breakpoint.',
  'Cart, search and menu overlays each trap and restore focus.',
  'Axe reports zero critical or serious issues on all six routes.',
  'Shader freezes under reduce-motion and pauses off-screen.',
  'WebGL-disabled browser still renders a complete, readable page.',
  'Long product names clamp without breaking card height.',
  'Empty states exist for cart, search, fitment and filtered results.',
  'Layout holds at 320px, 768px, 1024px and 1440px.',
  '200% zoom introduces no horizontal scroll.',
  'Currency renders with en-ZA grouping everywhere, including totals.',
]

/* -------------------------------------------------------------- fragments */

function Rule({ level, children }: { level: 'must' | 'should'; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-ash">
      <span
        className={`label mt-0.5 shrink-0 border px-1.5 py-0.5 ${
          level === 'must' ? 'border-amber/50 text-amber' : 'border-hair-lit text-dim'
        }`}
      >
        {level}
      </span>
      <span>{children}</span>
    </li>
  )
}

function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string
  index: string
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32 pt-16">
      <Mark index={index} label={title} />
      <h2 className="mt-8 t-sect leading-[0.88]">{title}</h2>
      {intro && <p className="mt-5 max-w-3xl text-base text-ash">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-hair bg-ink p-5 sm:p-6">
      <h3 className="label border-b border-hair pb-3 text-amber">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Swatch({ token, value, use }: { token: string; value: string; use: string }) {
  const ratio = contrast(value, INK)
  const pass = ratio >= 4.5
  return (
    <li className="border border-hair bg-void p-3">
      <div className="h-14 border border-hair" style={{ backgroundColor: value }} />
      <p className="label mt-3 text-bone">{token}</p>
      <p className="label mt-1 text-dim">{use}</p>
      <p className="label tnum mt-2">
        <span className={pass ? 'text-mint' : 'text-dim'}>{ratio.toFixed(2)}:1</span>{' '}
        <span className="text-dim">{pass ? 'AA text' : 'surface only'}</span>
      </p>
    </li>
  )
}

/* ------------------------------------------------------------------- page */

export default function DesignSystem() {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [demoQty, setDemoQty] = useState(1)

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).catch(() => undefined)
    setCopied(value)
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1400)
  }

  const progress = Math.round((checked.size / qaChecklist.length) * 100)

  const toc = useMemo(
    () => [
      ['context', 'Context'],
      ['tokens', 'Tokens'],
      ['components', 'Components'],
      ['surface', 'WebGL surface'],
      ['accessibility', 'Accessibility'],
      ['content', 'Content'],
      ['anti-patterns', 'Anti-patterns'],
      ['qa', 'QA'],
    ],
    [],
  )

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-8">
      <header className="pt-12">
        <Mark index="—" label="Design system v2.0" />
        <h1 className="mt-8 max-w-4xl t-page leading-[0.86]">
          Implementation-ready UI guidance
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ash">
          <span className="text-bone">Design intent:</span> a dark, instrument-grade commerce surface
          where price, fitment and dispatch truth are always the loudest things on screen, and every
          decorative layer is provably optional.
        </p>

        <div className="mt-8 flex max-w-2xl items-start gap-3 border border-amber/40 bg-amber/6 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
          <p className="text-sm text-ash">
            <span className="text-bone">Extraction diagnostics:</span> audience and product-surface
            inference confidence is low. The brand context below is a working assumption — verify it
            with the commerce team before treating it as canon.
          </p>
        </div>

        <nav aria-label="On this page" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {toc.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="label inline-flex border border-hair px-3 py-2 text-ash transition-colors duration-200 hover:border-amber hover:text-amber"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* 01 */}
      <Section
        id="context"
        index="01"
        title="Context and goals"
        intro="Goods2Hoods sells R80–R500 phone accessories to price-sensitive, brand-aware South African buyers aged 18–45. The decision takes under 40 seconds, mostly on a mid-range Android over metered data."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="Primary goal">
            <p className="text-sm text-ash">
              Move a shopper from device to cart in three taps. Fitment is the gate: wrong model is
              the only reason accessories come back.
            </p>
          </Panel>
          <Panel title="Constraints">
            <p className="text-sm text-ash">
              360–414px first, metered data, and a catalogue where the cheapest line costs more than
              the delivery fee saves.
            </p>
          </Panel>
          <Panel title="Non-goals">
            <p className="text-sm text-ash">
              Configurators, personalisation engines and interstitials. They add friction to a
              category that wins on speed.
            </p>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Panel title="Known page component density">
            <table className="w-full text-sm">
              <thead>
                <tr className="label text-left text-dim">
                  <th scope="col" className="pb-3 font-medium">Component</th>
                  <th scope="col" className="pb-3 font-medium">Count</th>
                  <th scope="col" className="pb-3 font-medium">Governing rule</th>
                </tr>
              </thead>
              <tbody>
                {densityInventory.map((row) => (
                  <tr key={row.component} className="border-t border-hair align-top">
                    <td className="py-3 pr-3 text-bone">{row.component}</td>
                    <td className="tnum py-3 pr-3 font-display text-xl text-amber">{row.count}</td>
                    <td className="py-3 text-ash">{row.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Migration notes — v1 to v2">
            <ul className="grid gap-3">
              <Rule level="must">
                The light paper theme is retired. v1 surface tokens map to{' '}
                <code className="text-bone">surface.void / ink / carbon</code>; no component may
                render a light background.
              </Rule>
              <Rule level="must">
                <code className="text-bone">text.dim</code> shipped at{' '}
                <code className="text-bone">#6f6b64</code>, measured 3.64:1 and failing AA. It is now{' '}
                <code className="text-bone">#8a857d</code> at 5.27:1. Replace every legacy usage.
              </Rule>
              <Rule level="must">
                <code className="text-bone">accent.ember</code> shipped at{' '}
                <code className="text-bone">#d94f1e</code>, measuring 4.38:1 on surface.carbon. It is
                now <code className="text-bone">#e4561f</code> at 4.87:1.
              </Rule>
              <Rule level="must">
                Radius tokens are gone. Surfaces are square; the single sanctioned exception is the{' '}
                <code className="text-bone">.cut</code> corner on buy panels.
              </Rule>
              <Rule level="should">
                Inter is replaced by Chivo for UI, Big Shoulders Display for headlines and DM Mono for
                instrument labels. Mono is a label face and should never carry a sentence.
              </Rule>
            </ul>
          </Panel>
        </div>
      </Section>

      {/* 02 */}
      <Section
        id="tokens"
        index="02"
        title="Tokens and foundations"
        intro="Tokens are the only sanctioned source of visual values. Contrast ratios below are computed in the browser against surface.ink at render time, not copied from a spreadsheet."
      >
        <Panel title="Surfaces and rules">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {surfaceTokens.map((t) => (
              <li key={t.token} className="border border-hair bg-void p-3">
                <div className="h-14 border border-hair" style={{ backgroundColor: t.value }} />
                <p className="label mt-3 text-bone">{t.token}</p>
                <p className="label mt-1 text-dim">{t.use}</p>
                <button
                  type="button"
                  onClick={() => copy(t.token)}
                  className="label mt-2.5 inline-flex items-center gap-1.5 border border-hair px-2 py-1 text-dim transition-colors duration-200 hover:border-amber hover:text-amber"
                >
                  {copied === t.token ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied === t.token ? 'Copied' : 'Copy'}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="mt-4">
          <Panel title="Text and status — measured against surface.ink">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {textTokens.map((t) => (
                <Swatch key={t.token} token={t.token} value={t.value} use={t.use} />
              ))}
            </ul>
            <ul className="mt-6 grid gap-3">
              <Rule level="must">
                Every text token must clear 4.5:1 on surface.ink and surface.carbon — the only two
                surfaces permitted to carry copy. surface.slate is a track fill and must stay empty.
              </Rule>
              <Rule level="must">
                accent.amber and accent.ember must both carry surface.void as their foreground when
                used as a fill. Bone on ember measures 3.60:1 and is prohibited.
              </Rule>
              <Rule level="should">Amber should occupy under 8% of any viewport so the CTA keeps its pull.</Rule>
            </ul>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Type — Big Shoulders Display / Chivo / DM Mono">
            <ul>
              {typeScale.map((t) => (
                <li
                  key={t.token}
                  className="flex items-baseline justify-between gap-4 border-b border-hair py-3"
                >
                  <span className={`${t.cls} truncate`}>{t.sample}</span>
                  <span className="label tnum shrink-0 text-dim">
                    {t.token} · {t.px}px
                  </span>
                </li>
              ))}
            </ul>
            <ul className="mt-5 grid gap-3">
              <Rule level="must">Display type must be uppercase at 0.86 line height or tighter.</Rule>
              <Rule level="must">Prices must use the display face with tabular numerals.</Rule>
              <Rule level="must">Mono must be reserved for labels, indices and specs — never sentences.</Rule>
            </ul>
          </Panel>

          <div className="grid gap-4">
            <Panel title="Spacing — eight steps, no exceptions">
              <ul className="grid gap-2.5">
                {spacing.map(([token, px]) => (
                  <li key={token} className="flex items-center gap-3">
                    <span className="h-2.5 bg-amber" style={{ width: px }} aria-hidden="true" />
                    <span className="label text-bone">{token}</span>
                    <span className="label tnum text-dim">{px}px</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Geometry and motion">
              <div className="grid grid-cols-3 gap-3">
                <div className="label grid h-16 place-items-center border border-hair text-dim">square</div>
                <div className="cut label grid h-16 place-items-center border border-hair text-dim">.cut</div>
                <div className="hatch label grid h-16 place-items-center border border-hair text-dim">
                  hatch
                </div>
              </div>
              <ul className="mt-5 grid gap-3">
                <Rule level="must">State changes must run at 150–200ms on the brand easing curve.</Rule>
                <Rule level="must">Entrance reveals must be one orchestrated pass per view, not scattered.</Rule>
                <Rule level="should">Elevation should be expressed by a rule or a fill shift, not a soft shadow.</Rule>
              </ul>
            </Panel>
          </div>
        </div>
      </Section>

      {/* 03 */}
      <Section
        id="components"
        index="03"
        title="Component rules"
        intro="Anatomy, variants, the seven mandatory states, responsive behaviour and edge cases. A component ships only when every row is implemented."
      >
        <Panel title="Button — 43 instances on the marketing surface">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Add to cart — R149</Button>
            <Button variant="ember">Grid-free kit</Button>
            <Button variant="outline">Browse catalogue</Button>
            <Button variant="ghost">Keep shopping</Button>
            <Button disabled>Out of stock</Button>
            <Button loading>Placing order</Button>
          </div>
          <p className="label mt-4 text-dim">
            Anatomy: square container (44px min) · optional 16px icon · uppercase label at 0.1em
            tracking · optional trailing amount.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">Button state rules</caption>
              <thead>
                <tr className="label text-left text-dim">
                  <th scope="col" className="pb-3 font-medium">State</th>
                  <th scope="col" className="pb-3 font-medium">Token behaviour</th>
                  <th scope="col" className="pb-3 font-medium">Rule</th>
                </tr>
              </thead>
              <tbody>
                {buttonStates.map((row) => (
                  <tr key={row.state} className="border-t border-hair align-top">
                    <td className="py-3 pr-4 text-bone">{row.state}</td>
                    <td className="py-3 pr-4 text-dim">{row.rule}</td>
                    <td className="py-3 text-ash">{row.must}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <h4 className="label text-dim">Keyboard</h4>
              <ul className="mt-3 grid gap-3">
                <Rule level="must">Enter and Space both activate; it must be a real button element.</Rule>
                <Rule level="must">Loading keeps focus on the control rather than moving it.</Rule>
              </ul>
            </div>
            <div>
              <h4 className="label text-dim">Pointer</h4>
              <ul className="mt-3 grid gap-3">
                <Rule level="must">The hit area spans the container, not the label.</Rule>
                <Rule level="should">Cursor stays default on disabled controls.</Rule>
              </ul>
            </div>
            <div>
              <h4 className="label text-dim">Touch</h4>
              <ul className="mt-3 grid gap-3">
                <Rule level="must">44 x 44px minimum with 8px separation from neighbours.</Rule>
                <Rule level="must">No hover-dependent affordance; :active carries the feedback.</Rule>
              </ul>
            </div>
          </div>

          <div className="mt-6 border border-hair bg-void p-4">
            <h4 className="label text-dim">Responsive and edge cases</h4>
            <ul className="mt-3 grid gap-3">
              <Rule level="must">Below 480px paired CTAs stack full width with space.3 between them.</Rule>
              <Rule level="must">Labels never wrap to a third line; truncate the trailing amount first.</Rule>
              <Rule level="should">Width should lock before the loading state to prevent layout shift.</Rule>
            </ul>
          </div>
        </Panel>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Text field — 1 instance (newsletter)">
            <div className="grid gap-4">
              <div>
                <label htmlFor="demo-ok" className="label block text-ash">
                  Email address
                </label>
                <input
                  id="demo-ok"
                  type="email"
                  defaultValue="thabo@gmail.com"
                  className="mt-2 h-12 w-full border border-hair bg-void px-3.5 text-base text-bone hover:border-hair-lit"
                />
                <p className="label mt-2 text-dim">Filled · helper copy at text.mono</p>
              </div>
              <div>
                <label htmlFor="demo-error" className="label block text-ash">
                  Email address
                </label>
                <input
                  id="demo-error"
                  type="email"
                  defaultValue="thabo@"
                  aria-invalid="true"
                  aria-describedby="demo-error-msg"
                  className="mt-2 h-12 w-full border border-danger bg-void px-3.5 text-base text-bone"
                />
                <p id="demo-error-msg" className="label mt-2 text-danger">
                  Enter a valid email address, for example thabo@gmail.com
                </p>
              </div>
            </div>
            <ul className="mt-5">
              {fieldStates.map(([state, rule]) => (
                <li key={state} className="grid grid-cols-[104px_1fr] gap-3 border-t border-hair py-3">
                  <span className="label text-bone">{state}</span>
                  <span className="text-sm text-ash">{rule}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="grid gap-4">
            <Panel title="Quantity stepper">
              <div className="inline-flex h-12 items-center border border-hair">
                <button
                  type="button"
                  onClick={() => setDemoQty((q) => Math.max(1, q - 1))}
                  disabled={demoQty <= 1}
                  className="grid size-11 place-items-center text-ash transition-colors duration-200 hover:bg-carbon hover:text-bone disabled:opacity-30"
                >
                  <Minus className="size-4" aria-hidden="true" />
                  <span className="sr-only">Decrease demo quantity</span>
                </button>
                <span aria-live="polite" className="tnum w-10 text-center font-display text-xl text-bone">
                  {demoQty}
                </span>
                <button
                  type="button"
                  onClick={() => setDemoQty((q) => Math.min(10, q + 1))}
                  disabled={demoQty >= 10}
                  className="grid size-11 place-items-center text-ash transition-colors duration-200 hover:bg-carbon hover:text-bone disabled:opacity-30"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  <span className="sr-only">Increase demo quantity</span>
                </button>
              </div>
              <ul className="mt-5 grid gap-3">
                <Rule level="must">Bounds are enforced at 1 and 10; the bounding control disables, it never disappears.</Rule>
                <Rule level="must">The value sits in an aria-live="polite" region.</Rule>
                <Rule level="must">Each control carries a product-specific accessible name.</Rule>
              </ul>
            </Panel>

            <Panel title="Fitment picker">
              <ul className="grid gap-3">
                <Rule level="must">Selection must persist to local storage and be clearable from the same control.</Rule>
                <Rule level="must">Step two must stay visible but inert until step one resolves — never hidden.</Rule>
                <Rule level="must">Results must split exact-fit from universal, and label which is which.</Rule>
                <Rule level="must">A mismatch verdict must offer the route to compatible gear, never a dead end.</Rule>
                <Rule level="should">Pressed state should use aria-pressed rather than a visual-only highlight.</Rule>
              </ul>
            </Panel>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Product card">
            <ul className="grid gap-3">
              <Rule level="must">Anatomy is fixed: media 1:1 · index · badges · brand · name · fitment · rating · price · add control.</Rule>
              <Rule level="must">The card is one link target; the add control sits above it on its own layer.</Rule>
              <Rule level="must">Names clamp without discarding the accessible name; price never truncates.</Rule>
              <Rule level="must">Grid is two columns at 360px, three at 1280px, gap space.4.</Rule>
              <Rule level="should">Images lazy-load onto a carbon placeholder to avoid layout shift on 3G.</Rule>
              <Rule level="should">Stock warnings appear only under 30 units and always state the number.</Rule>
            </ul>
          </Panel>
          <Panel title="Overlays — cart, search, menu">
            <ul className="grid gap-3">
              <Rule level="must">role="dialog", aria-modal="true" and an accessible name on all three.</Rule>
              <Rule level="must">Focus moves in on open, cycles inside, and returns to the trigger on close.</Rule>
              <Rule level="must">Escape closes; the scrim is a real button with a label.</Rule>
              <Rule level="must">Body scroll locks on open and is restored exactly on close.</Rule>
              <Rule level="must">Every overlay has an empty state with a priced route back to the catalogue.</Rule>
              <Rule level="should">Free-delivery progress exposes role="progressbar" with min, max and now.</Rule>
            </ul>
          </Panel>
        </div>
      </Section>

      {/* 04 */}
      <Section
        id="surface"
        index="04"
        title="WebGL surface"
        intro="The animated field is a hand-rolled fragment shader on a single full-screen triangle. It is atmosphere, never interface — the page must be complete and readable if it never boots."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Contract">
            <div className="flex items-start gap-3 border border-hair bg-void p-4">
              <Cpu className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
              <p className="text-sm text-ash">
                Domain-warped fBm over a grid, coloured from{' '}
                <span className="text-bone">surface.void → accent.ember → accent.amber</span>, with a
                damped pointer charge. One program, one draw call, no external 3D library.
              </p>
            </div>
            <ul className="mt-5 grid gap-3">
              {shaderRules.map((rule) => (
                <Rule key={rule.text} level={rule.level}>
                  {rule.text}
                </Rule>
              ))}
            </ul>
          </Panel>

          <Panel title="Degradation ladder">
            <ol className="grid gap-3">
              {[
                ['01', 'Full', 'WebGL available, motion allowed — animated field at capped DPR.'],
                ['02', 'Static', 'prefers-reduced-motion — one rendered frame, loop never scheduled.'],
                ['03', 'Paused', 'Tab hidden or canvas off-screen — loop cancelled, frame retained.'],
                ['04', 'Fallback', 'No WebGL or context lost — CSS gradient in the same palette.'],
              ].map(([index, name, detail]) => (
                <li key={index} className="flex gap-4 border-t border-hair pt-3">
                  <span className="label tnum shrink-0 text-amber">{index}</span>
                  <span>
                    <span className="block text-sm text-bone">{name}</span>
                    <span className="block text-sm text-ash">{detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="label mt-5 text-dim">
              Acceptance: disable WebGL in the browser and every route must still pass the full QA
              checklist.
            </p>
          </Panel>
        </div>
      </Section>

      {/* 05 */}
      <Section
        id="accessibility"
        index="05"
        title="Accessibility criteria"
        intro="Target WCAG 2.2 AA. Each criterion is written so a reviewer can mark it pass or fail without interpretation."
      >
        <div className="overflow-x-auto border border-hair">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Accessibility acceptance criteria</caption>
            <thead className="bg-carbon">
              <tr className="label text-left text-dim">
                <th scope="col" className="px-4 py-3 font-medium">ID</th>
                <th scope="col" className="px-4 py-3 font-medium">Criterion (must)</th>
                <th scope="col" className="px-4 py-3 font-medium">Pass / fail check</th>
              </tr>
            </thead>
            <tbody className="bg-ink">
              {a11yCriteria.map((row) => (
                <tr key={row.id} className="border-t border-hair align-top">
                  <td className="label tnum px-4 py-3.5 text-amber">{row.id}</td>
                  <td className="px-4 py-3.5 text-bone">{row.criterion}</td>
                  <td className="px-4 py-3.5 text-ash">{row.check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-start gap-3 border border-mint/40 bg-mint/8 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden="true" />
          <p className="text-sm text-ash">
            A build that fails any criterion above must not ship, regardless of visual sign-off.
            Contrast and focus regressions are functional bugs.
          </p>
        </div>
      </Section>

      {/* 06 */}
      <Section
        id="content"
        index="06"
        title="Content and tone"
        intro="Concise, confident, implementation-focused. State the price, the timeframe and the condition. Nothing else earns the pixel."
      >
        <div className="overflow-x-auto border border-hair">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Content do and do not examples</caption>
            <thead className="bg-carbon">
              <tr className="label text-left text-dim">
                <th scope="col" className="px-4 py-3 font-medium">Do</th>
                <th scope="col" className="px-4 py-3 font-medium">Don't</th>
                <th scope="col" className="px-4 py-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody className="bg-ink">
              {contentRules.map((row) => (
                <tr key={row.do} className="border-t border-hair align-top">
                  <td className="px-4 py-3.5">
                    <span className="flex items-start gap-2.5 text-bone">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden="true" />
                      {row.do}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-start gap-2.5 text-dim">
                      <X className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                      {row.dont}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ash">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 07 */}
      <Section
        id="anti-patterns"
        index="07"
        title="Anti-patterns"
        intro="Anything on this list is a blocking review comment. There is no local-exception path."
      >
        <ul className="grid gap-3 md:grid-cols-2">
          {antiPatterns.map((item) => (
            <li key={item} className="flex items-start gap-3 border border-hair bg-ink p-4 text-sm text-ash">
              <X className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* 08 */}
      <Section
        id="qa"
        index="08"
        title="QA checklist"
        intro="Run before every merge. All thirteen must be green."
      >
        <div className="border border-hair bg-ink p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <p className="label text-ash tnum">
              {checked.size} of {qaChecklist.length} complete
            </p>
            <span className="tnum font-display text-4xl leading-none text-amber">{progress}%</span>
          </div>
          <div
            className="mt-4 h-1 bg-slate"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={qaChecklist.length}
            aria-valuenow={checked.size}
            aria-label="QA checklist progress"
          >
            <div
              className="h-full bg-mint transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="mt-6 grid gap-2">
            {qaChecklist.map((item, i) => (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-3 border border-hair bg-void p-3.5 text-sm text-ash transition-colors duration-200 hover:border-hair-lit">
                  <input
                    type="checkbox"
                    checked={checked.has(i)}
                    onChange={() => toggle(i)}
                    className="mt-0.5 size-4 accent-[#4fcf94]"
                  />
                  <span className={checked.has(i) ? 'text-dim line-through' : ''}>{item}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setChecked(new Set(qaChecklist.map((_, i) => i)))}>
              Mark all reviewed
            </Button>
            <Button variant="ghost" onClick={() => setChecked(new Set())}>
              Reset checklist
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
