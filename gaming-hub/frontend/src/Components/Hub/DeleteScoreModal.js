import React, { useState, useEffect } from 'react';
import { gamesAPI } from '../../services/api';
import './Modal.css';

const DeleteScoreModal = ({ isOpen, onClose, userId, onScoreDeleted }) => {
    const [gameHistory, setGameHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchGameHistory();
        }
    }, [isOpen, userId]);

    const fetchGameHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await gamesAPI.getUserGameHistory(userId);
            setGameHistory(response.data.data || []);
        } catch (err) {
            setError('Failed to load game history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScore = async (scoreId) => {
        setDeleting(true);
        setError('');
        try {
            await gamesAPI.deleteGameScore(scoreId);

            // Remove from local state
            setGameHistory(gameHistory.filter(score => score._id !== scoreId));
            setDeleteConfirm(null);

            // Notify parent component
            if (onScoreDeleted) {
                onScoreDeleted();
            }
        } catch (err) {
            setError('Failed to delete score');
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClose = () => {
        setDeleteConfirm(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Game Score History</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal-body">
                    {loading && <div className="loading-spinner">Loading...</div>}

                    {error && <div className="error-message">{error}</div>}

                    {!loading && gameHistory.length === 0 && (
                        <div className="empty-state">
                            <p>No game scores found</p>
                        </div>
                    )}

                    {!loading && gameHistory.length > 0 && (
                        <div className="score-list">
                            {gameHistory.map((score) => (
                                <div key={score._id} className="score-item">
                                    <div className="score-info">
                                        <div className="score-game-name">{score.gameName}</div>
                                        <div className="score-details">
                                            <span className="score-value">Score: {score.score}</span>
                                            <span className="score-date">{formatDate(score.playedAt)}</span>
                                        </div>
                                    </div>

                                    {deleteConfirm === score._id ? (
                                        <div className="delete-confirm">
                                            <span>Delete this score?</span>
                                            <button
                                                className="btn-danger-sm"
                                                onClick={() => handleDeleteScore(score._id)}
                                                disabled={deleting}
                                            >
                                                {deleting ? 'Deleting...' : 'Confirm'}
                                            </button>
                                            <button
                                                className="btn-secondary-sm"
                                                onClick={() => setDeleteConfirm(null)}
                                                disabled={deleting}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn-delete"
                                            onClick={() => setDeleteConfirm(score._id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteScoreModal;
