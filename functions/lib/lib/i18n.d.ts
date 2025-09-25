import type { Locale, LocalizedStrings } from '../types/models';
/**
 * Get localized strings for a given locale
 */
export declare function getLocalizedStrings(locale: Locale): LocalizedStrings;
/**
 * Get all supported locales
 */
export declare function getSupportedLocales(): Locale[];
/**
 * Check if a locale is supported
 */
export declare function isSupportedLocale(locale: string): locale is Locale;
/**
 * Get fallback locale
 */
export declare function getFallbackLocale(): Locale;
/**
 * Resolve locale with fallback
 */
export declare function resolveLocale(locale: string | null | undefined): Locale;
//# sourceMappingURL=i18n.d.ts.map