import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import './Modal.css';

const ChangeNameModal = ({ isOpen, onClose, currentUsername, onSuccess }) => {
    const [newUsername, setNewUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!newUsername || newUsername.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (newUsername === currentUsername) {
            setError('New username must be different from current username');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.changeUsername(newUsername);

            // Update local storage with new token
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess(response.data.user);
                onClose();
                setNewUsername('');
                setSuccess(false);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change username');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNewUsername('');
        setError('');
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Change Username</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentUsername">Current Username</label>
                            <input
                                type="text"
                                id="currentUsername"
                                value={currentUsername}
                                disabled
                                className="disabled-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newUsername">New Username</label>
                            <input
                                type="text"
                                id="newUsername"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                                disabled={loading || success}
                                autoFocus
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">✓ Username changed successfully!</div>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading || success}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangeNameModal;
