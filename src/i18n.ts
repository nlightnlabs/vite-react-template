import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { config } from './config.ts';

const enModules = import.meta.glob('./languages/english/*.json', { eager: true });
const esModules = import.meta.glob('./languages/spanish/*.json', { eager: true });
const frModules = import.meta.glob('./languages/french/*.json', { eager: true });
const itModules = import.meta.glob('./languages/italian/*.json', { eager: true });
const grModules = import.meta.glob('./languages/german/*.json', { eager: true });
const deModules = import.meta.glob('./languages/dutch/*.json', { eager: true });
const ptModules = import.meta.glob('./languages/portuguese/*.json', { eager: true });


function loadNamespaces(modules: Record<string, any>) {
  const result: Record<string, any> = {};
  Object.entries(modules).forEach(([path, mod]) => {
    const match = path.match(/\/([a-zA-Z0-9_-]+)\.json$/);
    if (match) {
      const namespace = match[1];
      result[namespace] = mod.default;
    }
  });
  return result;
}

i18n.use(initReactI18next).init({
    resources: {
      en: loadNamespaces(enModules),
      es: loadNamespaces(esModules),
      fr: loadNamespaces(frModules),
      it: loadNamespaces(itModules),
      de: loadNamespaces(grModules),
      nl: loadNamespaces(deModules),
      pt: loadNamespaces(ptModules),
    },
    lng: config.language || 'en',              
    fallbackLng: 'en',
    ns: Object.keys(loadNamespaces(enModules)), 
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });
  
