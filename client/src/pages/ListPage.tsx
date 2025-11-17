// C:\LostFinderProject\client\src\pages\ListPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LostItem, User } from '../types';
import { getAllLostItems, deleteLostItem, API_BASE } from '../utils/api';
import LazyImage from '../components/LazyImage';
import CoupangBanner from '../components/CoupangBanner';
import TopBar from '../components/TopBar';
import './ListPage.css';

interface Props {
  currentUser?: User; // App.tsx에서 전달(선택). 없으면 버튼 숨김.
}

const ListPage: React.FC<Props> = ({ currentUser }) => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchList = useCallback(async () => {
    try {
      const data = await getAllLostItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      // 에러가 발생해도 조용히 처리 (getAllLostItems가 이미 빈 배열 반환)
      console.warn('목록 로드 중 오류:', error);
      setItems([]);
    }
  }, []);

  // 최초 로드 + refresh 쿼리 변경 시 재조회
  useEffect(() => {
    fetchList();
  }, [fetchList, location.search]); // ✅ /list?refresh=... 로 오면 다시 조회

  // 앱이 포그라운드로 돌아오면 재조회(모바일에서 효과적)
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') fetchList(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchList]);

  // 본인 소유 여부 판단(여러 스키마 대비)
  const isOwner = useCallback(
    (it: LostItem) => {
      if (!currentUser) return false;
      const uid = (currentUser as any).id ?? (currentUser as any).user_id ?? (currentUser as any).userId;
      const uemail = (currentUser as any).email ?? (currentUser as any).username;

      const ownerId =
        (it as any).user_id ?? (it as any).userId ?? (it as any).owner_id ?? (it as any).author_id;
      const ownerEmail =
        (it as any).owner_email ?? (it as any).author_email ?? (it as any).email;

      return (uid != null && ownerId != null && String(uid) === String(ownerId)) ||
             (uemail && ownerEmail && String(uemail).toLowerCase() === String(ownerEmail).toLowerCase());
    },
    [currentUser]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) => {
      const hay = [
        it.title,
        it.item_type,
        it.description,
        it.location
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(query);
    });
  }, [q, items]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('정말 삭제하시겠어요? 삭제 후 되돌릴 수 없습니다.')) return;
    try {
      setBusyId(id);
      await deleteLostItem(id);
      setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
    } catch (e: any) {
      alert(e?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} />
      
      <div style={{ padding: '16px 16px 24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', textAlign: 'center' }}>
          📋 분실물 목록
        </h2>

        <input
          placeholder="검색어"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />

        <ul className="list">
          {filtered.map((it) => {
            const mine = isOwner(it);
            
            // 이미지 URL 처리: image_urls 배열의 첫 번째 이미지 사용
            let imageUrl = '';
            if (it.image_urls && it.image_urls.length > 0) {
              imageUrl = it.image_urls[0];
              // 상대 경로인 경우 전체 URL로 변환
              if (imageUrl.startsWith('/uploads/')) {
                imageUrl = `${API_BASE}${imageUrl}`;
              }
            } else if ((it as any).image_url) {
              imageUrl = (it as any).image_url;
              if (imageUrl.startsWith('/uploads/')) {
                imageUrl = `${API_BASE}${imageUrl}`;
              }
            }
            
            return (
              <li key={it.id} className="card">
                {imageUrl ? (
                  <LazyImage src={imageUrl} alt={it.description || it.title || it.item_type || '분실물'} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 150,
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: 14
                  }}>
                    이미지 없음
                  </div>
                )}
                <div className="meta">
                  <strong>{it.title || it.description || it.item_type || '분실물'}</strong>
                  {it.location && <p>위치: {it.location}</p>}
                  <small>
                    {it.created_at ? new Date(it.created_at as any).toLocaleString() : ''}
                  </small>

                  {/* 본인 글일 때만 '수정 / 삭제' 노출 */}
                  {mine && (
                    <div className="actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/edit/${it.id}`)}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#ffffff' }}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(it.id!)}
                        disabled={busyId === it.id}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '0', background: '#ef4444', color: '#fff' }}
                      >
                        {busyId === it.id ? '삭제 중…' : '삭제'}
                      </button>
                    </div>
                  )}

                  {/* 누구나 볼 수 있는 링크 */}
                  <div className="actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Link to={`/detail/${it.id}`}>상세 보기</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 쿠팡 배너(1시간마다 자동 교체, 1개만 표시) */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <CoupangBanner />
        </div>
      </div>
    </div>
  );
};

export default ListPage;