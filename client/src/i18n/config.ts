import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// i18n 초기화 - 한글 고정
try {
  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      lng: 'ko', // 한글로 고정
      fallbackLng: 'ko',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
    .catch((error: any) => {
      console.error('i18n initialization error:', error);
      // 오류 발생 시 기본 설정으로 재시도
      i18n.init({
        lng: 'ko',
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
    lng: 'ko',
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

