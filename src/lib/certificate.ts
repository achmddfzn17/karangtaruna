export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const uniqueId = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `CERT-${year}-${uniqueId}`;
}

export function getCertificateVerifyUrl(nomorSertifikat: string): string {
  const configuredUrl =
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${configuredUrl.replace(/\/$/, "")}/verify/${encodeURIComponent(nomorSertifikat)}`;
}

export function getCertificateQrCodeUrl(nomorSertifikat: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    getCertificateVerifyUrl(nomorSertifikat)
  )}`;
}
