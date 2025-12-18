import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import AuthPage from './Components/Auth/AuthPage';
import HubPage from './Components/Hub/HubPage';
import LeaderboardPage from './Components/Leaderboard/LeaderboardPage';
import './App.css';

import SnakeGame from './Components/Games/SnakeGame';
import ScrambleGame from './Components/Games/ScrambleGame';
import FlagGame from './Components/Games/FlagGame/Game';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Game Placeholder Pages
// SnakeGamePage removed in favor of SnakeGame component

// SnakeGamePage removed in favor of SnakeGame component


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Auth Page */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route path="/hub" element={
              <ProtectedRoute>
                <HubPage />
              </ProtectedRoute>
            } />

            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } />

            {/* Game Pages */}
            <Route path="/games/snake" element={
              <ProtectedRoute>
                <SnakeGame />
              </ProtectedRoute>
            } />

            <Route path="/games/flag" element={
              <ProtectedRoute>
                <FlagGame />
              </ProtectedRoute>
            } />

            <Route path="/games/scramble" element={
              <ProtectedRoute>
                <ScrambleGame />
              </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/auth" replace />} />

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;