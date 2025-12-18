import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leaderboardAPI } from '../../services/api';
import LeaderboardPage from '../Leaderboard/LeaderboardPage';
import SnakeGame from '../Games/SnakeGame';
import ScrambleGame from '../Games/ScrambleGame';
import FlagGame from '../Games/FlagGame/Game';
import ChangeNameModal from './ChangeNameModal';
import DeleteScoreModal from './DeleteScoreModal';
import './HubPage.css';

const HubPage = () => {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState({
        gamesPlayed: 0,
        totalScore: 0,
        globalRank: '-'
    });
    const [activeGame, setActiveGame] = useState(null);
    const [showChangeNameModal, setShowChangeNameModal] = useState(false);
    const [showDeleteScoreModal, setShowDeleteScoreModal] = useState(false);

    const gameSectionRef = useRef(null);
    const leaderboardSectionRef = useRef(null);

    const scrollToSection = (ref) => {
        if (!ref?.current) return;
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const fetchUserStats = async () => {
        if (!user?.id) return;
        try {
            const response = await leaderboardAPI.getUserStats(user.id);
            const stats = response.data?.data || response.data || {};
            setUserStats({
                gamesPlayed: stats.gamesPlayed ?? 0,
                totalScore: stats.totalScore ?? 0,
                globalRank: (stats.globalRank && stats.globalRank > 0) ? stats.globalRank : '-'
            });
        } catch (err) {
            // Don’t block the page if stats fail; keep defaults.
            console.error('Failed to fetch user stats:', err);
        }
    };

    useEffect(() => {
        fetchUserStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handlePlayGame = (gameId) => {
        setActiveGame(gameId);
        // ensure the game container is visible after picking a game
        setTimeout(() => scrollToSection(gameSectionRef), 0);
    };

    const handleExitGame = () => {
        setActiveGame(null);
        fetchUserStats();
    };

    const handleUsernameChange = (updatedUser) => {
        if (!updatedUser) return;
        setUser(updatedUser);
    };

    const handleScoreDeleted = () => {
        fetchUserStats();
    };

    const games = [
        {
            id: 'snake',
            title: 'Snake Game',
            description: 'Classic snake game with modern twist. Eat food and grow longer!',
            image: `${process.env.PUBLIC_URL}/assets/games/snake.png`,
            highScore: 1250,
            component: <SnakeGame onExit={handleExitGame} onScoreSaved={fetchUserStats} />
        },
        {
            id: 'flag',
            title: 'Guess the Flag',
            description: 'Test your geography knowledge! Guess the country from its flag.',
            image: `${process.env.PUBLIC_URL}/assets/games/guess-the-flag.jpg`,
            highScore: 850,
            component: <FlagGame onExit={handleExitGame} onScoreSaved={fetchUserStats} />
        },
        {
            id: 'scramble',
            title: 'Word Scramble',
            description: 'Unscramble the computer science words. Test your knowledge and speed!',
            image: `${process.env.PUBLIC_URL}/assets/games/scramble.png`,
            highScore: 3200,
            component: <ScrambleGame onExit={handleExitGame} onScoreSaved={fetchUserStats} />
        }
    ];

    const activeGameComponent = games.find(g => g.id === activeGame)?.component;

    return (
        <div className="hub-page">
            <header className="hub-header">
                <div className="header-content">
                    <div className="user-info">
                        <div className="user-avatar">
                            <span>{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="user-details">
                            <h2>Welcome back, {user?.username}</h2>
                            <div className="user-stats-summary">
                                <span>🎮 {userStats.gamesPlayed} Games</span>
                                <span>⭐ {userStats.totalScore} Points</span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            className="action-btn change-name-btn"
                            onClick={() => setShowChangeNameModal(true)}
                        >
                            ✏️ Change Name
                        </button>
                        <button
                            className="action-btn delete-score-btn"
                            onClick={() => setShowDeleteScoreModal(true)}
                        >
                            🗑️ Delete Score
                        </button>
                        <button
                            className="action-btn leaderboard-btn"
                            onClick={() => scrollToSection(leaderboardSectionRef)}
                        >
                            🏆 Leaderboard
                        </button>
                        <button className="action-btn logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="hub-main">
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon games">🎮</div>
                        <div className="stat-info">
                            <h3>Games Played</h3>
                            <p className="stat-value">{userStats.gamesPlayed}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon score">⭐</div>
                        <div className="stat-info">
                            <h3>Total Score</h3>
                            <p className="stat-value">{userStats.totalScore}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon rank">🏅</div>
                        <div className="stat-info">
                            <h3>Global Rank</h3>
                            <p className="stat-value">#{userStats.globalRank}</p>
                        </div>
                    </div>
                </div>

                <div className="games-section">
                    <div className="section-header">
                        <h2>Available Games</h2>
                        <p>Choose a game to play and compete with other players!</p>
                    </div>

                    <div className="games-grid">
                        {games.map(game => (
                            <div key={game.id} className="game-card" onClick={() => handlePlayGame(game.id)}>
                                <div className="game-image">
                                    <img
                                        src={game.image}
                                        alt={game.title}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="game-content">
                                    <h3>{game.title}</h3>
                                    <p className="game-description">{game.description}</p>
                                    <div className="game-meta">
                                        <span className="high-score">
                                            🏆 Best: {game.highScore}
                                        </span>
                                        <button className="play-btn">Play Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div ref={gameSectionRef} className="active-game-section">
                    {activeGame && (
                        <div className="game-container-wrapper">
                            {activeGameComponent}
                        </div>
                    )}
                </div>

                <div ref={leaderboardSectionRef} className="leaderboard-section-wrapper">
                    <LeaderboardPage isEmbedded={true} />
                </div>
            </main>

            <footer className="hub-footer">
                <p>© 2024 Gaming Hub • Play responsibly</p>
            </footer>

            <ChangeNameModal
                isOpen={showChangeNameModal}
                onClose={() => setShowChangeNameModal(false)}
                currentUsername={user?.username || ''}
                onSuccess={handleUsernameChange}
            />

            <DeleteScoreModal
                isOpen={showDeleteScoreModal}
                onClose={() => setShowDeleteScoreModal(false)}
                userId={user?.id}
                onScoreDeleted={handleScoreDeleted}
            />
        </div>
    );
};

export default HubPage;