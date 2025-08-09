// C:\LostFinderProject\client\src\pages\RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LostItem } from '../types';
import { addLostItem } from '../utils/api';
import './RegisterPage.css';

interface RegisterPageProps {
  currentUser?: User | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ currentUser = null }) => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await addLostItem({
      item_type: itemType,
      description,
      location,
      image_urls: []
    });
    if (ok) navigate('/list');
  };

  return (
    <div className="register-page">
      <h1>분실물 등록</h1>
      <form onSubmit={submit}>
        <div>
          <label>물건 종류:</label>
          <select value={itemType} onChange={(e) => setItemType(e.target.value)} required>
            <option value="">선택하세요</option>
            <option value="자전거">자전거</option>
            <option value="킥보드">킥보드</option>
            <option value="택배">택배</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div>
          <label>설명:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>분실 위치:</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default RegisterPage;
