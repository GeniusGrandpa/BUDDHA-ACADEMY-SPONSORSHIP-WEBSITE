import { formatNPR } from '../utils/currency'
import { getSupabaseClient } from '../lib/supabase'
const supabase = getSupabaseClient()

type EmailTemplate = 'donation-confirmation' | 'payment-verified' | 'sponsorship-confirmation' | 'teacher-update' | 'account-verification' | 'password-reset' | 'sponsorship-renewal' | 'volunteer-approved' | 'volunteer-event-signup' | 'contact-autoreply'

interface EmailPayload {
  to: string
  template: EmailTemplate
  data: Record<string, string | number | boolean | undefined>
}

export async function sendEmail(payload: EmailPayload) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Buddha Academy <noreply@buddhaacademy.org.np>',
        to: payload.to,
subject: getEmailSubject(payload.template),
        html: getEmailHtml(payload.template, payload.data),
      }),
    })

const result = await response.json()

    const subjectText = getEmailSubject(payload.template)
    await supabase.from('email_logs').insert({
      email_to: payload.to,
      email_type: payload.template,
      subject: subjectText,
      body: getEmailHtml(payload.template, payload.data),
      status: response.ok ? 'sent' : 'failed',
      error_message: response.ok ? null : (result as Record<string, unknown>).message as string | undefined || 'Unknown error',
      sent_at: response.ok ? new Date().toISOString() : null,
    })

    return { success: response.ok, error: result.message }
  } catch (error) {
    await supabase.from('email_logs').insert({
      email_to: payload.to,
      email_type: payload.template,
      subject: getEmailSubject(payload.template, payload.data),
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Network error',
    })
    return { success: false, error: 'Failed to send email' }
  }
}

function getEmailSubject(template: EmailTemplate): string {
  const subjects: Record<EmailTemplate, string> = {
    'donation-confirmation': `Thank You for Your Donation - Buddha Academy`,
    'payment-verified': `Your Payment Has Been Verified - Buddha Academy`,
    'sponsorship-confirmation': `Welcome to the Buddha Academy Family!`,
    'teacher-update': `Progress Update for Your Sponsored Student`,
    'account-verification': `Verify Your Email - Buddha Academy`,
    'password-reset': `Reset Your Password - Buddha Academy`,
    'sponsorship-renewal': `Your Sponsorship is Ready for Renewal`,
    'volunteer-approved': `Welcome to Our Volunteer Team!`,
    'volunteer-event-signup': `Event Signup Confirmed - Buddha Academy`,
    'contact-autoreply': `We Received Your Message - Buddha Academy`,
  }
  return subjects[template]
}

function getEmailHtml(template: EmailTemplate, data: Record<string, string | number | boolean | undefined>): string {
  const baseStyle = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0; }
      .header img { max-width: 120px; margin-bottom: 12px; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
      .header p { color: #d1fae5; margin: 8px 0 0; font-size: 14px; }
      .body { background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .body h2 { color: #065f46; font-size: 20px; margin: 0 0 16px; }
      .body p { color: #4b5563; line-height: 1.6; margin: 0 0 12px; font-size: 15px; }
      .details { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 16px 0; }
      .details table { width: 100%; }
      .details td { padding: 6px 0; color: #374151; font-size: 14px; }
      .details td:last-child { text-align: right; font-weight: 600; color: #065f46; }
      .button { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
      .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
      .footer a { color: #059669; text-decoration: none; }
      .highlight { color: #059669; font-weight: 600; }
      .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    </style>
  `

  const footer = `
    <div class="footer">
      <div style="margin-bottom: 12px;">
        <strong style="color: #065f46;">Buddha Academy</strong><br>
        <span style="color: #6b7280;">Kathmandu, Nepal</span>
      </div>
      <p style="margin: 0;">
        <a href="${import.meta.env.VITE_APP_URL || 'https://buddhaacademy.org.np'}">Visit our website</a> &middot;
        <a href="mailto:info@buddhaacademy.org.np">Contact us</a>
      </p>
      <p style="margin: 8px 0 0; font-size: 12px;">
        You are receiving this email because of your involvement with Buddha Academy.
        <br>If you have questions, please reply to this email.
      </p>
    </div>
  `

  const templates: Record<EmailTemplate, string> = {
    'donation-confirmation': `
      <div class="body">
        <h2>Thank You for Your Generosity</h2>
        <p>Dear ${data.donorName || 'Friend'},</p>
        <p>Thank you for your donation of <span class="highlight">${formatNPR(Number(data.amount))}</span> to Buddha Academy.</p>
        <p>Your contribution will directly support the education, meals, and well-being of children at our school. Every rupee makes a difference in shaping a brighter future.</p>
        <div class="details">
          <table>
            <tr><td>Donation Amount</td><td>${formatNPR(Number(data.amount))}</td></tr>
            <tr><td>Transaction ID</td><td>${data.transactionId || 'Pending'}</td></tr>
            <tr><td>Date</td><td>${new Date().toLocaleDateString()}</td></tr>
            <tr><td>Status</td><td>${data.status || 'Processing'}</td></tr>
          </table>
        </div>
        <p>Your donation will be allocated to our most pressing needs, including educational materials, student meals, and school supplies.</p>
        <p>With gratitude,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'payment-verified': `
      <div class="body">
        <h2>Payment Successfully Verified</h2>
        <p>Dear ${data.donorName || 'Friend'},</p>
        <p>Great news! Your payment of <span class="highlight">${formatNPR(Number(data.amount))}</span> has been verified.</p>
        <p>Your generosity is already making a difference in the lives of our students.</p>
        <div class="details">
          <table>
            <tr><td>Verified Amount</td><td>${formatNPR(Number(data.amount))}</td></tr>
            <tr><td>Transaction ID</td><td>${data.transactionId || 'Verified'}</td></tr>
            <tr><td>Verified On</td><td>${new Date().toLocaleDateString()}</td></tr>
          </table>
        </div>
        <p>You can download your official receipt from your donor dashboard.</p>
        <p>With deep gratitude,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'sponsorship-confirmation': `
      <div class="body">
        <h2>Welcome to Our Family</h2>
        <p>Dear ${data.donorName || 'Friend'},</p>
        <p>We are so happy to welcome you as a sponsor! Your decision to sponsor <span class="highlight">${data.studentName || 'a student'}</span> is truly life-changing.</p>
        <p>Your monthly sponsorship of <span class="highlight">${formatNPR(Number(data.amount))}</span> will provide:</p>
        <ul style="color: #4b5563; line-height: 1.8;">
          <li>Quality education and school supplies</li>
          <li>Dietary nutrition programs</li>
          <li>Safe and nurturing environment</li>
          <li>Regular health check-ups</li>
        </ul>
        <p>We will keep you updated with progress reports, photos, and stories throughout your sponsorship journey.</p>
        <p>With heartfelt thanks,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'teacher-update': `
      <div class="body">
        <h2>Progress Update</h2>
        <p>Dear ${data.donorName || 'Friend'},</p>
        <p>We have a new progress update about <span class="highlight">${data.studentName || 'your sponsored student'}</span>!</p>
        <div class="details">
          <table>
            ${data.subject ? `<tr><td>Subject</td><td>${data.subject}</td></tr>` : ''}
            ${data.grade ? `<tr><td>Grade</td><td>${data.grade}</td></tr>` : ''}
            ${data.attendance ? `<tr><td>Attendance</td><td>${data.attendance}%</td></tr>` : ''}
            <tr><td>Report Date</td><td>${data.reportDate || new Date().toLocaleDateString()}</td></tr>
          </table>
        </div>
        ${data.notes ? `<p>"${data.notes}"</p>` : ''}
        <p>Thank you for making this education possible.</p>
        <p>With gratitude,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'account-verification': `
      <div class="body">
        <h2>Welcome to Buddha Academy</h2>
        <p>Dear ${data.name || 'Friend'},</p>
        <p>Thank you for creating an account with Buddha Academy. Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.verificationLink || '#'}" class="button">Verify Email Address</a>
        </div>
        <p>This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
        <p>With warm regards,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'password-reset': `
      <div class="body">
        <h2>Reset Your Password</h2>
        <p>Dear ${data.name || 'Friend'},</p>
        <p>We received a request to reset your password. Click the button below to create a new one.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.resetLink || '#'}" class="button">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        <p>With warm regards,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'sponsorship-renewal': `
      <div class="body">
        <h2>Your Sponsorship is Ready for Renewal</h2>
        <p>Dear ${data.donorName || 'Friend'},</p>
        <p>Your sponsorship of <span class="highlight">${data.studentName || 'a student'}</span> is approaching its renewal date.</p>
        <div class="details">
          <table>
            <tr><td>Student</td><td>${data.studentName || 'N/A'}</td></tr>
            <tr><td>Current Sponsorship</td><td>${formatNPR(Number(data.amount))}/month</td></tr>
            <tr><td>Renewal Date</td><td>${data.renewalDate || 'Upcoming'}</td></tr>
          </table>
        </div>
        <p>Your continued support ensures ${data.studentName || 'your sponsored student'} can continue their education without interruption.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://buddhaacademy.org.np'}/dashboard" class="button">Renew Sponsorship</a>
        </div>
        <p>With gratitude,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'volunteer-approved': `
      <div class="body">
        <h2>Welcome to Our Volunteer Team!</h2>
        <p>Dear ${data.volunteerName || 'Friend'},</p>
        <p>We are thrilled to welcome you as a volunteer at Buddha Academy! Your application has been approved.</p>
        <p>Your kindness and dedication will help us create a better learning environment for our students.</p>
        <div class="details">
          <table>
            ${data.role ? `<tr><td>Role</td><td>${data.role}</td></tr>` : ''}
            <tr><td>Status</td><td>Approved</td></tr>
            <tr><td>Since</td><td>${new Date().toLocaleDateString()}</td></tr>
          </table>
        </div>
        <p>We will be in touch with upcoming volunteer opportunities and events.</p>
        <p>With heartfelt thanks,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'volunteer-event-signup': `
      <div class="body">
        <h2>Event Signup Confirmed</h2>
        <p>Dear ${data.volunteerName || 'Friend'},</p>
        <p>You have successfully registered for <span class="highlight">${data.eventName || 'an event'}</span> at Buddha Academy.</p>
        <div class="details">
          <table>
            <tr><td>Event</td><td>${data.eventName || 'N/A'}</td></tr>
            <tr><td>Date</td><td>${data.eventDate || 'TBD'}</td></tr>
            ${data.eventTime ? `<tr><td>Time</td><td>${data.eventTime}</td></tr>` : ''}
            ${data.location ? `<tr><td>Location</td><td>${data.location}</td></tr>` : ''}
          </table>
        </div>
        <p>We look forward to seeing you there! Together, we are making a difference.</p>
        <p>With gratitude,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
    'contact-autoreply': `
      <div class="body">
        <h2>We Received Your Message</h2>
        <p>Dear ${data.name || 'Friend'},</p>
        <p>Thank you for reaching out to Buddha Academy. We have received your message and will get back to you within 24-48 hours.</p>
        <p>Your message matters to us. Whether you are interested in sponsorship, volunteering, or simply want to learn more about our work, we are here to help.</p>
        <p>In the meantime, you can explore our website to learn more about the children and community we serve.</p>
        <p>With warm regards,<br><strong>The Buddha Academy Team</strong></p>
      </div>
    `,
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>${baseStyle}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🪷 Buddha Academy</h1>
          <p>Nurturing Minds, Building Futures — Kathmandu, Nepal</p>
        </div>
        ${templates[template]}
        <hr class="divider">
        ${footer}
      </div>
    </body>
    </html>
  `
}
