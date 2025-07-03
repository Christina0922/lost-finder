import React from "react";
import { Link } from "react-router-dom";

export default function BottomBanner() {
  return (
    <div className="w-full bg-gray-100 px-4 py-6 mt-10 rounded-2xl shadow-md space-y-6 text-center">

      {/* ✨ 감동 후기 섹션 */}
      <div>
        <p className="text-lg font-semibold">✨ 감동 후기 모음</p>
        <p className="text-sm text-gray-600">
          앱을 통해 분실물을 다시 찾은 분들의 따뜻한 이야기를 곧 소개합니다.
        </p>
        <Link to="/success-stories">
          <button className="mt-3 px-5 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300">
            첫 번째 후기가 되어보세요
          </button>
        </Link>

        {/* 🧠 후기 유도 문장 */}
        <div className="mt-5 text-sm text-gray-800 font-medium leading-relaxed">
          🙏 혹시 이 앱 덕분에 분실물을 찾으셨다면, 알려주세요.<br />
          당신의 이야기가 누군가에게 큰 희망이 될 수 있어요.
        </div>
      </div>

      {/* 🔻 구분선 */}
      <div className="border-t border-gray-300" />

      {/* 🎮 게임 유도 섹션 */}
      <div>
        <p className="text-lg font-semibold">🎮 기다리는 동안 한 판 어떠세요?</p>
        <p className="text-sm text-gray-600">
          우리 엄마가 좋아하셔서 직접 만든 3매치 퍼즐 게임이에요.
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
      </div>
    </div>
  );
} 