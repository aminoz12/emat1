/**
 * Test script: send the order confirmation email to Espaceauto92000@gmail.com
 * Run from project root (with .env.local containing SMTP_* vars):
 *   npx tsx scripts/send-test-email.ts
 * Or with env vars set:
 *   SMTP_HOST=smtp.gmail.com SMTP_PASS=xxx npx tsx scripts/send-test-email.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local into process.env
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx === -1) return
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  })
  console.log('Loaded .env.local')
} else {
  console.warn('No .env.local found – ensure SMTP_HOST, SMTP_PASS, etc. are set in the environment')
}

const TEST_TO = 'Espaceauto92000@gmail.com'

async function main() {
  // Dynamic import so env is loaded first
  const { sendOrderConfirmationEmail } = await import('../lib/email')
  console.log('Sending test email to', TEST_TO, '...')
  const result = await sendOrderConfirmationEmail(TEST_TO)
  if (result.success) {
    console.log('✅ Email sent successfully to', TEST_TO)
  } else {
    console.error('❌ Failed:', result.error)
    process.exit(1)
  }
}

main()
