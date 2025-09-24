import { Locale, LocalizedStrings } from '../types/models';

const strings: Record<Locale, LocalizedStrings> = {
  'en-US': {
    subject: "You're on the Calendado waitlist ",
    greeting: "Hi {{name}}, you're officially on the Calendado waitlist!",
    body: "We're building something special that will revolutionize how you manage your time and schedule. We'll start sending early invites soon and will contact you at {{email}}.",
    expectations: {
      title: "What's coming in Calendado:",
      items: [
        "Smart scheduling that learns your preferences",
        "Seamless integration with all your favorite tools",
        "AI-powered time optimization suggestions",
        "Collaborative planning with your team",
        "Beautiful, intuitive interface that just works",
        "Mobile-first design for on-the-go productivity"
      ]
    },
    closing: "Thanks for being part of our journey from the beginning.\n Team Calendado",
    footer: {
      why: "You received this email because you signed up for early access to Calendado.",
      privacy: "Privacy Policy"
    }
  },
  'pt-BR': {
    subject: "Você entrou na lista de espera do Calendado ",
    greeting: "Olá {{name}}, você está oficialmente na lista de espera do Calendado!",
    body: "Estamos construindo algo especial que revolucionará como você gerencia seu tempo e agenda. Começaremos a enviar convites antecipados em breve e entraremos em contato em {{email}}.",
    expectations: {
      title: "O que está vindo no Calendado:",
      items: [
        "Agendamento inteligente que aprende suas preferências",
        "Integração perfeita com todas as suas ferramentas favoritas",
        "Sugestões de otimização de tempo com IA",
        "Planejamento colaborativo com sua equipe",
        "Interface bonita e intuitiva que simplesmente funciona",
        "Design mobile-first para produtividade em movimento"
      ]
    },
    closing: "Obrigado por fazer parte da nossa jornada desde o início.\n Equipe Calendado",
    footer: {
      why: "Você recebeu este email porque se inscreveu para acesso antecipado ao Calendado.",
      privacy: "Política de Privacidade"
    }
  },
  'it-IT': {
    subject: "Sei nella lista d'attesa di Calendado ",
    greeting: "Ciao {{name}}, sei ufficialmente nella lista d'attesa di Calendado!",
    body: "Stiamo costruendo qualcosa di speciale che rivoluzionerà come gestisci il tuo tempo e la tua agenda. Inizieremo a inviare inviti anticipati presto e ti contatteremo a {{email}}.",
    expectations: {
      title: "Cosa sta arrivando in Calendado:",
      items: [
        "Pianificazione intelligente che impara le tue preferenze",
        "Integrazione perfetta con tutti i tuoi strumenti preferiti",
        "Suggerimenti di ottimizzazione del tempo con IA",
        "Pianificazione collaborativa con il tuo team",
        "Interfaccia bella e intuitiva che funziona semplicemente",
        "Design mobile-first per la produttività in movimento"
      ]
    },
    closing: "Grazie per essere parte del nostro viaggio fin dall'inizio.\n Team Calendado",
    footer: {
      why: "Hai ricevuto questa email perché ti sei iscritto per l'accesso anticipato a Calendado.",
      privacy: "Informativa sulla Privacy"
    }
  }
};

/**
 * Get localized strings for a given locale
 */
export function getLocalizedStrings(locale: Locale): LocalizedStrings {
  return strings[locale] || strings['en-US'];
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(strings) as Locale[];
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return locale in strings;
}

/**
 * Get fallback locale
 */
export function getFallbackLocale(): Locale {
  return 'en-US';
}

/**
 * Resolve locale with fallback
 */
export function resolveLocale(locale: string | null | undefined): Locale {
  if (!locale || !isSupportedLocale(locale)) {
    return getFallbackLocale();
  }
  return locale;
}
