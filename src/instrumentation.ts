/**
 * Next.js instrumentation hook (runs once per server worker on startup).
 *
 * Why this file exists
 * --------------------
 * On networks where the OS resolves remote hostnames via NAT64 (IPv6 addresses
 * in the 64:ff9b::/96 range that map to public IPv4), Node.js may return the
 * IPv6 form first. Next.js's image optimizer then runs a "private IP" check
 * against the resolved address and refuses to fetch with:
 *
 *   ⨯ upstream image https://...supabase.co/... resolved to private ip
 *     ["64:ff9b::6812:260a","64:ff9b::ac40:95f6"]
 *
 * Forcing the DNS resolver to prefer IPv4 (`ipv4first`) makes Node return the
 * underlying IPv4 address, which the optimizer accepts. This only affects the
 * Node.js server runtime — the browser is unaffected.
 *
 * Reference: https://nodejs.org/api/dns.html#dnssetdefaultresultorderorder
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
