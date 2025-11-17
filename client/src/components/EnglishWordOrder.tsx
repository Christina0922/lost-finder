import React, { useState, useEffect } from 'react';
import './EnglishWordOrder.css';

interface Puzzle {
  id: number;
  korean_sentence: string;
  english_words: string[];
  correct_order: string[];
  difficulty: number;
  category: string;
}

interface EnglishWordOrderProps {
  userId?: number;
  profile?: any;
  onAnswerSubmit?: (correct: boolean, coinsEarned: number) => void;
}

const EnglishWordOrder: React.FC<EnglishWordOrderProps> = ({ 
  userId = 1, 
  profile,
  onAnswerSubmit 
}) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hintUsed, setHintUsed] = useState(false);
  const [coins, setCoins] = useState(profile?.coins || 100);

  useEffect(() => {
    loadPuzzle();
    if (profile) {
      setCoins(profile.coins);
    }
  }, []);

  const loadPuzzle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/game/english`);
      const data = await response.json();
      if (data.ok && data.puzzle) {
        const puzzleData = data.puzzle;
        // 영어 단어 배열을 섞어서 표시
        const shuffled = [...puzzleData.english_words].sort(() => Math.random() - 0.5);
        setPuzzle(puzzleData);
        setAvailableWords(shuffled);
        setSelectedWords([]);
        setIsSubmitted(false);
        setHintUsed(false);
      }
    } catch (error) {
      console.error('퍼즐 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const useHint = async () => {
    if (hintUsed || !puzzle) return;
    
    if (coins < 50) {
      alert('코인이 부족합니다. 코인을 구매해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          puzzleType: 'english',
          puzzleId: puzzle.id,
          hintCost: 50
        })
      });
      
      const data = await response.json();
      if (data.ok) {
        setHintUsed(true);
        setCoins(data.profile.coins);
        // 힌트 표시 (첫 단어만 보여주기)
        alert(`힌트: 첫 번째 단어는 "${puzzle.correct_order[0]}"입니다.`);
      }
    } catch (error) {
      console.error('힌트 사용 실패:', error);
      alert('힌트 사용에 실패했습니다.');
    }
  };

  const selectWord = (word: string) => {
    if (isSubmitted) return;
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter(w => w !== word));
  };

  const removeWord = (word: string, index: number) => {
    if (isSubmitted) return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  const handleSubmit = async () => {
    if (!puzzle || selectedWords.length === 0 || isSubmitted) return;

    // 대소문자 무시하고 비교
    const correct = selectedWords.join(' ').toLowerCase() === puzzle.correct_order.join(' ').toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);

    try {
      const response = await fetch('http://localhost:5000/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          puzzleType: 'english',
          puzzleId: puzzle.id,
          answer: selectedWords.join(' '),
          correct
        })
      });

      const data = await response.json();
      if (data.ok && data.correct) {
        setCoins(data.profile.coins);
        if (onAnswerSubmit) {
          onAnswerSubmit(true, data.coinsEarned || 10);
        }
      }
    } catch (error) {
      console.error('정답 제출 실패:', error);
    }
  };

  const handleReset = () => {
    if (isSubmitted) return;
    const allWords = [...selectedWords, ...availableWords];
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    setSelectedWords([]);
    setAvailableWords(shuffled);
  };

  const handleNext = () => {
    loadPuzzle();
  };

  if (loading) {
    return (
      <div className="english-quiz-container">
        <div className="loading">퍼즐을 불러오는 중...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="english-quiz-container">
        <div className="error">퍼즐을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="english-quiz-container">
      <div className="quiz-header">
        <div className="coin-display">
          <span className="coin-icon">🪙</span>
          <span className="coin-count">{coins}</span>
        </div>
        <div className="difficulty-badge">난이도: {puzzle.difficulty === 1 ? '초급' : puzzle.difficulty === 2 ? '중급' : '고급'}</div>
      </div>

      <div className="quiz-content">
        <h2 className="quiz-title">영어 단어 순서 맞추기</h2>
        <div className="korean-sentence">{puzzle.korean_sentence}</div>

        <div className="selected-words-container">
          <h3 className="section-title">선택한 단어들 (순서대로 배치하세요)</h3>
          <div className="selected-words">
            {selectedWords.length === 0 ? (
              <div className="empty-hint">단어를 선택하세요 →</div>
            ) : (
              selectedWords.map((word, index) => (
                <button
                  key={`${word}-${index}`}
                  className="word-chip selected"
                  onClick={() => removeWord(word, index)}
                  disabled={isSubmitted}
                >
                  {word}
                  {!isSubmitted && <span className="remove-icon">×</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {isSubmitted && (
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>
                <div className="result-icon">✅ 정답입니다!</div>
                <div className="result-text">올바른 순서: {puzzle.correct_order.join(' ')}</div>
                <div className="coin-reward">🎁 코인 +10개 획득!</div>
              </>
            ) : (
              <>
                <div className="result-icon">❌ 틀렸습니다</div>
                <div className="result-text">정답: {puzzle.correct_order.join(' ')}</div>
                <div className="hint-text">다시 시도해보세요!</div>
              </>
            )}
          </div>
        )}

        <div className="available-words-container">
          <h3 className="section-title">사용 가능한 단어들</h3>
          <div className="available-words">
            {availableWords.map((word, index) => (
              <button
                key={`${word}-${index}`}
                className={`word-chip available ${isSubmitted && puzzle.correct_order.includes(word) ? 'highlight' : ''}`}
                onClick={() => selectWord(word)}
                disabled={isSubmitted}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-actions">
          {!isSubmitted ? (
            <>
              <button
                className="reset-button"
                onClick={handleReset}
                disabled={selectedWords.length === 0}
              >
                🔄 다시 시작
              </button>
              <button
                className="hint-button"
                onClick={useHint}
                disabled={hintUsed || coins < 50}
              >
                💡 힌트 보기 (50코인)
              </button>
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={selectedWords.length === 0 || selectedWords.length !== puzzle.correct_order.length}
              >
                제출하기
              </button>
            </>
          ) : (
            <button className="next-button" onClick={handleNext}>
              다음 문제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnglishWordOrder;

