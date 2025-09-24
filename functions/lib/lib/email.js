"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWaitlistConfirmationEmail = buildWaitlistConfirmationEmail;
exports.validateEmailTemplateData = validateEmailTemplateData;
const i18n_1 = require("./i18n");
/**
 * Build email template for waitlist confirmation
 */
function buildWaitlistConfirmationEmail(email, name, locale, appBaseUrl) {
    const resolvedLocale = (0, i18n_1.resolveLocale)(locale);
    const strings = (0, i18n_1.getLocalizedStrings)(resolvedLocale);
    const displayName = name || 'there';
    const subject = strings.subject;
    const html = buildEmailHTML(strings, displayName, email, appBaseUrl);
    return { subject, html };
}
/**
 * Build HTML email content
 */
function buildEmailHTML(strings, displayName, email, appBaseUrl) {
    const greeting = strings.greeting.replace('{{name}}', displayName);
    const body = strings.body.replace('{{email}}', email);
    const privacyUrl = `${appBaseUrl}/privacy.html`;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${strings.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #2d3748;
      font-size: 24px;
      margin: 0 0 20px 0;
      font-weight: 600;
    }
    .content p {
      margin: 0 0 20px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .expectations {
      background-color: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 30px 0;
      border-radius: 0 4px 4px 0;
    }
    .expectations h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
      font-size: 18px;
      font-weight: 600;
    }
    .expectations ul {
      margin: 0;
      padding-left: 20px;
    }
    .expectations li {
      margin: 8px 0;
      font-size: 15px;
      color: #4a5568;
    }
    .closing {
      margin: 30px 0;
      font-size: 16px;
      color: #2d3748;
      white-space: pre-line;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #718096;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .header, .content, .footer {
        padding: 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content h2 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📅 Calendado</div>
      <h1>${strings.subject}</h1>
    </div>
    
    <div class="content">
      <h2>${greeting}</h2>
      <p>${body}</p>
      
      <div class="expectations">
        <h3>${strings.expectations.title}</h3>
        <ul>
          ${strings.expectations.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      <div class="closing">${strings.closing}</div>
    </div>
    
    <div class="footer">
      <p>${strings.footer.why}</p>
      <p><a href="${privacyUrl}">${strings.footer.privacy}</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
/**
 * Validate email template data
 */
function validateEmailTemplateData(email, name, locale) {
    const errors = [];
    if (!email || typeof email !== 'string') {
        errors.push('Email is required and must be a string');
    }
    else if (!email.includes('@')) {
        errors.push('Email must be a valid email address');
    }
    if (name !== null && typeof name !== 'string') {
        errors.push('Name must be null or a string');
    }
    if (locale !== null && typeof locale !== 'string') {
        errors.push('Locale must be null or a string');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=email.js.map