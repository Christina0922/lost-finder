import React from "react";
import { Link } from "react-router-dom";

export default function BottomBanner() {
  return (
    <div className="w-full bg-gray-100 px-4 py-6 mt-10 rounded-2xl shadow-md space-y-6 text-center">

      {/* ✨ 감동 후기 섹션 */}
      <div>
        <p className="text-lg font-semibold" style={{ textAlign: 'center', marginBottom: 8 }}>
          ✨ 감동 후기 모음
        </p>
        <p className="text-sm text-gray-600" style={{ textAlign: 'center', marginBottom: 16 }}>
          우리가 다시 만난 소중한 물건들<br />그 이야기를 여기에 남겨주세요
        </p>
        <Link to="/success-stories">
          <button className="mt-3 px-5 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300">
            첫 번째 후기가 되어보세요
          </button>
        </Link>
        {/* 안내 메시지는 여기만! */}
        <div className="important-message mt-4 mb-2" style={{ color: '#222', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.5, textAlign: 'center' }}>
          혹시 이 앱 덕분에 분실물을 찾으셨다면, 알려주세요.<br />
          당신의 이야기가 누군가에게 큰 희망이 될 수 있어요.
        </div>

        {/* 후기/게임 구분선 - 중간에 확실히 보이게 hr로 */}
        <hr style={{ border: '0', borderTop: '2.5px solid #bbb', margin: '28px 0 18px 0', width: '100%' }} />
      </div>

      {/* 기다리는 동안 한 판 어떠세요? 게임 유도 섹션 */}
      <div>
        <p className="text-lg font-semibold" style={{ textAlign: 'center', marginBottom: 8 }}>
          {/* 문구 삭제 및 두 줄 안내문만 남김 */}
        </p>
        <p
          className="text-gray-600"
          style={{
            fontSize: "0.97rem",
            marginBottom: 18,
            color: "#555",
            lineHeight: 1.5,
          }}
        >
          기다리는 동안, 잠시 머리를 식힐 수 있는<br />퍼즐 게임 한 판 어때요?
        </p>
        <a
          href="https://3match-game-865e.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="mt-3 px-5 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-400">
            퍼즐 맞추러 가기
          </button>
        </a>
        {/* 여기에는 안내 메시지 없음! */}
      </div>
    </div>
  );
}