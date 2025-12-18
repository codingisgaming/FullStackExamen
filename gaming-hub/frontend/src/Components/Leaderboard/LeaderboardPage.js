import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leaderboardAPI } from '../../services/api';
import './LeaderboardPage.css';

const LeaderboardPage = ({ isEmbedded = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('global');
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [gameLeaderboards, setGameLeaderboards] = useState({
        snake: [],
        flag: [],
        scramble: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                // Fetch global leaderboard
                const globalData = await leaderboardAPI.getGlobal();
                setGlobalLeaderboard(globalData.data);

                // Fetch game-specific leaderboards
                const games = ['snake', 'flag', 'scramble'];
                const gameData = {};

                for (const game of games) {
                    const response = await leaderboardAPI.getGameLeaderboard(game);
                    gameData[game] = response.data;
                }

                setGameLeaderboards(gameData);

            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [user, navigate]);

    const getActiveLeaderboard = () => {
        switch (activeTab) {
            case 'snake':
                return gameLeaderboards.snake;
            case 'flag':
                return gameLeaderboards.flag;
            case 'scramble':
                return gameLeaderboards.scramble;
            default:
                return globalLeaderboard;
        }
    };

    const getGameName = () => {
        switch (activeTab) {
            case 'global': return 'Global';
            case 'snake': return 'Snake Game';
            case 'flag': return 'Guess the Flag';
            case 'scramble': return 'Word Scramble';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRankColor = (rank) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return '#667eea';
    };

    if (loading) {
        return (
            <div className="leaderboard-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading leaderboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <header className="leaderboard-header">
                <div className="header-content">
                    <h1>🏆 Leaderboard</h1>
                    {!isEmbedded && (
                        <button
                            className="back-button"
                            onClick={() => navigate('/hub')}
                        >
                            ← Back to Hub
                        </button>
                    )}
                </div>
            </header>

            <main className="leaderboard-main">
                <div className="leaderboard-container">
                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'global' ? 'active' : ''}`}
                                onClick={() => setActiveTab('global')}
                            >
                                🌍 Global Rankings
                            </button>
                            <button
                                className={`tab ${activeTab === 'snake' ? 'active' : ''}`}
                                onClick={() => setActiveTab('snake')}
                            >
                                🐍 Snake Game
                            </button>
                            <button
                                className={`tab ${activeTab === 'flag' ? 'active' : ''}`}
                                onClick={() => setActiveTab('flag')}
                            >
                                🚩 Guess the Flag
                            </button>
                            <button
                                className={`tab ${activeTab === 'scramble' ? 'active' : ''}`}
                                onClick={() => setActiveTab('scramble')}
                            >
                                🔤 Word Scramble
                            </button>
                        </div>
                    </div>

                    <div className="leaderboard-section">
                        <h2>{getGameName()} Leaderboard</h2>

                        <div className="leaderboard-table-container">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Player</th>
                                        {activeTab === 'global' ? (
                                            <>
                                                <th>Total Score</th>
                                                <th>Games Played</th>
                                                <th>Avg Score</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Score</th>
                                                <th>Date</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getActiveLeaderboard().map((entry, index) => (
                                        <tr
                                            key={entry._id || index}
                                            className={entry.username === user?.username ? 'current-user' : ''}
                                        >
                                            <td>
                                                <div
                                                    className="rank-badge"
                                                    style={{ backgroundColor: getRankColor(index + 1) }}
                                                >
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="player-cell">
                                                <span className="player-name">
                                                    {entry.username}
                                                    {entry.username === user?.username && ' (You)'}
                                                </span>
                                            </td>
                                            {activeTab === 'global' ? (
                                                <>
                                                    <td className="score-cell">{entry.totalScore}</td>
                                                    <td>{entry.gamesPlayed}</td>
                                                    <td>{entry.averageScore || 'N/A'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="score-cell">{entry.score}</td>
                                                    <td>{formatDate(entry.playedAt)}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LeaderboardPage;