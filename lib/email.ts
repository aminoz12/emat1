import nodemailer from 'nodemailer'

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'Contact@ematricule.fr'
const FROM_NAME = process.env.SMTP_FROM_NAME || 'E-matricule'

const ORDER_CONFIRMATION_HTML = `
<p>Bonjour,</p>
<p>Nous vous remercions pour votre commande.</p>
<p>Nous vous confirmons que votre commande a bien été reçue et est actuellement en cours de traitement par nos équipes.</p>
<p>Vous serez informé(e) par email dès que votre commande sera finalisée ou expédiée.</p>
<p>En cas de question ou de besoin d'information complémentaire, nous restons à votre entière disposition.</p>
<p>Nous vous remercions de votre confiance.</p>
<p>Cordialement,</p>
<p><strong>E-matricule</strong><br/>
<a href="mailto:Contact@ematricule.fr">Contact@ematricule.fr</a></p>
`.trim()

/**
 * Send order confirmation email to the client after payment.
 * Uses SMTP (env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 * From: Contact@ematricule.fr
 */
export async function sendOrderConfirmationEmail(to: string): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER || FROM_EMAIL
  const pass = process.env.SMTP_PASS

  if (!host || !pass) {
    console.error('SMTP not configured: SMTP_HOST and SMTP_PASS are required')
    return { success: false, error: 'SMTP non configuré' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: false,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'Confirmation de votre commande - E-matricule',
      html: ORDER_CONFIRMATION_HTML,
      text: ORDER_CONFIRMATION_HTML.replace(/<[^>]*>/g, '').trim(),
    })

    return { success: true }
  } catch (err: any) {
    console.error('Failed to send order confirmation email:', err)
    return { success: false, error: err?.message || 'Envoi email échoué' }
  }
}

const ORDER_COMPLETED_HTML = `
<p>Bonjour,</p>
<p>Nous avons le plaisir de vous informer que votre commande est désormais terminée.</p>
<p>Vous trouverez en pièces jointes les documents relatifs à votre commande.</p>
<p>Nous restons à votre disposition pour toute question ou information complémentaire et vous remercions pour la confiance que vous nous accordez.</p>
<p>Cordialement,</p>
<p><strong>E-matricule</strong><br/>
<a href="mailto:Contact@ematricule.fr">Contact@ematricule.fr</a></p>
`.trim()

/**
 * Send "order completed" email to the client with document attachment.
 * Uses SMTP (env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 * From: Contact@ematricule.fr
 */
export async function sendOrderCompletedWithAttachment(
  to: string,
  attachmentBuffer: Buffer,
  attachmentFileName: string
): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER || FROM_EMAIL
  const pass = process.env.SMTP_PASS

  if (!host || !pass) {
    console.error('SMTP not configured: SMTP_HOST and SMTP_PASS are required')
    return { success: false, error: 'SMTP non configuré' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: false,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'Votre commande est terminée - E-matricule',
      html: ORDER_COMPLETED_HTML,
      text: ORDER_COMPLETED_HTML.replace(/<[^>]*>/g, '').trim(),
      attachments: [
        {
          filename: attachmentFileName,
          content: attachmentBuffer,
        },
      ],
    })

    return { success: true }
  } catch (err: any) {
    console.error('Failed to send order completed email:', err)
    return { success: false, error: err?.message || 'Envoi email échoué' }
  }
}
