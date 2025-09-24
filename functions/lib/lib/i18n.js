"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalizedStrings = getLocalizedStrings;
exports.getSupportedLocales = getSupportedLocales;
exports.isSupportedLocale = isSupportedLocale;
exports.getFallbackLocale = getFallbackLocale;
exports.resolveLocale = resolveLocale;
const strings = {
    'en-US': {
        subject: "You're on the Calendado waitlist 🎉",
        greeting: "Hi {{name}}, you're officially on the Calendado waitlist!",
        body: "We'll start sending early invites soon and will contact you at {{email}}.",
        expectations: {
            title: "What to expect next:",
            items: [
                "Early access waves over the next few weeks",
                "Occasional updates on features and timelines"
            ]
        },
        closing: "Thanks for jumping in with us.\n— Team Calendado",
        footer: {
            why: "Why you received this email: you signed up on calendado.com.",
            privacy: "Privacy Policy: {{APP_BASE_URL}}/privacy"
        }
    },
    'pt-BR': {
        subject: "Você entrou na lista de espera do Calendado 🎉",
        greeting: "Olá {{name}}, você está oficialmente na lista de espera do Calendado!",
        body: "Começaremos a enviar convites antecipados em breve e entraremos em contato em {{email}}.",
        expectations: {
            title: "O que esperar a seguir:",
            items: [
                "Ondas de acesso antecipado nas próximas semanas",
                "Atualizações ocasionais sobre recursos e cronogramas"
            ]
        },
        closing: "Obrigado por se juntar a nós.\n— Equipe Calendado",
        footer: {
            why: "Por que você recebeu este email: você se inscreveu no calendado.com.",
            privacy: "Política de Privacidade: {{APP_BASE_URL}}/privacy"
        }
    },
    'it-IT': {
        subject: "Sei nella lista d'attesa di Calendado 🎉",
        greeting: "Ciao {{name}}, sei ufficialmente nella lista d'attesa di Calendado!",
        body: "Inizieremo a inviare inviti anticipati presto e ti contatteremo a {{email}}.",
        expectations: {
            title: "Cosa aspettarsi dopo:",
            items: [
                "Onde di accesso anticipato nelle prossime settimane",
                "Aggiornamenti occasionali su funzionalità e tempistiche"
            ]
        },
        closing: "Grazie per essere saltato con noi.\n— Team Calendado",
        footer: {
            why: "Perché hai ricevuto questa email: ti sei iscritto su calendado.com.",
            privacy: "Informativa sulla Privacy: {{APP_BASE_URL}}/privacy"
        }
    }
};
/**
 * Get localized strings for a given locale
 */
function getLocalizedStrings(locale) {
    return strings[locale] || strings['en-US'];
}
/**
 * Get all supported locales
 */
function getSupportedLocales() {
    return Object.keys(strings);
}
/**
 * Check if a locale is supported
 */
function isSupportedLocale(locale) {
    return locale in strings;
}
/**
 * Get fallback locale
 */
function getFallbackLocale() {
    return 'en-US';
}
/**
 * Resolve locale with fallback
 */
function resolveLocale(locale) {
    if (!locale || !isSupportedLocale(locale)) {
        return getFallbackLocale();
    }
    return locale;
}
//# sourceMappingURL=i18n.js.map