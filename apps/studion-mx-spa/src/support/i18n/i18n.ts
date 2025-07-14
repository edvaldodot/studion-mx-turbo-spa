import { createI18n } from 'vue-i18n';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt-br.json';

const messages = {
  en,
  es,
  pt,
};

const i18n = createI18n({
  legacy: false,
  locale: 'pt', // Idioma padrão
  fallbackLocale: 'pt', // Idioma de fallback caso a tradução não seja encontrada
  messages,
});

export default i18n;
