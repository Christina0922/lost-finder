import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

console.log('🌐 i18n 초기화 시작');

// 기본 번역 리소스 (fallback용)
const defaultResources = {
  ko: {
    translation: {
      mainPage: {
        title: '분실물 찾기 서비스',
        description: '지금 바로 등록하고 찾아보세요!',
        mapButton: '지도에서 찾기',
        registerButton: '등록하기',
        listButton: '목록 보기'
      }
    }
  }
};

// i18n 초기화 - 한글 고정
try {
  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      resources: defaultResources,
      backend: {
        loadPath: './locales/{{lng}}/{{ns}}.json',
        allowMultiLoading: false,
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
      // 번역 파일 로드 실패 시 기본 리소스 사용
      partialBundledLanguages: true,
    })
    .then(() => {
      console.log('✅ i18n 초기화 완료');
    })
    .catch((error: any) => {
      console.error('❌ i18n initialization error:', error);
      // 오류 발생 시 기본 설정으로 재시도
      i18n.init({
        resources: defaultResources,
        lng: 'ko',
        fallbackLng: 'ko',
        interpolation: {
          escapeValue: false,
        },
      });
    });
} catch (error) {
  console.error('❌ i18n setup error:', error);
  // 최소한의 설정으로 초기화
  i18n.init({
    resources: defaultResources,
    lng: 'ko',
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

