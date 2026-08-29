import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Lock, PackageCheck } from 'lucide-react'
import { useCart } from '../lib/cart'
import { zar, FREE_DELIVERY_THRESHOLD } from '../lib/format'
import { Button, LinkButton } from '../components/Button'
import { Mark } from '../components/Bits'

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
]

const deliveryOptions = [
  { id: 'pudo', label: 'PUDO locker', copy: '2–4 working days · collect any time', fee: 60 },
  { id: 'courier', label: 'Door courier', copy: '1–3 working days · signature required', fee: 99 },
  { id: 'collect', label: 'Collect in Cape Town', copy: 'Ready in 4 hours · Salt River depot', fee: 0 },
]

const paymentOptions = [
  { id: 'payfast', label: 'Card via Payfast' },
  { id: 'ozow', label: 'Instant EFT (Ozow)' },
  { id: 'snapscan', label: 'SnapScan' },
  { id: 'cod', label: 'Cash on delivery (metro)' },
]

type Fields = {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  suburb: string
  city: string
  province: string
  postal: string
}

const empty: Fields = {
  firstName: '', lastName: '', email: '', phone: '',
  street: '', suburb: '', city: '', province: '', postal: '',
}

const labels: Record<keyof Fields, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  phone: 'Mobile number',
  street: 'Street address',
  suburb: 'Suburb',
  city: 'City / town',
  province: 'Province',
  postal: 'Postal code',
}

function validate(values: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {}
  if (!values.firstName.trim()) errors.firstName = 'Enter your first name.'
  if (!values.lastName.trim()) errors.lastName = 'Enter your last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'Enter a valid email, for example thabo@gmail.com'
  if (!/^0\d{9}$/.test(values.phone.replace(/\s/g, '')))
    errors.phone = 'Enter a 10-digit SA mobile number, for example 0821234567'
  if (!values.street.trim()) errors.street = 'Enter your street address.'
  if (!values.suburb.trim()) errors.suburb = 'Enter your suburb.'
  if (!values.city.trim()) errors.city = 'Enter your city or town.'
  if (!values.province) errors.province = 'Select a province.'
  if (!/^\d{4}$/.test(values.postal.trim())) errors.postal = 'Postal code must be 4 digits.'
  return errors
}

export default function Checkout() {
  const { lines, subtotal, clear } = useCart()
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [delivery, setDelivery] = useState('pudo')
  const [payment, setPayment] = useState('payfast')
  const [submitting, setSubmitting] = useState(false)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  const deliveryFee = useMemo(() => {
    const option = deliveryOptions.find((d) => d.id === delivery)!
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
    return option.fee
  }, [delivery, subtotal])

  const total = subtotal + deliveryFee

  const set = (key: keyof Fields, value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => {
      if (!e[key]) return e
      const next = { ...e }
      delete next[key]
      return next
    })
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      setOrderRef(`G2H-${Math.floor(100000 + Math.random() * 899999)}`)
      setSubmitting(false)
      clear()
    }, 850)
  }

  if (orderRef) {
    return (
      <section className="mx-auto max-w-[760px] px-4 py-24 sm:px-8">
        <div className="border border-hair bg-ink p-8 text-center sm:p-12">
          <PackageCheck className="mx-auto size-9 text-mint" aria-hidden="true" />
          <h1 className="mt-6 t-page leading-[0.86]">Order confirmed</h1>
          <p className="mt-5 text-base text-ash">
            Reference <span className="tnum text-amber">{orderRef}</span>. Confirmation is on its way
            to {values.email}. You'll get a tracking link the moment the parcel is scanned.
          </p>
          <dl className="mt-8 grid gap-px border border-hair bg-hair text-left sm:grid-cols-2">
            <div className="bg-ink px-5 py-4">
              <dt className="label text-dim">Delivery</dt>
              <dd className="mt-1 text-sm text-bone">
                {deliveryOptions.find((d) => d.id === delivery)?.label}
              </dd>
            </div>
            <div className="bg-ink px-5 py-4">
              <dt className="label text-dim">Paid with</dt>
              <dd className="mt-1 text-sm text-bone">
                {paymentOptions.find((p) => p.id === payment)?.label}
              </dd>
            </div>
          </dl>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LinkButton to="/shop" size="lg">
              Keep shopping
            </LinkButton>
            <LinkButton to="/" variant="outline" size="lg">
              Back home
            </LinkButton>
          </div>
        </div>
      </section>
    )
  }

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-[760px] px-4 py-28 text-center sm:px-8">
        <h1 className="t-page leading-[0.86]">Cart is empty</h1>
        <p className="mt-5 text-base text-ash">
          Add something first — tempered glass starts at R89 and ships in two days.
        </p>
        <div className="mt-8">
          <LinkButton to="/shop" size="lg">
            Browse the catalogue
          </LinkButton>
        </div>
      </section>
    )
  }

  const field = (key: keyof Fields, type = 'text', autoComplete?: string) => (
    <div>
      <label htmlFor={`field-${key}`} className="label block text-ash">
        {labels[key]}
      </label>
      <input
        id={`field-${key}`}
        type={type}
        value={values[key]}
        autoComplete={autoComplete}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `error-${key}` : undefined}
        className={`mt-2 h-12 w-full border bg-void px-3.5 text-base text-bone transition-colors duration-200 ${
          errors[key] ? 'border-danger' : 'border-hair hover:border-hair-lit focus:border-amber'
        }`}
      />
      {errors[key] && (
        <p id={`error-${key}`} role="alert" className="label mt-2 text-danger">
          {errors[key]}
        </p>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-8">
      <Mark index="—" label="Secure checkout" />
      <h1 className="mt-8 t-page leading-[0.86]">Checkout</h1>
      <p className="label mt-4 text-ash">
        {lines.length} line{lines.length === 1 ? '' : 's'} · secured by Payfast · no card details stored
      </p>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="grid gap-6 lg:col-span-7">
          <fieldset className="border border-hair bg-ink p-5 sm:p-6">
            <legend className="label px-2 text-amber">01 · Contact</legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {field('firstName', 'text', 'given-name')}
              {field('lastName', 'text', 'family-name')}
              {field('email', 'email', 'email')}
              {field('phone', 'tel', 'tel')}
            </div>
          </fieldset>

          <fieldset className="border border-hair bg-ink p-5 sm:p-6">
            <legend className="label px-2 text-amber">02 · Delivery address</legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">{field('street', 'text', 'address-line1')}</div>
              {field('suburb', 'text', 'address-line2')}
              {field('city', 'text', 'address-level2')}
              <div>
                <label htmlFor="field-province" className="label block text-ash">
                  Province
                </label>
                <select
                  id="field-province"
                  value={values.province}
                  onChange={(e) => set('province', e.target.value)}
                  aria-invalid={!!errors.province}
                  aria-describedby={errors.province ? 'error-province' : undefined}
                  className={`mt-2 h-12 w-full border bg-void px-3 text-base text-bone transition-colors duration-200 ${
                    errors.province ? 'border-danger' : 'border-hair hover:border-hair-lit'
                  }`}
                >
                  <option value="">Select a province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p id="error-province" role="alert" className="label mt-2 text-danger">
                    {errors.province}
                  </p>
                )}
              </div>
              {field('postal', 'text', 'postal-code')}
            </div>
          </fieldset>

          <fieldset className="border border-hair bg-ink p-5 sm:p-6">
            <legend className="label px-2 text-amber">03 · Delivery method</legend>
            <div className="mt-4 grid gap-3">
              {deliveryOptions.map((option) => {
                const free = subtotal >= FREE_DELIVERY_THRESHOLD || option.fee === 0
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3.5 border p-4 transition-colors duration-200 ${
                      delivery === option.id
                        ? 'border-amber bg-amber/6'
                        : 'border-hair hover:border-hair-lit'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={delivery === option.id}
                      onChange={() => setDelivery(option.id)}
                      className="mt-1 size-4 accent-[#ffb300]"
                    />
                    <span className="flex-1">
                      <span className="block text-base text-bone">{option.label}</span>
                      <span className="label mt-1 block text-dim">{option.copy}</span>
                    </span>
                    <span className="tnum font-display text-xl text-bone">
                      {free ? 'Free' : zar(option.fee)}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="border border-hair bg-ink p-5 sm:p-6">
            <legend className="label px-2 text-amber">04 · Payment</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 border p-4 text-sm transition-colors duration-200 ${
                    payment === option.id
                      ? 'border-amber bg-amber/6 text-bone'
                      : 'border-hair text-ash hover:border-hair-lit'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={payment === option.id}
                    onChange={() => setPayment(option.id)}
                    className="size-4 accent-[#ffb300]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-32">
          <div className="border border-hair bg-ink p-5 sm:p-6">
            <h2 className="label border-b border-hair pb-3 text-amber">Order summary</h2>
            <ul className="mt-4 grid gap-4">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3.5">
                  <img
                    src={line.product.image}
                    alt=""
                    className="size-14 shrink-0 border border-hair object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-bone">{line.product.name}</p>
                    <p className="label text-dim">
                      {line.variant ? `${line.variant} · ` : ''}Qty {line.qty}
                    </p>
                  </div>
                  <p className="tnum text-sm text-bone">{zar(line.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 grid gap-3 border-t border-hair pt-5">
              <div className="flex justify-between text-sm">
                <dt className="text-ash">Subtotal</dt>
                <dd className="tnum text-bone">{zar(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-ash">Delivery</dt>
                <dd className="tnum text-bone">{deliveryFee === 0 ? 'Free' : zar(deliveryFee)}</dd>
              </div>
              <div className="flex items-end justify-between border-t border-hair pt-4">
                <dt className="label text-ash">Total incl. VAT</dt>
                <dd className="tnum font-display text-4xl leading-none text-amber">{zar(total)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Button type="submit" size="lg" fullWidth loading={submitting}>
                {submitting ? 'Placing order' : `Pay ${zar(total)}`}
              </Button>
            </div>
            <p className="label mt-3 flex items-center justify-center gap-2 text-dim">
              <Lock className="size-3" aria-hidden="true" /> Encrypted · PCI-DSS compliant
            </p>

            <ul className="mt-5 grid gap-2.5 border-t border-hair pt-5">
              {[
                'Free delivery over R500',
                '30-day returns on unopened stock',
                '12-month warranty on everything',
              ].map((item) => (
                <li key={item} className="label flex items-center gap-2 text-dim">
                  <Check className="size-3 text-mint" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>

            <p className="label mt-5 text-dim">
              Need a change?{' '}
              <Link to="/shop" className="text-amber underline underline-offset-4">
                Back to the shop
              </Link>
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}
