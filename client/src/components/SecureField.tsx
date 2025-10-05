// C:\LostFinderProject\client\src\components\SecureField.tsx
import React, { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'email';
  /** true면 ● 마스킹(비밀번호용). password 타입은 절대 사용하지 않습니다. */
  mask?: boolean;
};

const boxStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 48,
  padding: '12px 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 16,
  background: '#fff',
  outline: 'none',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const SecureField: React.FC<Props> = ({ value, onChange, placeholder, inputMode = 'text', mask }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 닫힌 Shadow DOM 내부에 input(type=text) 생성
  useEffect(() => {
    if (!hostRef.current) return;
    if ((hostRef.current as any).__secure_ready) return;

    const root = (hostRef.current as any).attachShadow?.({
      mode: 'closed',
      delegatesFocus: true,
    }) as ShadowRoot | undefined;

    if (!root) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      :host { all: initial; }
      input {
        all: unset;
        box-sizing: border-box;
        width: 100%;
        min-height: 48px;
        padding: 0;
        font-size: 16px;
        font-family: inherit;
      }
      ${mask ? `input { -webkit-text-security: disc; }` : ''}
      input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px #fff inset;
        box-shadow: inset 0 0 0 50px #fff;
      }
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    // 일부 브라우저는 프로퍼티 문자열, 일부는 미지원 → attribute로 통일
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('autocorrect', 'off'); // ★ 타입 에러 원인 해결: attribute로 지정
    input.spellcheck = false;
    input.inputMode = inputMode;
    input.placeholder = placeholder ?? '';
    // 일반적인 키워드 회피
    input.name = `lf_${Math.random().toString(36).slice(2, 8)}`;
    input.id = `lf_${Math.random().toString(36).slice(2, 8)}`;

    const onInput = () => onChange(input.value);
    input.addEventListener('input', onInput);

    root.appendChild(styleEl);
    root.appendChild(input);

    inputRef.current = input;
    (hostRef.current as any).__secure_ready = true;

    // 초기 value 반영
    queueMicrotask(() => {
      if (inputRef.current && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    });

    return () => {
      input.removeEventListener('input', onInput);
      inputRef.current = null;
    };
  }, [mask, inputMode, onChange]);

  // 외부 value가 바뀌면 내부 input에 반영
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return <div ref={hostRef} tabIndex={0} style={boxStyle} />;
};

export default SecureField;
