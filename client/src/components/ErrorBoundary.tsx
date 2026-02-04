import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary가 에러를 잡았습니다:', error);
    console.error('❌ 에러 스택:', error.stack);
    console.error('❌ 에러 정보:', errorInfo);
    console.error('❌ 컴포넌트 스택:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#333', 
          background: '#fff', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#667eea', fontSize: '24px', marginBottom: '16px' }}>오류가 발생했습니다</h2>
          <p style={{ marginBottom: '20px', fontSize: '16px', color: '#718096' }}>
            {this.state.error?.message || '알 수 없는 오류'}
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }} 
            style={{ 
              padding: '12px 24px', 
              background: '#667eea', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

