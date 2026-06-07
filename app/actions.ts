"use server";
// app/actions.ts
// ─── Week 8: Server Actions ─────────────────────────────────
//
// "use server" tells Next.js this module runs only on the server.
// The database password in .env.local / Vercel env vars NEVER reaches the browser.
//
// Called by the contact form via the HTML `action` prop (no fetch needed).

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMessage(formData: FormData) {
  // 1. Extract and sanitise values from the native FormData object
  const name    = String(formData.get('name')    ?? '').trim()
  const email   = String(formData.get('email')   ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  // 2. Basic server-side validation (client validation already ran, but
  //    server validation is the authoritative gate — never trust the client)
  const errors: string[] = []
  if (!name    || name.length < 2)              errors.push('Name must be at least 2 characters.')
  if (!email   || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required.')
  if (!message || message.length < 10)          errors.push('Message must be at least 10 characters.')

  if (errors.length > 0) {
    // In a full app you'd return errors to the form; for this assignment
    // the client-side validation gate means this path is rarely hit.
    throw new Error(errors.join(' '))
  }

  // 3. Write to Postgres via Prisma ORM
  await prisma.message.create({
    data: { name, email, message },
  })

  // 4. Revalidate the messages list page so it shows the new record
  revalidatePath('/messages')

  // 5. Redirect to the messages page so the user sees the record appear
  redirect('/messages')
}
