/**
 * Sanitize HTML content to prevent XSS attacks
 * Server-side only - uses dynamic import to avoid Edge Runtime issues
 * 
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export async function sanitizeHtml(dirty: string): Promise<string> {
  if (!dirty) return "";
  
  // Dynamic import to avoid Edge Runtime issues
  const DOMPurify = (await import("isomorphic-dompurify")).default;
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "code", "pre",
      "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "title", "class",
      "width", "height",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

/**
 * Sanitize HTML for preview (more permissive)
 * Used in admin preview modals - client-side only
 */
export function sanitizeHtmlPreview(dirty: string): string {
  if (!dirty) return "";
  
  // Client-side only - use browser's DOMPurify
  if (typeof window === "undefined") {
    // Fallback for SSR: basic escaping
    return dirty
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  // Lazy load DOMPurify on client
  const DOMPurify = require("isomorphic-dompurify");
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "code", "pre",
      "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span", "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
    SAFE_FOR_TEMPLATES: true,
  });
}
