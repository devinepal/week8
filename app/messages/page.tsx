// app/messages/page.tsx — Server Component (Week 8: read path)
// Reads all messages directly from Postgres on the server.
// No useEffect, no fetch — just async/await in a Server Component.
// Renders HTML on the server; zero DB credentials reach the browser.

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Messages | Devi Nepal — Developer',
  description: 'Contact form submissions stored in Postgres via Prisma.',
}

// Force dynamic rendering so every request hits the DB fresh
// (no stale cached HTML showing missing records)
export const dynamic = 'force-dynamic'

function formatDate(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function MessagesPage() {
  // Read path — Prisma query runs on the server, result serialised to HTML
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <h1>Messages</h1>
          <p>Contact form submissions — stored in Postgres, read by a Server Component.</p>
        </div>
      </div>

      <section className="section">

        {/* Header row */}
        <div className="msgs-header">
          <div>
            <span className="section-label">Database</span>
            <h2 style={{ marginBottom: '.5rem' }}>
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </h2>
            <p style={{ fontSize: '.9rem' }}>
              Ordered newest first · max 50 shown ·{' '}
              <Link href="/contact">send a new message →</Link>
            </p>
          </div>
          <div className="msgs-badge">
            <span className="msgs-badge-dot" aria-hidden="true" />
            Postgres · Prisma ORM
          </div>
        </div>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="msgs-empty">
            <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📭</p>
            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '.25rem' }}>
              No messages yet
            </p>
            <p style={{ fontSize: '.9rem' }}>
              <Link href="/contact">Submit the contact form</Link> to create the first record.
            </p>
          </div>
        )}

        {/* Messages list */}
        {messages.length > 0 && (
          <ul className="msgs-list" aria-label="Submitted messages">
            {messages.map((m) => (
              <li key={m.id} className="msg-card">
                <div className="msg-top">
                  {/* Avatar initials */}
                  <div className="msg-avatar" aria-hidden="true">
                    {m.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="msg-meta">
                    <span className="msg-name">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="msg-email">{m.email}</a>
                  </div>
                  <div className="msg-id-time">
                    <span className="msg-id">#{m.id}</span>
                    <time
                      className="msg-time"
                      dateTime={m.createdAt.toISOString()}
                      title={m.createdAt.toISOString()}
                    >
                      {formatDate(m.createdAt)}
                    </time>
                  </div>
                </div>
                <p className="msg-body">{m.message}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Tech note */}
        <div className="msgs-tech-note">
          <span className="section-label" style={{ marginBottom: '.4rem', display: 'block' }}>
            How this page works
          </span>
          <p style={{ fontSize: '.875rem' }}>
            This is a <strong>Server Component</strong> — the Prisma query runs on the server,
            the result is serialised to HTML, and zero database credentials or ORM code
            reach the browser. Submitting the contact form calls a{' '}
            <strong>Server Action</strong> (<code>createMessage</code>) which writes to
            Postgres and then redirects here.
          </p>
        </div>

      </section>
    </>
  )
}
