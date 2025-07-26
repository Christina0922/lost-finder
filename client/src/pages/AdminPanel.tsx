import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetailPage.css';

interface AuthLog {
  timestamp: string;
  type: string;
  identifier: string;
  success: boolean;
  details: string;
  ip: string;
  alert?: boolean;
}

interface SuspiciousActivity {
  recentFailures: number;
  suspiciousIdentifiers: Array<{ identifier: string; failureCount: number }>;
  resetAttempts: number;
  totalFailures: number;
  lastHour: number;
  lastDay: number;
}

interface AuthStats {
  total: number;
  success: number;
  failed: number;
  byType: Record<string, { total: number; success: number; failed: number }>;
}

interface AdminPanelProps {
  theme: 'light' | 'dark';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ theme }) => {
  const navigate = useNavigate();
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity | null>(null);
  const [stats, setStats] = useState<AuthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterIdentifier, setFilterIdentifier] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || user.role !== 'admin') {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      setIsAuthorized(true);
      setCheckingAuth(false);
      fetchData();
    } catch (error) {
      console.error('관리자 인증 확인 실패:', error);
      setIsAuthorized(false);
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      const interval = setInterval(fetchData, 30000); // 30초마다 새로고침
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 인증 로그 조회 (필터 적용)
      const logsResponse = await fetch(`http://localhost:3000/api/auth-logs?type=${filterType}&identifier=${filterIdentifier}&limit=50`);
      const logsData = await logsResponse.json();
      
      if (logsData.success) {
        setAuthLogs(logsData.logs);
        setStats(logsData.stats);
      }
      
      // 의심스러운 활동 조회
      const suspiciousResponse = await fetch('http://localhost:3000/api/suspicious-activity');
      const suspiciousData = await suspiciousResponse.json();
      
      if (suspiciousData.success) {
        setSuspiciousActivity(suspiciousData.suspiciousActivity);
      }
    } catch (error) {
      console.error('관리자 패널 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 시 데이터 새로고침
  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [filterType, filterIdentifier]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'login': return '#007bff';
      case 'reset_request': return '#28a745';
      case 'reset_link_request': return '#17a2b8';
      case 'reset_link_complete': return '#28a745';
      case 'verification': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  if (checkingAuth) {
    return (
      <div className="form-container-wrapper">
        <h1>🔒 관리자 검토 패널</h1>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner"></div>
          <p>권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="form-container-wrapper">
        <h1>🔒 관리자 검토 패널</h1>
        <div className="form-container">
          <div style={{ 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb', 
            borderRadius: '8px', 
            padding: '30px', 
            textAlign: 'center' 
          }}>
            <h2 style={{ color: '#721c24', marginBottom: '20px' }}>🚫 접근 권한이 없습니다</h2>
            <p style={{ color: '#721c24', marginBottom: '20px', fontSize: '16px' }}>
              이 페이지는 관리자 권한이 필요합니다.<br />
              관리자 계정으로 로그인해주세요.
            </p>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              로그인 페이지로 이동
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              메인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="form-container-wrapper">
        <h1>🔒 관리자 검토 패널</h1>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container-wrapper">
      <h1>🔒 관리자 검토 패널</h1>
      
      {/* 통계 요약 */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>총 로그</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.total}</p>
          </div>
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>성공</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.success}</p>
          </div>
          <div style={{ 
            backgroundColor: '#ffebee', 
            padding: '15px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c62828' }}>실패</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.failed}</p>
          </div>
        </div>
      )}

      {/* 의심스러운 활동 알림 */}
      {suspiciousActivity && suspiciousActivity.suspiciousIdentifiers.length > 0 && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ 의심스러운 활동 감지</h3>
          <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
            최근 24시간 내 5회 이상 로그인 실패한 계정:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {suspiciousActivity.suspiciousIdentifiers.map((item, index) => (
              <li key={index} style={{ color: '#856404' }}>
                {item.identifier}: {item.failureCount}회 실패
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 필터 */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🔍 필터 및 검색</h3>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d' }}>타입</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minWidth: '150px'
              }}
            >
              <option value="">모든 타입</option>
              <option value="login">로그인</option>
              <option value="reset_request">비밀번호 재설정</option>
              <option value="reset_link_request">재설정 링크 요청</option>
              <option value="reset_link_complete">재설정 완료</option>
              <option value="verification">인증</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d' }}>식별자 검색</label>
            <input 
              type="text" 
              placeholder="이메일, 전화번호, 사용자명..." 
              value={filterIdentifier} 
              onChange={(e) => setFilterIdentifier(e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minWidth: '200px'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d' }}>&nbsp;</label>
            <button 
              onClick={fetchData}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              🔄 새로고침
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', color: '#6c757d' }}>&nbsp;</label>
            <button 
              onClick={() => {
                setFilterType('');
                setFilterIdentifier('');
              }}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              🗑️ 필터 초기화
            </button>
          </div>
        </div>
        {(filterType || filterIdentifier) && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px 12px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '4px',
            fontSize: '14px',
            color: '#1976d2'
          }}>
            📊 현재 필터: {filterType ? `타입: ${filterType}` : ''} {filterType && filterIdentifier ? ' | ' : ''} {filterIdentifier ? `검색: ${filterIdentifier}` : ''}
          </div>
        )}
      </div>

      {/* 인증 로그 테이블 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>시간</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>타입</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>식별자</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>상태</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>상세</th>
            </tr>
          </thead>
          <tbody>
            {authLogs.map((log, index) => (
              <tr key={index} style={{ 
                borderBottom: '1px solid #f1f3f4',
                backgroundColor: log.alert ? '#fff3cd' : 'transparent',
                borderLeft: log.alert ? '4px solid #ffc107' : 'none'
              }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {formatTimestamp(log.timestamp)}
                  {log.alert && <span style={{ marginLeft: '8px', color: '#ffc107' }}>⚠️</span>}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    backgroundColor: getTypeColor(log.type), 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {log.type}
                  </span>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                  {log.identifier}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    color: log.success ? '#28a745' : '#dc3545',
                    fontWeight: 'bold' 
                  }}>
                    {getStatusIcon(log.success)} {log.success ? '성공' : '실패'}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {log.details}
                  {log.alert && (
                    <span style={{ 
                      marginLeft: '8px', 
                      backgroundColor: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      알림
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {authLogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>표시할 로그가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 