import React, { useState, useEffect, useCallback } from 'react';
import { gamesAPI } from '../../services/api';
import './SnakeGame.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: 0 };
const GAME_SPEED = 150;

const SnakeGame = ({ onExit, onScoreSaved }) => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

    const generateFood = useCallback(() => {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        return { x, y };
    }, []);

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setFood(generateFood());
        setDirection(INITIAL_DIRECTION);
        setGameOver(false);
        setScore(0);
        setGameStarted(false);
        setHasSubmittedScore(false);
    };

    const handleKeyPress = useCallback((e) => {
        if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            setGameStarted(true);
        }

        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) setDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (direction.y === 0) setDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (direction.x === 0) setDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (direction.x === 0) setDirection({ x: 1, y: 0 });
                break;
            default:
                break;
        }
    }, [direction, gameStarted]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const moveSnake = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: prevSnake[0].x + direction.x,
                    y: prevSnake[0].y + direction.y
                };

                // Check collision with walls
                if (
                    newHead.x < 0 ||
                    newHead.x >= GRID_SIZE ||
                    newHead.y < 0 ||
                    newHead.y >= GRID_SIZE
                ) {
                    setGameOver(true);
                    return prevSnake;
                }

                // Check collision with self
                if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    setGameOver(true);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Check collision with food
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(prev => prev + 10);
                    setFood(generateFood());
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, GAME_SPEED);

        return () => clearInterval(moveSnake);
    }, [direction, food, gameOver, gameStarted, generateFood]);

    useEffect(() => {
        // React strict mode + rerenders can cause effects to run more than once.
        // Guard to prevent double submission for a single run.
        if (gameOver && score > 0 && !hasSubmittedScore) {
            const submitScore = async () => {
                setIsSubmitting(true);
                try {
                    await gamesAPI.submitScore({
                        gameId: 'snake',
                        gameName: 'Snake Game',
                        score: score
                    });
                    setHasSubmittedScore(true);
                    if (typeof onScoreSaved === 'function') {
                        onScoreSaved();
                    }
                    if (score > highScore) {
                        setHighScore(score);
                    }
                } catch (error) {
                    console.error('Failed to submit score:', error);
                } finally {
                    setIsSubmitting(false);
                }
            };
            submitScore();
        }
    }, [gameOver, score, highScore, hasSubmittedScore]);

    return (
        <div className="snake-game-container">
            <div className="game-header">
                <h1>🐍 Snake Game</h1>
                <div className="score-board">
                    <div className="score-item">
                        <span className="label">Score</span>
                        <span className="value">{score}</span>
                    </div>
                    <div className="score-item">
                        <span className="label">High Score</span>
                        <span className="value">{highScore}</span>
                    </div>
                </div>
            </div>

            <div className="game-area">
                {gameOver && (
                    <div className="game-overlay">
                        <h2>Game Over!</h2>
                        <p>Final Score: {score}</p>
                        {isSubmitting && <p className="saving-text">Saving score...</p>}
                        <button className="restart-btn" onClick={resetGame}>
                            Play Again
                        </button>
                    </div>
                )}
                {!gameStarted && !gameOver && (
                    <div className="game-overlay">
                        <h2>Ready?</h2>
                        <p>Use Arrow Keys to Start</p>
                    </div>
                )}

                <div className="grid" style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                        const x = index % GRID_SIZE;
                        const y = Math.floor(index / GRID_SIZE);
                        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                        const isFood = food.x === x && food.y === y;
                        const isHead = snake[0].x === x && snake[0].y === y;

                        return (
                            <div
                                key={index}
                                className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''} ${isHead ? 'head' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="controls-hint">
                <p>Use ⬆️ ⬇️ ⬅️ ➡️ to move</p>
                <button className="back-btn" onClick={onExit || (() => window.history.back())}>
                    Exit Game
                </button>
            </div>
        </div>
    );
};

export default SnakeGame;
