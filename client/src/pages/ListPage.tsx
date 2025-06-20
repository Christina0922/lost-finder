import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LostItem, User } from '../App'; // App.tsx에서 LostItem 타입을 가져옵니다.
import './ListPage.css';

// ListPage가 받을 props의 타입을 정의합니다.
interface ListPageProps {
  items: LostItem[];
  currentUser: User | null;
  onDeleteItem: (itemId: number) => void;
}

const ListPage: React.FC<ListPageProps> = ({ items, currentUser, onDeleteItem }) => {
  const navigate = useNavigate();

  const handleDeleteClick = (itemId: number) => {
    if (window.confirm('이 게시물을 정말 삭제하시겠습니까?')) {
      onDeleteItem(itemId);
    }
  };

  const handleEditClick = (itemId: number) => {
    navigate(`/edit/${itemId}`);
  };

  return (
    <div>
      <h1>분실물 목록</h1>
      {items.length === 0 ? (
        <p>등록된 분실물이 없습니다.</p>
      ) : (
        <div className="list-container">
          {items.map((item) => (
            <div key={item.id} className="list-item">
              <Link to={`/detail/${item.id}`} className="list-item-image-link">
                <img src={(item.imageUrls && item.imageUrls[0]) || 'https://via.placeholder.com/200x150'} alt={item.itemType} className="list-item-image" />
                {item.imageUrls && item.imageUrls.length > 1 && (
                  <span className="image-count-badge">
                    +{item.imageUrls.length - 1}
                  </span>
                )}
              </Link>
              <div className="list-item-content">
                <h2>{item.itemType}</h2>
                <p><strong>분실 장소:</strong> {item.location}</p>
                <Link to={`/detail/${item.id}`} className="detail-button">
                  상세보기 및 댓글
                </Link>
                {currentUser && currentUser.id === item.authorId && (
                  <div className="item-actions">
                    <button onClick={() => handleEditClick(item.id)} className="edit-button">
                      수정
                    </button>
                    <button onClick={() => handleDeleteClick(item.id)} className="delete-button">
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListPage; 