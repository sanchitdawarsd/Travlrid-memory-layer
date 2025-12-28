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
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

const extractPlainText = (emailBody) => {
  if (typeof emailBody === 'string') {
    // If it's already plain text, return as is
    if (!emailBody.includes('<html') && !emailBody.includes('<!DOCTYPE')) {
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
