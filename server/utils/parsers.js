const cheerio = require('cheerio');

/**
 * Email parsing utilities
 */

const extractTextFromHtml = (html) => {
  if (!html) return '';
  
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();
  
  // Try to get text from body, or fallback to all text
  let text = $('body').text() || $.text();
  
  // Clean up whitespace - replace multiple spaces/tabs with single space
  // Replace multiple newlines with single newline, then trim
  text = text
    .replace(/[ \t]+/g, ' ')  // Multiple spaces/tabs to single space
    .replace(/\n\s*\n/g, '\n') // Multiple newlines to single newline
    .trim();
  
  return text;
};

const extractPlainText = (emailBody) => {
  if (typeof emailBody === 'string') {
    // Check if it contains HTML tags (more comprehensive check)
    // This regex matches any HTML tag like <div>, <meta>, <table>, etc.
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(emailBody);
    
    // If it's already plain text, return as is
    if (!hasHtmlTags) {
      return emailBody.trim();
    }
    
    // Otherwise extract from HTML
    return extractTextFromHtml(emailBody);
  }
  
  return '';
};

const normalizeEmailContent = (email) => {
  const text = extractPlainText(email.body || email.content || '');
  
  return {
    subject: email.subject || '',
    from: email.from || '',
    date: email.date || email.receivedDate || new Date(),
    body: text,
    raw: email.body || email.content || '',
  };
};

module.exports = {
  extractTextFromHtml,
  extractPlainText,
  normalizeEmailContent,
};
