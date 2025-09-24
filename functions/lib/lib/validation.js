"use strict";
/**
 * Input validation and sanitization utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.validateName = validateName;
exports.validateLocale = validateLocale;
exports.validateUtmData = validateUtmData;
exports.validateWaitlistData = validateWaitlistData;
/**
 * Validate and sanitize email address
 */
function validateEmail(email) {
    const errors = [];
    if (typeof email !== 'string') {
        errors.push('Email must be a string');
        return { isValid: false, errors };
    }
    const trimmed = email.trim();
    if (trimmed.length === 0) {
        errors.push('Email cannot be empty');
        return { isValid: false, errors };
    }
    if (trimmed.length > 254) {
        errors.push('Email is too long');
        return { isValid: false, errors };
    }
    // Basic email regex validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmed)) {
        errors.push('Invalid email format');
        return { isValid: false, errors };
    }
    return {
        isValid: true,
        errors: [],
        sanitizedValue: trimmed.toLowerCase()
    };
}
/**
 * Validate and sanitize name
 */
function validateName(name) {
    const errors = [];
    if (name === null || name === undefined) {
        return { isValid: true, errors: [], sanitizedValue: null };
    }
    if (typeof name !== 'string') {
        errors.push('Name must be a string or null');
        return { isValid: false, errors };
    }
    const trimmed = name.trim();
    if (trimmed.length > 100) {
        errors.push('Name is too long');
        return { isValid: false, errors };
    }
    // Check for potentially malicious content
    if (trimmed.includes('<') || trimmed.includes('>') || trimmed.includes('&')) {
        errors.push('Name contains invalid characters');
        return { isValid: false, errors };
    }
    return {
        isValid: true,
        errors: [],
        sanitizedValue: trimmed.length > 0 ? trimmed : null
    };
}
/**
 * Validate and sanitize locale
 */
function validateLocale(locale) {
    const errors = [];
    if (locale === null || locale === undefined) {
        return { isValid: true, errors: [], sanitizedValue: null };
    }
    if (typeof locale !== 'string') {
        errors.push('Locale must be a string or null');
        return { isValid: false, errors };
    }
    const validLocales = ['en-US', 'pt-BR', 'it-IT'];
    if (!validLocales.includes(locale)) {
        errors.push('Invalid locale');
        return { isValid: false, errors };
    }
    return {
        isValid: true,
        errors: [],
        sanitizedValue: locale
    };
}
/**
 * Validate and sanitize UTM data
 */
function validateUtmData(utm) {
    const errors = [];
    if (utm === null || utm === undefined) {
        return { isValid: true, errors: [], sanitizedValue: null };
    }
    if (typeof utm !== 'object' || utm === null) {
        errors.push('UTM data must be an object or null');
        return { isValid: false, errors };
    }
    const utmObj = utm;
    const sanitized = {};
    const allowedFields = ['source', 'medium', 'campaign'];
    for (const field of allowedFields) {
        const value = utmObj[field];
        if (value !== undefined && value !== null) {
            if (typeof value !== 'string') {
                errors.push(`${field} must be a string`);
                continue;
            }
            const trimmed = value.trim();
            if (trimmed.length > 50) {
                errors.push(`${field} is too long`);
                continue;
            }
            // Check for potentially malicious content
            if (trimmed.includes('<') || trimmed.includes('>') || trimmed.includes('&')) {
                errors.push(`${field} contains invalid characters`);
                continue;
            }
            sanitized[field] = trimmed;
        }
    }
    if (errors.length > 0) {
        return { isValid: false, errors };
    }
    return {
        isValid: true,
        errors: [],
        sanitizedValue: Object.keys(sanitized).length > 0 ? sanitized : null
    };
}
/**
 * Validate waitlist signup data
 */
function validateWaitlistData(data) {
    const errors = [];
    if (typeof data !== 'object' || data === null) {
        return { isValid: false, errors: ['Data must be an object'] };
    }
    const waitlistData = data;
    const sanitized = {};
    // Validate email
    const emailResult = validateEmail(waitlistData.email);
    if (!emailResult.isValid) {
        errors.push(...emailResult.errors.map(e => `Email: ${e}`));
    }
    else {
        sanitized.email = emailResult.sanitizedValue;
    }
    // Validate name
    const nameResult = validateName(waitlistData.name);
    if (!nameResult.isValid) {
        errors.push(...nameResult.errors.map(e => `Name: ${e}`));
    }
    else {
        sanitized.name = nameResult.sanitizedValue;
    }
    // Validate locale
    const localeResult = validateLocale(waitlistData.locale);
    if (!localeResult.isValid) {
        errors.push(...localeResult.errors.map(e => `Locale: ${e}`));
    }
    else {
        sanitized.locale = localeResult.sanitizedValue;
    }
    // Validate UTM data
    const utmResult = validateUtmData(waitlistData.utm);
    if (!utmResult.isValid) {
        errors.push(...utmResult.errors.map(e => `UTM: ${e}`));
    }
    else {
        sanitized.utm = utmResult.sanitizedValue;
    }
    return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue: sanitized
    };
}
//# sourceMappingURL=validation.js.map