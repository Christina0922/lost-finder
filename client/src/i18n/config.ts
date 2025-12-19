import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// i18n 초기화 - 오류 처리 강화
try {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      fallbackLng: 'ko',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      react: {
        useSuspense: false,
      },
    })
    .catch((error: any) => {
      console.error('i18n initialization error:', error);
      // 오류 발생 시 기본 설정으로 재시도
      i18n.init({
        fallbackLng: 'ko',
        interpolation: {
          escapeValue: false,
        },
      });
    });
} catch (error) {
  console.error('i18n setup error:', error);
  // 최소한의 설정으로 초기화
  i18n.init({
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

