import React, { useState, useEffect } from 'react';
import './KoreanSpellingQuiz.css';

interface Puzzle {
  id: number;
  question: string;
  option1: string;
  option2: string;
  correct_answer: string;
  explanation?: string;
  difficulty: number;
  category: string;
}

interface KoreanSpellingQuizProps {
  userId?: number;
  profile?: any;
  onAnswerSubmit?: (correct: boolean, coinsEarned: number) => void;
}

const KoreanSpellingQuiz: React.FC<KoreanSpellingQuizProps> = ({ 
  userId = 1, 
  profile,
  onAnswerSubmit 
}) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
      const response = await fetch(`http://localhost:5000/api/game/korean`);
      const data = await response.json();
      if (data.ok && data.puzzle) {
        setPuzzle(data.puzzle);
        setSelectedAnswer(null);
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
          puzzleType: 'korean',
          puzzleId: puzzle.id,
          hintCost: 50
        })
      });
      
      const data = await response.json();
      if (data.ok) {
        setHintUsed(true);
        setCoins(data.profile.coins);
        // 힌트 표시 (첫 글자만 보여주기)
        alert(`힌트: 정답은 "${puzzle.correct_answer[0]}"로 시작합니다.`);
      }
    } catch (error) {
      console.error('힌트 사용 실패:', error);
      alert('힌트 사용에 실패했습니다.');
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !puzzle || isSubmitted) return;

    const correct = selectedAnswer === puzzle.correct_answer;
    setIsCorrect(correct);
    setIsSubmitted(true);

    try {
      const response = await fetch('http://localhost:5000/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          puzzleType: 'korean',
          puzzleId: puzzle.id,
          answer: selectedAnswer,
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

  const handleNext = () => {
    loadPuzzle();
  };

  if (loading) {
    return (
      <div className="korean-quiz-container">
        <div className="loading">퍼즐을 불러오는 중...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="korean-quiz-container">
        <div className="error">퍼즐을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="korean-quiz-container">
      <div className="quiz-header">
        <div className="coin-display">
          <span className="coin-icon">🪙</span>
          <span className="coin-count">{coins}</span>
        </div>
        <div className="difficulty-badge">난이도: {puzzle.difficulty === 1 ? '초급' : puzzle.difficulty === 2 ? '중급' : '고급'}</div>
      </div>

      <div className="quiz-content">
        <h2 className="quiz-title">한글 맞춤법 퀴즈</h2>
        <div className="question-text">{puzzle.question}</div>

        <div className="options-container">
          <button
            className={`option-button ${selectedAnswer === puzzle.option1 ? 'selected' : ''} ${
              isSubmitted && puzzle.option1 === puzzle.correct_answer ? 'correct' : ''
            } ${isSubmitted && puzzle.option1 !== puzzle.correct_answer && selectedAnswer === puzzle.option1 ? 'incorrect' : ''}`}
            onClick={() => handleAnswerSelect(puzzle.option1)}
            disabled={isSubmitted}
          >
            {puzzle.option1}
          </button>
          <button
            className={`option-button ${selectedAnswer === puzzle.option2 ? 'selected' : ''} ${
              isSubmitted && puzzle.option2 === puzzle.correct_answer ? 'correct' : ''
            } ${isSubmitted && puzzle.option2 !== puzzle.correct_answer && selectedAnswer === puzzle.option2 ? 'incorrect' : ''}`}
            onClick={() => handleAnswerSelect(puzzle.option2)}
            disabled={isSubmitted}
          >
            {puzzle.option2}
          </button>
        </div>

        {isSubmitted && puzzle.explanation && (
          <div className={`explanation ${isCorrect ? 'correct-explanation' : 'incorrect-explanation'}`}>
            <strong>{isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다.'}</strong>
            <p>{puzzle.explanation}</p>
            {isCorrect && <p className="coin-reward">🎁 코인 +10개 획득!</p>}
          </div>
        )}

        <div className="quiz-actions">
          {!isSubmitted ? (
            <>
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
                disabled={!selectedAnswer}
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

export default KoreanSpellingQuiz;

