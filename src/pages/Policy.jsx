import { Link, NavLink, useParams } from 'react-router-dom'
import { POLICIES, POLICY_LINKS } from '../content/policies.jsx'
import { BUSINESS } from '../content/business.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { useSettings } from '../context/ShopContext.jsx'
import NotFound from './NotFound.jsx'

export default function Policy() {
  const { page } = useParams()
  const policy = POLICIES[page]
  const settings = useSettings()
  useDocumentMeta({
    title: policy?.title || 'Policy not found',
    description: policy ? `${policy.summary} Aurie's ${policy.title.toLowerCase()} for candle orders across India.` : '',
    path: `/policies/${page}`,
    noindex: !policy,
  })
  if (!policy) return <NotFound />

  return (
    <div className="mx-auto grid max-w-[1100px] gap-10 px-5 pb-24 pt-10 lg:grid-cols-[220px_1fr] lg:px-8">
      <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
        <p className="label mb-3">Policies</p>
        <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:block lg:space-y-1 lg:px-0">
          {POLICY_LINKS.map(([slug, label]) => (
            <li key={slug} className="shrink-0">
              <NavLink
                to={`/policies/${slug}`}
                className={({ isActive }) =>
                  `block rounded-full px-3.5 py-1.5 text-[14px] transition-colors lg:rounded-lg ${
                    isActive ? 'bg-soot text-wax' : 'text-smoke hover:bg-wax hover:text-soot'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <article>
        <h1 className="font-display text-[36px] leading-tight text-soot sm:text-[44px]">{policy.title}</h1>
        <p className="mt-3 text-[17px] text-smoke">{policy.summary}</p>
        <p className="mt-2 text-[13px] text-smoke/80">Last updated {BUSINESS.policiesUpdated}</p>

        <div className="mt-10 space-y-9">
          {policy.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-[22px] text-soot">{s.h}</h2>
              <div className="prose-aurie mt-3">{typeof s.body === 'function' ? s.body(settings) : s.body}</div>
            </section>
          ))}
        </div>

        <p className="mt-14 rounded-2xl bg-wax p-5 text-[14px] text-ink">
          Questions about this? <Link to="/policies/contact" className="underline underline-offset-4">Contact us</Link> —
          we reply within a working day.
        </p>
      </article>
    </div>
  )
}
