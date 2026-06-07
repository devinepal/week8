// app/contact/page.tsx — Server Component (Week 8: wired to Server Action)
import type { Metadata } from 'next'
import { createMessage } from '@/app/actions'

export const metadata: Metadata = {
  title: 'Contact | Devi Nepal — Developer',
}

export default function ContactPage() {
  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <h1>Get in touch</h1>
          <p>I'd love to hear from you — projects, questions, or just a hello.</p>
        </div>
      </div>

      <div className="contact-wrap">
        {/* ── LEFT: form wired to Server Action ── */}
        <div>
          {/*
            action={createMessage} — Next.js passes the native FormData to the
            Server Action on the server. No fetch(), no API route, no client JS needed.
            This is the "use server" Server Action pattern from Week 8.
          */}
          <form action={createMessage} className="contact-form" noValidate>

            <div className="form-group">
              <label htmlFor="f-name">
                Name <span aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="f-name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                placeholder="Devi Nepal"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="f-email">
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                type="email"
                id="f-email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="f-message">
                Message <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="f-message"
                name="message"
                rows={6}
                required
                minLength={10}
                placeholder="Your message (at least 10 characters)…"
                aria-required="true"
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit
            </button>

          </form>
        </div>

        {/* ── RIGHT: info cards (unchanged from Week 6) ── */}
        <aside>
          <div className="info-card" style={{ marginBottom: '1rem' }}>
            <h4 style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem',
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '.75rem'
            }}>Direct contact</h4>
            <div className="info-row">
              <span className="info-label">Email</span>
              <a href="mailto:devinepal1976@gmail.com" className="info-val" style={{ fontSize: '.85rem' }}>
                devinepal1976@gmail.com
              </a>
            </div>
            <div className="info-row" style={{ marginTop: '.4rem' }}>
              <span className="info-label">Phone</span>
              <a href="tel:5629814178" className="info-val" style={{ fontSize: '.85rem' }}>
                (562) 981-4178
              </a>
            </div>
          </div>

          <div className="info-card">
            <h4 style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem',
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '.5rem'
            }}>Response time</h4>
            <p style={{ fontSize: '.875rem' }}>
              I typically reply within 24–48 hours on school days.
            </p>
          </div>

          <div className="info-card" style={{ marginTop: '1rem' }}>
            <h4 style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem',
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '.5rem'
            }}>Where data goes</h4>
            <p style={{ fontSize: '.875rem' }}>
              Messages are stored in a Postgres database via Prisma and
              visible on the <a href="/messages">messages page</a>.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
