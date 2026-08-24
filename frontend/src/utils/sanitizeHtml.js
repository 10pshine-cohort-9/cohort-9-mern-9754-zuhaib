import DOMPurify from 'dompurify';

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'h1',
    'h2',
    'h3',
    'ul',
    'ol',
    'li',
    'a',
    'blockquote',
    'code',
    'pre',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/**
 * Sanitizes stored HTML before rendering it in the DOM.
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '', PURIFY_CONFIG);
}

/**
 * Converts HTML to a short plain-text preview.
 * @param {string} html
 * @param {number} [maxLength=140]
 * @returns {string}
 */
export function htmlToPreview(html, maxLength = 140) {
  const text = sanitizeHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}…`;
}
