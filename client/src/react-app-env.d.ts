/// <reference types="react-scripts" />

// 카카오맵 API 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

// uuid 모듈 타입 정의
declare module 'uuid' {
  export function v4(): string;
}

export {};
