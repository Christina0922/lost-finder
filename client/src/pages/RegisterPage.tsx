// C:\LostFinderProject\client\src\pages\RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import TopBar from '../components/TopBar';
import { createLostItem } from '../utils/api';

interface Props {
  currentUser?: User | null;
  onLogout: () => void;
}

const RegisterPage: React.FC<Props> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setErr('최대 5개의 이미지만 업로드할 수 있습니다.');
      return;
    }
    
    setSelectedFiles(files);
    
    // 미리보기 URL 생성
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // 기존 URL 해제
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    
    // 필수 필드 검증
    if (!itemType.trim() || !location.trim()) {
      setErr('분실물 종류와 위치는 필수입니다.');
      setBusy(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('item_type', itemType.trim());
      formData.append('location', location.trim());
      formData.append('description', description.trim());
      
      // 사용자 정보 추가
      if (currentUser) {
        if (currentUser.id) {
          formData.append('author_id', String(currentUser.id));
        }
        if (currentUser.email) {
          formData.append('author_email', currentUser.email);
        }
        if (currentUser.name || currentUser.username) {
          formData.append('author_name', currentUser.name || currentUser.username || '');
        }
      }
      
      // 파일 추가
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      console.log('📤 분실물 등록 시도:', { itemType, location, description, fileCount: selectedFiles.length });
      
      const result = await createLostItem(formData);
      
      console.log('✅ 분실물 등록 성공:', result);

      // ✅ 등록 성공 시 목록으로 이동 + 새로고침 트리거 쿼리
      const ts = Date.now();
      navigate(`/list?refresh=${ts}`, { replace: true });
    } catch (e: any) {
      console.error('❌ 분실물 등록 실패:', e);
      const errorMessage = e?.message || '등록에 실패했습니다. 서버가 실행 중인지 확인해주세요.';
      setErr(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ paddingBottom: 92 }}>
      <TopBar isLoggedIn={!!currentUser} onLogout={onLogout} />
      <div style={{ padding: '16px 16px 24px' }}>
        <h2>분실물 등록하기</h2>
        <form onSubmit={onSubmit}>
          <label>분실물 종류</label>
          <input
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            required
            style={{ width: '100%', padding: 10, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <label>분실 위치</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: '100%', padding: 10, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <label>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 10, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />

          <label>이미지 첨부 (최대 5개)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ width: '100%', padding: 10, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />

          {/* 이미지 미리보기 */}
          {previewUrls.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label>미리보기:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && <div style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}

          <button
            type="submit"
            disabled={busy}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: 0, background: '#2563eb', color: '#fff', fontWeight: 700 }}
          >
            {busy ? '등록 중…' : '등록'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;