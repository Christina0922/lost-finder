import {
  gameDb,
  getKoreanPuzzle,
  getEnglishPuzzle,
} from './game-db.js';

// 한글 맞춤법 퍼즐 샘플 데이터 (초등학생용)
const koreanPuzzles = [
  {
    question: "나무가 ___ 있어요.",
    option1: "서",
    option2: "써",
    correct_answer: "서",
    explanation: "'서'는 '서다'의 어간으로, '나무가 서 있어요'가 맞습니다.",
    difficulty: 1,
    category: "기초"
  },
  {
    question: "바람이 ___ 분다.",
    option1: "세차게",
    option2: "새차게",
    correct_answer: "세차게",
    explanation: "'세차게'는 바람이 강하게 분다는 의미입니다.",
    difficulty: 1,
    category: "기초"
  },
  {
    question: "저는 책을 ___.",
    option1: "읽어요",
    option2: "일거요",
    correct_answer: "읽어요",
    explanation: "'읽다'의 존댓말은 '읽어요'입니다.",
    difficulty: 1,
    category: "기초"
  },
  {
    question: "밥을 ___ 먹어요.",
    option1: "맛있게",
    option2: "맛이게",
    correct_answer: "맛있게",
    explanation: "'맛있다'의 활용형은 '맛있게'입니다.",
    difficulty: 1,
    category: "기초"
  },
  {
    question: "친구와 함께 ___ 놀아요.",
    option1: "즐겁게",
    option2: "즐거웁게",
    correct_answer: "즐겁게",
    explanation: "'즐겁다'의 활용형은 '즐겁게'입니다.",
    difficulty: 1,
    category: "기초"
  },
  {
    question: "물이 ___ 흐른다.",
    option1: "시원하게",
    option2: "시원히",
    correct_answer: "시원하게",
    explanation: "형용사 '시원하다'는 부사형이 '시원하게'입니다.",
    difficulty: 2,
    category: "중급"
  },
  {
    question: "아이가 ___ 웃어요.",
    option1: "예쁘게",
    option2: "예뻐게",
    correct_answer: "예쁘게",
    explanation: "'예쁘다'의 활용형은 '예쁘게'입니다.",
    difficulty: 1,
    category: "기초"
  },
  {
    question: "공부를 ___ 해요.",
    option1: "열심히",
    option2: "열심이",
    correct_answer: "열심히",
    explanation: "'열심히'는 부사로 사용됩니다.",
    difficulty: 2,
    category: "중급"
  },
  {
    question: "선생님이 ___ 설명해 주세요.",
    option1: "자세히",
    option2: "자세이",
    correct_answer: "자세히",
    explanation: "'자세하다'의 부사형은 '자세히'입니다.",
    difficulty: 2,
    category: "중급"
  },
  {
    question: "집에 ___ 가요.",
    option1: "빨리",
    option2: "빨리",
    correct_answer: "빨리",
    explanation: "'빨리'는 부사로 사용됩니다.",
    difficulty: 1,
    category: "기초"
  }
];

// 영어 단어 순서 퍼즐 샘플 데이터
const englishPuzzles = [
  {
    korean_sentence: "나는 매일 책을 읽어요.",
    english_words: ["read", "books", "I", "every", "day"],
    correct_order: ["I", "read", "books", "every", "day"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "그는 아침에 커피를 마셔요.",
    english_words: ["coffee", "he", "drinks", "morning", "in", "the"],
    correct_order: ["He", "drinks", "coffee", "in", "the", "morning"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "우리는 함께 공부해요.",
    english_words: ["study", "we", "together"],
    correct_order: ["We", "study", "together"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "그들은 영화를 봐요.",
    english_words: ["movies", "they", "watch"],
    correct_order: ["They", "watch", "movies"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "나는 영어를 배우고 있어요.",
    english_words: ["learning", "English", "I", "am"],
    correct_order: ["I", "am", "learning", "English"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "그녀는 학교에 가요.",
    english_words: ["to", "goes", "school", "she"],
    correct_order: ["She", "goes", "to", "school"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "나는 친구를 만나요.",
    english_words: ["meet", "my", "I", "friend"],
    correct_order: ["I", "meet", "my", "friend"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "우리는 점심을 먹어요.",
    english_words: ["lunch", "have", "we"],
    correct_order: ["We", "have", "lunch"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "나는 노래를 좋아해요.",
    english_words: ["like", "I", "songs"],
    correct_order: ["I", "like", "songs"],
    difficulty: 1,
    category: "기초"
  },
  {
    korean_sentence: "그는 자전거를 타요.",
    english_words: ["rides", "bike", "he", "a"],
    correct_order: ["He", "rides", "a", "bike"],
    difficulty: 1,
    category: "기초"
  }
];

async function initGameData() {
  console.log('📝 게임 초기 데이터 삽입 시작...');

  // 한글 맞춤법 퍼즐 삽입
  let koreanCount = 0;
  for (const puzzle of koreanPuzzles) {
    gameDb.run(
      `INSERT OR IGNORE INTO korean_spelling_puzzles 
       (question, option1, option2, correct_answer, explanation, difficulty, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        puzzle.question,
        puzzle.option1,
        puzzle.option2,
        puzzle.correct_answer,
        puzzle.explanation,
        puzzle.difficulty,
        puzzle.category
      ],
      function (err) {
        if (err) {
          console.error(`❌ 한글 퍼즐 삽입 실패:`, err);
        } else if (this.changes > 0) {
          koreanCount++;
        }
      }
    );
  }

  // 영어 단어 순서 퍼즐 삽입
  let englishCount = 0;
  for (const puzzle of englishPuzzles) {
    gameDb.run(
      `INSERT OR IGNORE INTO english_word_order_puzzles 
       (korean_sentence, english_words, correct_order, difficulty, category)
       VALUES (?, ?, ?, ?, ?)`,
      [
        puzzle.korean_sentence,
        JSON.stringify(puzzle.english_words),
        JSON.stringify(puzzle.correct_order),
        puzzle.difficulty,
        puzzle.category
      ],
      function (err) {
        if (err) {
          console.error(`❌ 영어 퍼즐 삽입 실패:`, err);
        } else if (this.changes > 0) {
          englishCount++;
        }
      }
    );
  }

  // 약간의 지연 후 카운트 확인
  setTimeout(() => {
    console.log(`✅ 한글 맞춤법 퍼즐 ${koreanCount}개 삽입 완료`);
    console.log(`✅ 영어 단어 순서 퍼즐 ${englishCount}개 삽입 완료`);
    console.log('🎮 게임 데이터 초기화 완료!');
    process.exit(0);
  }, 2000);
}

initGameData();

