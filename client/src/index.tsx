import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './i18n/config'; // i18n 초기화
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';

console.log('🚀 React 앱 시작 - index.tsx 로드됨');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ root 엘리먼트를 찾을 수 없습니다!');
  throw new Error('root 엘리먼트를 찾을 수 없습니다.');
}

console.log('✅ root 엘리먼트 찾음:', rootElement);

const root = ReactDOM.createRoot(rootElement);

try {
  console.log('🔄 React 앱 렌더링 시작...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ React 앱 렌더링 완료');
  
  // 렌더링 후 DOM 확인
  setTimeout(() => {
    const rootContent = rootElement.innerHTML;
    const rootText = rootElement.innerText || rootElement.textContent || '';
    console.log('📊 DOM 상태 확인:');
    console.log('  - root children 개수:', rootElement.children.length);
    console.log('  - root innerText 길이:', rootText.length);
    console.log('  - root innerHTML 길이:', rootContent.length);
    if (rootText.length === 0) {
      console.error('⚠️ root에 텍스트가 없습니다!');
    }
  }, 1000);
} catch (error) {
  console.error('❌ React 앱 렌더링 실패:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #333; background: #fff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h2 style="color: #667eea; font-size: 24px; margin-bottom: 16px;">오류가 발생했습니다</h2>
      <p style="margin-bottom: 20px; font-size: 16px;">${error instanceof Error ? error.message : '알 수 없는 오류'}</p>
      <button onclick="window.location.reload()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">새로고침</button>
    </div>
  `;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
