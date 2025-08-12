import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import EditPage from './pages/EditPage';
import DetailPage from './pages/DetailPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import GamePage from './pages/GamePage';
import ReviewPage from './pages/ReviewPage';
import AdBar from './components/AdBar';
import { nextCoupangLink } from './utils/coupang';
import { User, LostItem } from './types';
import './App.css';

/** =========================
 *  환경설정
 *  =======================*/
const API_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/+$/, '');

/** =========================
 *  토스트 컴포넌트
 *  =======================*/
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToastMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 1800);
  };

  const ToastUI = useMemo(
    () =>
      function Toast() {
        if (!toast) return null;
        return <div className={`toast ${toast.type}`}>{toast.msg}</div>;
      },
    [toast]
  );

  return { showToastMessage, ToastUI };
}

/** =========================
 *  더미 페이지(리스트/홈)
 *  =======================*/
function Home({ theme, setTheme, currentUser, setCurrentUser }: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}) {
  const handleCoupangClick = () => {
    const url = nextCoupangLink();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <div style={{ 
        backgroundColor: '#F0FDF4', 
        minHeight: '100vh',
        paddingBottom: '120px'
      }}>
        <div style={{ 
          maxWidth: '480px', 
          margin: '0 auto', 
          padding: '16px'
        }}>
          {/* 헤더 */}
          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <h1 style={{ 
              margin: 0, 
                  fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}>LostFinder</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>🔍 분실물 찾기</span>
            </div>
          </div>

          {/* 안내 문구 */}
          <div style={{
            textAlign: 'center',
            color: '#6B7280',
                      fontSize: '16px',
            marginBottom: '24px',
            padding: '12px'
          }}>
            잃어버린 물건을 쉽게 찾아보세요
                </div>

          {/* 메뉴 카드들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MenuCard
              icon="🔍+"
              title="분실물 등록하기"
              desc="잃어버린 물건을 등록하세요"
              onClick={() => window.location.href = '/add'}
            />
            <MenuCard
              icon="📋"
              title="목록 보기"
              desc="등록된 분실물을 확인하세요"
              onClick={() => window.location.href = '/list'}
            />
            <MenuCard
              icon="💬"
              title="분실물 후기 보기"
              desc="다른 사람들의 후기를 확인하세요"
              onClick={() => window.location.href = '/review'}
            />

            <MenuCard
              icon="🛒"
              title="분실 방지 용품 인기 상품"
              desc="쿠팡에서 보기"
              onClick={handleCoupangClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function MenuCard({ icon, title, desc, onClick }: { 
  icon: string; 
  title: string; 
  desc: string; 
  onClick: () => void; 
}) {
  return (
                <button
      onClick={onClick}
                  style={{
                    width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        minHeight: '80px',
        border: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
                    cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>{icon}</div>
        <div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#1F2937',
            marginBottom: '4px'
          }}>
            {title}
              </div>
    <div style={{
      fontSize: '14px',
            color: '#6B7280'
    }}>
            {desc}
    </div>
        </div>
      </div>
      <span style={{ fontSize: '20px', color: '#9CA3AF' }}>→</span>
    </button>
  );
}

function ListPage({ theme, setTheme, currentUser, setCurrentUser }: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}) {
  const [items, setItems] = useState<LostItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/lost-items`)
      .then(res => res.json())
      .then(json => setItems(json.items || []))
      .catch(() => setItems([]));
  }, []);

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('정말로 이 분실물을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/lost-items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
        alert('분실물이 삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <div className="container">
        <div className="card">
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#333',
        textAlign: 'center',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>등록된 분실물</h1>
        {items.length === 0 ? (
          <p className="mt-12">아직 등록된 분실물이 없습니다.</p>
        ) : (
          <ul className="mt-12" style={{ paddingLeft: 16 }}>
            {items.map(it => (
              <li key={it.id} style={{ 
                marginBottom: 16, 
                padding: 12, 
                border: '1px solid #ddd', 
                borderRadius: 8,
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <b>#{it.id}</b> {it.item_type} — {it.description} 
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: 4 }}>@{it.location}</small>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Link to={`/detail/${it.id}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                      상세보기
            </Link>
                    {currentUser && it.author_id === currentUser.id && (
                      <>
                        <Link to={`/edit/${it.id}`} className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                          수정
            </Link>
        <button
                          onClick={() => handleDelete(it.id)} 
                          className="btn btn-danger" 
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          삭제
        </button>
                      </>
                    )}
              </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </>
  );
}

/** =========================
 *  상단 헤더
 *  =======================*/
function Header({
  theme,
  setTheme,
  currentUser,
  setCurrentUser,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  currentUser?: User | null;
  setCurrentUser: (user: User | null) => void;
}) {
  const navigate = useNavigate();
  
  // 디버깅용 로그
  console.log('Header - currentUser:', currentUser);
  
  return (
    <div style={{ 
      padding: '12px 16px', 
      position: 'relative',
      backgroundColor: 'transparent',
      borderBottom: 'none'
    }}>
      {/* 첫 번째 줄: 홈, 목록, 등록하기 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <Link to="/" className="btn btn-secondary" style={{ minWidth: '60px', textAlign: 'center' }}>홈</Link>
        <Link to="/list" className="btn btn-secondary" style={{ minWidth: '60px', textAlign: 'center' }}>목록</Link>
        <Link to="/add" className="btn btn-secondary" style={{ minWidth: '80px', textAlign: 'center' }}>등록하기</Link>
      </div>
      
      {/* 두 번째 줄: 후기 쓰기, 로그아웃 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        <Link to="/review" className="btn btn-secondary" style={{ minWidth: '80px', textAlign: 'center' }}>후기 쓰기</Link>
        {currentUser ? (
          <button 
            className="btn btn-secondary"
            style={{ minWidth: '80px', textAlign: 'center' }}
            onClick={() => {
              console.log('로그아웃 버튼 클릭됨');
              setCurrentUser(null);
              console.log('currentUser를 null로 설정함');
              navigate('/');
            }}
          >
            로그아웃
          </button>
        ) : (
          <Link to="/login" className="btn btn-secondary" style={{ minWidth: '80px', textAlign: 'center' }}>로그인</Link>
        )}
      </div>
    </div>
  );
}

/** =========================
 *  메인 App
 *  =======================*/
export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { showToastMessage, ToastUI } = useToast();

  // 로그인 상태 관리
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // body에 테마 속성 적용
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // currentUser 상태 변경 추적
  useEffect(() => {
    console.log('App - currentUser 상태 변경됨:', currentUser);
  }, [currentUser]);

  // 분실물 등록 핸들러
  const handleAddItem = async (item: Omit<LostItem, 'id' | 'author_id' | 'comments'>): Promise<boolean> => {
    try {
      const payload = {
        author_id: currentUser?.id || 0,
        item_type: item.item_type || '기타',
        description: item.description || '',
        location: item.location || '',
        image_urls: item.image_urls || [],
      };
      const res = await fetch(`${API_BASE}/lost-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || '등록 실패');
        return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // 분실물 수정 핸들러
  const handleUpdateItem = async (updatedItem: LostItem): Promise<boolean> => {
    try {
      if (!updatedItem.id) throw new Error('항목 ID가 없습니다.');
      const payload = {
        item_type: updatedItem.item_type || '기타',
        description: updatedItem.description || '',
        location: updatedItem.location || '',
        image_urls: updatedItem.image_urls || [],
      };
      const res = await fetch(`${API_BASE}/lost-items/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || '수정 실패');
        return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home theme={theme} setTheme={setTheme} currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
        <Route path="/list" element={<ListPage theme={theme} setTheme={setTheme} currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
        {/* ✅ /add 페이지에서 EditPage가 바로 렌더링되도록 연결 */}
        <Route
          path="/add"
          element={
            <EditPage
              mode="create"
            currentUser={currentUser} 
                  onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              showToastMessage={showToastMessage}
            theme={theme}
                />
          }
        />
        {/* (선택) /edit/:id 경로 예시 — 필요 없으면 제거해도 됨 */}
        <Route
          path="/edit/:id"
          element={
                <EditPage 
              mode="edit"
                  currentUser={currentUser}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
              showToastMessage={showToastMessage}
                  theme={theme}
              initialItem={{
                // 실제로는 상세 조회해서 채워야 합니다. 우선 임시 값.
                id: 1,
                item_type: '지갑',
                description: '검정색 미니 지갑',
                location: '정문 근처',
              }}
            />
          }
        />
        {/* 상세 페이지 라우트 추가 */}
        <Route
          path="/detail/:id"
          element={
            <DetailPage
                  currentUser={currentUser}
            />
          }
        />
        {/* 로그인 페이지 라우트 추가 */}
        <Route
          path="/login"
          element={
            <LoginPage
                  currentUser={currentUser}
              onLogin={(user) => setCurrentUser(user)}
            />
          }
        />
        {/* 게임 페이지 라우트 추가 */}
        <Route
          path="/game"
          element={
            <GamePage
                  currentUser={currentUser}
            />
          }
        />
        {/* 후기 페이지 라우트 추가 */}
        <Route
          path="/review"
          element={
            <ReviewPage
                  currentUser={currentUser}
            />
          }
        />
        {/* 설정 페이지 라우트 추가 */}
        <Route
          path="/settings"
          element={
            <SettingsPage
                  currentUser={currentUser}
                  theme={theme}
                  setTheme={setTheme}
            />
          }
        />
        {/* 필요시 다른 라우트 추가 */}
            </Routes>
      <ToastUI />
      <AdBar />
    </BrowserRouter>
  );
}
