import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameCard = ({ game }) => {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate(game.path);
    };

    return (
        <div className="game-card" onClick={handlePlayClick} style={{ cursor: 'pointer' }}>
            <div
                className="game-image"
                style={{ backgroundImage: `url(${game.image})` }}
            >
                {/* Overlay or badge could go here */}
            </div>

            <div className="game-info">
                <h3>{game.title}</h3>
                <p className="game-description">{game.description}</p>

                <div className="game-stats">
                    <span className="high-score">
                        🏆 High Score: {game.highScore}
                    </span>
                </div>

                <button
                    className="play-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlayClick();
                    }}
                >
                    PLAY NOW
                </button>
            </div>
        </div>
    );
};

export default GameCard;