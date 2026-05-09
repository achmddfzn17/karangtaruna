import { Resend } from "resend";

// Lazy initialize Resend - only when API key is available
let resendInstance: Resend | null = null;

function getResendInstance(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resendInstance;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const resend = getResendInstance();
    
    // Check if email service is configured
    if (!resend) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email not sent to:", to);
      return { success: false, message: "Email service not configured" };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@generasiemas.id",
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("[EMAIL_ERROR]", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[EMAIL_SEND_ERROR]", error);
    return { success: false, error };
  }
}

/**
 * Send certificate email to anggota
 */
export async function sendCertificateEmail(
  anggotaEmail: string,
  anggotaNama: string,
  nomorSertifikat: string,
  namaKegiatan: string,
  qrCodeUrl: string,
  pdfUrl?: string
) {
  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${nomorSertifikat}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
          .qr-section { text-align: center; margin: 30px 0; }
          .qr-section img { max-width: 200px; margin: 20px 0; }
          .verify-link { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          .certificate-number { background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Selamat!</h1>
            <p>Anda telah menerima Sertifikat Digital</p>
          </div>
          
          <div class="content">
            <p>Halo <strong>${anggotaNama}</strong>,</p>
            
            <p>Kami dengan bangga mengumumkan bahwa Anda telah berhasil menyelesaikan kegiatan:</p>
            
            <div class="badge">${namaKegiatan}</div>
            
            <p>Sebagai bukti partisipasi Anda, kami telah menerbitkan sertifikat digital atas nama Anda.</p>
            
            <div class="certificate-number">
              <strong>Nomor Sertifikat:</strong><br/>
              ${nomorSertifikat}
            </div>
            
            <div class="qr-section">
              <p><strong>QR Code untuk Verifikasi:</strong></p>
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="verify-link">Lihat Sertifikat Digital</a>
            </p>
            
            ${pdfUrl ? `<p style="text-align: center;"><a href="${pdfUrl}" style="color: #3b82f6; text-decoration: underline;">Download PDF</a></p>` : ""}
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
            
            <p>Sertifikat ini adalah bukti resmi bahwa Anda telah mengikuti kegiatan tersebut. Anda dapat membagikan QR code ini atau link verifikasi untuk menunjukkan kredibilitas Anda.</p>
            
            <div class="footer">
              <p>📧 Email ini dikirim otomatis oleh sistem Generasi Emas</p>
              <p>Jangan balas email ini. Jika ada pertanyaan, hubungi admin.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: anggotaEmail,
    subject: `Sertifikat Digital: ${namaKegiatan}`,
    html,
  });
}
