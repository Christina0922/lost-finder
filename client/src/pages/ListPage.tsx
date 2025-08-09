// C:\LostFinderProject\client\src\pages\ListPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LostItem, User } from '../types';
import { getAllLostItems } from '../utils/api';
import LazyImage from '../components/LazyImage';
import './ListPage.css';

interface ListPageProps {
  currentUser?: User | null;
}

const ListPage: React.FC<ListPageProps> = ({ currentUser = null }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostItem[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getAllLostItems();
      setItems(data);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((it) =>
      (it.description + (it.location || '')).toLowerCase().includes(q.toLowerCase())
    );
  }, [q, items]);

  return (
    <div className="list-page">
      <header className="list-header">
        <button onClick={() => navigate(-1)} className="back-btn">뒤로</button>
        <h1>분실물 목록</h1>
        <button onClick={() => navigate('/add')}>등록</button>
      </header>

      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="검색"
      />

      <ul className="list">
        {filtered.map((it) => (
          <li key={it.id} className="card">
            <LazyImage src="" alt={it.description} />
            <div className="meta">
              <strong>{it.description}</strong>
              {it.location && <p>위치: {it.location}</p>}
              <div className="actions">
                <Link to={`/edit/${it.id}`}>수정</Link>
                <Link to={`/detail/${it.id}`}>상세</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!filtered.length && <p className="empty">검색 결과가 없습니다.</p>}
    </div>
  );
};

export default ListPage;
