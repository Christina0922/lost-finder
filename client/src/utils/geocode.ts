import { API_BASE } from './api';

/**
 * 주소 → 좌표 변환 함수 (서버 프록시 사용 - CORS 문제 해결)
 * @param address - 검색할 주소 또는 장소명
 * @returns 좌표 객체 { lat: number, lng: number } 또는 null
 */
export async function getCoords(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address || !address.trim()) {
    return null;
  }

  try {
    console.log('🔍 좌표 변환 API 호출 (서버 프록시):', address);
    const url = `${API_BASE}/api/geocode?address=${encodeURIComponent(address.trim())}`;
    
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('좌표 변환 API 오류:', res.status);
      return null;
    }

    const data = await res.json();
    console.log('📦 좌표 변환 API 응답:', data);
    
    if (data.ok && data.coords) {
      console.log('✅ 좌표 변환 성공:', data.coords);
      return data.coords;
    }
    
    console.warn('⚠️ 좌표 변환 실패:', data.message || '알 수 없는 오류');
    return null;
  } catch (error: any) {
    console.error('❌ 좌표 변환 오류:', error);
    // 네트워크 오류인 경우에도 null 반환하여 지도는 기본 위치로 표시
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      console.warn('⚠️ 서버 연결 실패, 지도는 기본 위치로 표시됩니다.');
    }
    return null;
  }
}

