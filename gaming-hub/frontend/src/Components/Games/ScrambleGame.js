import React, { useState, useEffect, useCallback } from 'react';
import { gamesAPI } from '../../services/api';
import './ScrambleGame.css';

const WORDS = [
    { word: 'JAVASCRIPT', hint: 'The language of the web' },
    { word: 'REACT', hint: 'A library for building UIs' },
    { word: 'DATABASE', hint: 'Where data is stored' },
    { word: 'SERVER', hint: 'Serves content to clients' },
    { word: 'FRONTEND', hint: 'The part you see' },
    { word: 'BACKEND', hint: 'The part that powers it all' },
    { word: 'COMPONENT', hint: 'Reusable UI piece' },
    { word: 'VARIABLE', hint: 'Stores a value' },
    { word: 'FUNCTION', hint: 'Performs a task' },
    { word: 'DEBUGGING', hint: 'Fixing errors' }
];

const ScrambleGame = ({ onExit }) => {
    const [currentWordObj, setCurrentWordObj] = useState(null);
    const [scrambledWord, setScrambledWord] = useState('');
    const [userGuess, setUserGuess] = useState('');
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(false);


    const scramble = (word) => {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    };

    const nextWord = useCallback(() => {
        const randomObj = WORDS[Math.floor(Math.random() * WORDS.length)];
        setCurrentWordObj(randomObj);
        setScrambledWord(scramble(randomObj.word));
        setUserGuess('');
        setMessage('');
    }, []);

    useEffect(() => {
        nextWord();
    }, [nextWord]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWordObj) return;

        if (userGuess.toUpperCase() === currentWordObj.word) {
            const points = 10 + (streak * 2);
            const newScore = score + points;
            setScore(newScore);
            setStreak(prev => prev + 1);
            setMessage(`Correct! +${points} points`);

            // Submit score periodically or when high enough
            if (newScore > 0 && newScore % 50 === 0) {
                setLoading(true);
                try {
                    await gamesAPI.submitScore({
                        gameId: 'scramble',
                        gameName: 'Scramble',
                        score: newScore
                    });
                } catch (error) {
                    console.error('Error saving score:', error);
                } finally {
                    setLoading(false);
                }
            }

            setTimeout(nextWord, 1500);
        } else {
            setStreak(0);
            setMessage('Try again!');
        }
    };

    const handleSkip = () => {
        setStreak(0);
        nextWord();
    };

    const handleExit = async () => {
        if (score > 0) {
            setLoading(true);
            try {
                await gamesAPI.submitScore({
                    gameId: 'scramble',
                    gameName: 'Scramble',
                    score: score
                });
            } catch (error) {
                console.error('Error saving score on exit:', error);
            } finally {
                setLoading(false);
                if (onExit) onExit();
                else window.history.back();
            }
        } else {
            if (onExit) onExit();
            else window.history.back();
        }
    };

    return (
        <div className="scramble-game-container">
            <div className="game-header">
                <h1>🔤 Word Scramble</h1>
                <div className="stats-bar">
                    <div className="stat">
                        <span className="label">Score</span>
                        <span className="value">{score}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Streak</span>
                        <span className="value">🔥 {streak}</span>
                    </div>
                </div>
            </div>

            <div className="game-card">
                <div className="scrambled-display">
                    {scrambledWord.split('').map((char, index) => (
                        <span key={index} className="char-tile">{char}</span>
                    ))}
                </div>

                <p className="hint">💡 Hint: {currentWordObj?.hint}</p>

                <form onSubmit={handleSubmit} className="guess-form">
                    <input
                        type="text"
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        placeholder="Type your answer..."
                        className="guess-input"
                        autoFocus
                    />
                    <button type="submit" className="submit-btn">Check</button>
                </form>

                {message && (
                    <div className={`message ${message.includes('Correct') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="controls">
                    <button onClick={handleSkip} className="skip-btn">Skip Word</button>
                    <button onClick={handleExit} className="exit-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Exit & Save'}
                    </button>
                </div>

                {loading && <p className="saving-indicator">Saving progress...</p>}
            </div>
        </div>
    );
};

export default ScrambleGame;
