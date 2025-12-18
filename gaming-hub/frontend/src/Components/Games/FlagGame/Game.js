import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { gamesAPI } from '../../../services/api';
import FlagCard from './FlagCard';
import Score from './Score';
import './Game.css';

const Game = ({ onExit }) => {
    const { user } = useAuth();
    const [countries, setCountries] = useState([]);
    const [currentCountry, setCurrentCountry] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [timer, setTimer] = useState(30);
    const [gameActive, setGameActive] = useState(true);
    const [usedCountryIds, setUsedCountryIds] = useState([]);
    const [gameFinished, setGameFinished] = useState(false);

    // API RestCountries avec proxy CORS
    const API_URL = 'https://corsproxy.io/?https://restcountries.com/v3.1/all';

    useEffect(() => {
        fetchCountries();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (gameActive && timer > 0 && !answered && !gameFinished) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && !answered && !gameFinished) {
            handleTimeUp();
        }
        return () => clearInterval(interval);
    }, [timer, gameActive, answered, gameFinished]);

    // Submit score when game finishes
    useEffect(() => {
        if (gameFinished && user && score > 0) {
            const submitScore = async () => {
                try {
                    await gamesAPI.submitScore({
                        gameId: 'flag',
                        gameName: 'Guess the Flag',
                        score: score
                    });
                    console.log('Score submitted successfully');
                } catch (error) {
                    console.error('Error submitting score:', error);
                }
            };
            submitScore();
        }
    }, [gameFinished, user, score]);

    const fetchCountries = async () => {
        try {
            setLoading(true);
            console.log('Chargement des pays depuis l\'API...');

            const response = await axios.get(API_URL);
            console.log('Réponse API reçue:', response.data.length, 'pays');

            // Filtrage des pays valides
            const countriesData = response.data.filter(country =>
                country.flags && country.flags.png && country.name && country.name.common
            );

            console.log('Pays valides après filtrage:', countriesData.length);
            console.log('Exemples de pays:', countriesData.slice(0, 5).map(c => c.name.common));

            setCountries(countriesData);
            generateQuestion(countriesData);
            setLoading(false);
        } catch (error) {
            console.error('Erreur API:', error);
            console.log('Utilisation des données de secours...');
            // Données de secours étendues
            const backupData = getBackupCountries();
            console.log('Pays de secours chargés:', backupData.length);
            setCountries(backupData);
            generateQuestion(backupData);
            setLoading(false);
        }
    };

    const getBackupCountries = () => {
        // Liste étendue de pays (50+ pays)
        return [
            // Europe (30 pays)
            { name: { common: "France" }, flags: { png: "https://flagcdn.com/w320/fr.png" } },
            { name: { common: "Allemagne" }, flags: { png: "https://flagcdn.com/w320/de.png" } },
            { name: { common: "Italie" }, flags: { png: "https://flagcdn.com/w320/it.png" } },
            { name: { common: "Espagne" }, flags: { png: "https://flagcdn.com/w320/es.png" } },
            { name: { common: "Portugal" }, flags: { png: "https://flagcdn.com/w320/pt.png" } },
            { name: { common: "Royaume-Uni" }, flags: { png: "https://flagcdn.com/w320/gb.png" } },
            { name: { common: "Irlande" }, flags: { png: "https://flagcdn.com/w320/ie.png" } },
            { name: { common: "Pays-Bas" }, flags: { png: "https://flagcdn.com/w320/nl.png" } },
            { name: { common: "Belgique" }, flags: { png: "https://flagcdn.com/w320/be.png" } },
            { name: { common: "Suisse" }, flags: { png: "https://flagcdn.com/w320/ch.png" } },
            { name: { common: "Suède" }, flags: { png: "https://flagcdn.com/w320/se.png" } },
            { name: { common: "Norvège" }, flags: { png: "https://flagcdn.com/w320/no.png" } },
            { name: { common: "Danemark" }, flags: { png: "https://flagcdn.com/w320/dk.png" } },
            { name: { common: "Finlande" }, flags: { png: "https://flagcdn.com/w320/fi.png" } },
            { name: { common: "Pologne" }, flags: { png: "https://flagcdn.com/w320/pl.png" } },
            { name: { common: "Autriche" }, flags: { png: "https://flagcdn.com/w320/at.png" } },
            { name: { common: "Grèce" }, flags: { png: "https://flagcdn.com/w320/gr.png" } },
            { name: { common: "Ukraine" }, flags: { png: "https://flagcdn.com/w320/ua.png" } },
            { name: { common: "Roumanie" }, flags: { png: "https://flagcdn.com/w320/ro.png" } },
            { name: { common: "Hongrie" }, flags: { png: "https://flagcdn.com/w320/hu.png" } },
            { name: { common: "République Tchèque" }, flags: { png: "https://flagcdn.com/w320/cz.png" } },
            { name: { common: "Slovaquie" }, flags: { png: "https://flagcdn.com/w320/sk.png" } },
            { name: { common: "Bulgarie" }, flags: { png: "https://flagcdn.com/w320/bg.png" } },
            { name: { common: "Croatie" }, flags: { png: "https://flagcdn.com/w320/hr.png" } },
            { name: { common: "Serbie" }, flags: { png: "https://flagcdn.com/w320/rs.png" } },
            { name: { common: "Lituanie" }, flags: { png: "https://flagcdn.com/w320/lt.png" } },
            { name: { common: "Lettonie" }, flags: { png: "https://flagcdn.com/w320/lv.png" } },
            { name: { common: "Estonie" }, flags: { png: "https://flagcdn.com/w320/ee.png" } },
            { name: { common: "Slovénie" }, flags: { png: "https://flagcdn.com/w320/si.png" } },
            { name: { common: "Luxembourg" }, flags: { png: "https://flagcdn.com/w320/lu.png" } },

            // Amériques (15 pays)
            { name: { common: "États-Unis" }, flags: { png: "https://flagcdn.com/w320/us.png" } },
            { name: { common: "Canada" }, flags: { png: "https://flagcdn.com/w320/ca.png" } },
            { name: { common: "Mexique" }, flags: { png: "https://flagcdn.com/w320/mx.png" } },
            { name: { common: "Brésil" }, flags: { png: "https://flagcdn.com/w320/br.png" } },
            { name: { common: "Argentine" }, flags: { png: "https://flagcdn.com/w320/ar.png" } },
            { name: { common: "Chili" }, flags: { png: "https://flagcdn.com/w320/cl.png" } },
            { name: { common: "Colombie" }, flags: { png: "https://flagcdn.com/w320/co.png" } },
            { name: { common: "Pérou" }, flags: { png: "https://flagcdn.com/w320/pe.png" } },
            { name: { common: "Venezuela" }, flags: { png: "https://flagcdn.com/w320/ve.png" } },
            { name: { common: "Équateur" }, flags: { png: "https://flagcdn.com/w320/ec.png" } },
            { name: { common: "Bolivie" }, flags: { png: "https://flagcdn.com/w320/bo.png" } },
            { name: { common: "Uruguay" }, flags: { png: "https://flagcdn.com/w320/uy.png" } },
            { name: { common: "Paraguay" }, flags: { png: "https://flagcdn.com/w320/py.png" } },
            { name: { common: "Cuba" }, flags: { png: "https://flagcdn.com/w320/cu.png" } },
            { name: { common: "République Dominicaine" }, flags: { png: "https://flagcdn.com/w320/do.png" } },

            // Asie (15 pays)
            { name: { common: "Chine" }, flags: { png: "https://flagcdn.com/w320/cn.png" } },
            { name: { common: "Japon" }, flags: { png: "https://flagcdn.com/w320/jp.png" } },
            { name: { common: "Inde" }, flags: { png: "https://flagcdn.com/w320/in.png" } },
            { name: { common: "Corée du Sud" }, flags: { png: "https://flagcdn.com/w320/kr.png" } },
            { name: { common: "Indonésie" }, flags: { png: "https://flagcdn.com/w320/id.png" } },
            { name: { common: "Pakistan" }, flags: { png: "https://flagcdn.com/w320/pk.png" } },
            { name: { common: "Bangladesh" }, flags: { png: "https://flagcdn.com/w320/bd.png" } },
            { name: { common: "Philippines" }, flags: { png: "https://flagcdn.com/w320/ph.png" } },
            { name: { common: "Vietnam" }, flags: { png: "https://flagcdn.com/w320/vn.png" } },
            { name: { common: "Thaïlande" }, flags: { png: "https://flagcdn.com/w320/th.png" } },
            { name: { common: "Turquie" }, flags: { png: "https://flagcdn.com/w320/tr.png" } },
            { name: { common: "Iran" }, flags: { png: "https://flagcdn.com/w320/ir.png" } },
            { name: { common: "Arabie Saoudite" }, flags: { png: "https://flagcdn.com/w320/sa.png" } },
            { name: { common: "Irak" }, flags: { png: "https://flagcdn.com/w320/iq.png" } },
            { name: { common: "Afghanistan" }, flags: { png: "https://flagcdn.com/w320/af.png" } },

            // Afrique (15 pays)
            { name: { common: "Maroc" }, flags: { png: "https://flagcdn.com/w320/ma.png" } },
            { name: { common: "Algérie" }, flags: { png: "https://flagcdn.com/w320/dz.png" } },
            { name: { common: "Tunisie" }, flags: { png: "https://flagcdn.com/w320/tn.png" } },
            { name: { common: "Égypte" }, flags: { png: "https://flagcdn.com/w320/eg.png" } },
            { name: { common: "Afrique du Sud" }, flags: { png: "https://flagcdn.com/w320/za.png" } },
            { name: { common: "Nigeria" }, flags: { png: "https://flagcdn.com/w320/ng.png" } },
            { name: { common: "Éthiopie" }, flags: { png: "https://flagcdn.com/w320/et.png" } },
            { name: { common: "Kenya" }, flags: { png: "https://flagcdn.com/w320/ke.png" } },
            { name: { common: "Ghana" }, flags: { png: "https://flagcdn.com/w320/gh.png" } },
            { name: { common: "Côte d'Ivoire" }, flags: { png: "https://flagcdn.com/w320/ci.png" } },
            { name: { common: "Sénégal" }, flags: { png: "https://flagcdn.com/w320/sn.png" } },
            { name: { common: "Cameroun" }, flags: { png: "https://flagcdn.com/w320/cm.png" } },
            { name: { common: "Angola" }, flags: { png: "https://flagcdn.com/w320/ao.png" } },
            { name: { common: "Mozambique" }, flags: { png: "https://flagcdn.com/w320/mz.png" } },
            { name: { common: "Madagascar" }, flags: { png: "https://flagcdn.com/w320/mg.png" } },

            // Océanie (5 pays)
            { name: { common: "Australie" }, flags: { png: "https://flagcdn.com/w320/au.png" } },
            { name: { common: "Nouvelle-Zélande" }, flags: { png: "https://flagcdn.com/w320/nz.png" } },
            { name: { common: "Papouasie-Nouvelle-Guinée" }, flags: { png: "https://flagcdn.com/w320/pg.png" } },
            { name: { common: "Fidji" }, flags: { png: "https://flagcdn.com/w320/fj.png" } },
            { name: { common: "Îles Salomon" }, flags: { png: "https://flagcdn.com/w320/sb.png" } },
        ];
    };

    const generateQuestion = (countriesData) => {
        if (countriesData.length < 4 || gameFinished) return;

        console.log('Pays déjà utilisés:', usedCountryIds.length, '/', countriesData.length);

        // Filtrer les pays non encore utilisés
        const availableCountries = countriesData.filter(country =>
            !usedCountryIds.includes(country.name.common)
        );

        console.log('Pays disponibles:', availableCountries.length);

        // Vérifier si la partie est terminée (tous les pays utilisés)
        if (availableCountries.length < 4) {
            console.log('Fin de partie ! Tous les pays ont été présentés');
            setGameFinished(true);
            return;
        }

        // Sélectionner un pays aléatoire parmi ceux disponibles
        const randomIndex = Math.floor(Math.random() * availableCountries.length);
        const correctCountry = availableCountries[randomIndex];

        // Ajouter ce pays à la liste des pays utilisés
        setUsedCountryIds(prev => [...prev, correctCountry.name.common]);

        // Générer 3 mauvaises réponses uniques parmi TOUS les pays
        let wrongOptions = [];
        while (wrongOptions.length < 3) {
            const randomWrongIndex = Math.floor(Math.random() * countriesData.length);
            const wrongCountry = countriesData[randomWrongIndex].name.common;

            // Vérifier que le pays n'est pas déjà utilisé comme mauvaise réponse
            // et n'est pas le pays correct
            if (!wrongOptions.includes(wrongCountry) &&
                wrongCountry !== correctCountry.name.common) {
                wrongOptions.push(wrongCountry);
            }

            // Éviter une boucle infinie
            if (wrongOptions.length >= Math.min(3, countriesData.length - 1)) break;
        }

        // Mélanger les options
        const allOptions = [
            correctCountry.name.common,
            ...wrongOptions
        ].sort(() => Math.random() - 0.5);

        setCurrentCountry(correctCountry);
        setOptions(allOptions);
        setSelectedAnswer(null);
        setAnswered(false);
        setTimer(30);
        setFeedback('');
    };

    const handleSelectAnswer = (answer) => {
        if (answered || gameFinished) return;
        setSelectedAnswer(answer);
    };

    const handleConfirmAnswer = () => {
        if (!selectedAnswer || answered || gameFinished) return;

        setAnswered(true);
        const isCorrect = selectedAnswer === currentCountry.name.common;

        if (isCorrect) {
            setScore(prev => prev + 10);
            setFeedback('✅ Correct !');
        } else {
            setFeedback(`❌ Faux ! La réponse était : ${currentCountry.name.common}`);
        }

        setTotalQuestions(prev => prev + 1);

        // Passer à la question suivante après 1.5 secondes
        setTimeout(() => {
            if (countries.length > 0 && !gameFinished) {
                generateQuestion(countries);
            }
        }, 1500);
    };

    const handleTimeUp = () => {
        if (answered || gameFinished) return;

        setAnswered(true);
        setFeedback(`⏰ Temps écoulé ! La réponse était : ${currentCountry.name.common}`);
        setTotalQuestions(prev => prev + 1);

        setTimeout(() => {
            if (countries.length > 0 && !gameFinished) {
                generateQuestion(countries);
            }
        }, 1500);
    };

    const resetGame = () => {
        setScore(0);
        setTotalQuestions(0);
        setSelectedAnswer(null);
        setAnswered(false);
        setTimer(30);
        setUsedCountryIds([]);
        setGameFinished(false);
        if (countries.length > 0) {
            generateQuestion(countries);
        }
    };

    const handleExitAndSave = async () => {
        if (user && score > 0) {
            try {
                await gamesAPI.submitScore({
                    gameId: 'flag',
                    gameName: 'Guess the Flag',
                    score: score
                });
                console.log('Score saved successfully');
            } catch (error) {
                console.error('Error saving score:', error);
            }
        }
        if (onExit) {
            onExit();
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des drapeaux...</p>
            </div>
        );
    }

    return (
        <div className="game-container">
            {!gameFinished ? (
                <>
                    <div className="timer-container">
                        <div className="timer">
                            <span className="timer-icon">⏱️</span>
                            <span className="timer-text">{timer}s</span>
                        </div>
                        <div className="progress-bar-timer">
                            <div
                                className="progress-fill-timer"
                                style={{ width: `${(timer / 30) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <FlagCard country={currentCountry} />

                    <div className="options-container">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${answered && option === currentCountry.name.common ? 'correct' : ''}`}
                                onClick={() => handleSelectAnswer(option)}
                                disabled={answered}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="confirm-container">
                        <button
                            className="confirm-btn"
                            onClick={handleConfirmAnswer}
                            disabled={!selectedAnswer || answered}
                        >
                            {selectedAnswer ? `Confirmez : ${selectedAnswer}` : 'Sélectionnez une réponse'}
                        </button>
                    </div>

                    {feedback && (
                        <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
                            {feedback}
                        </div>
                    )}

                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(totalQuestions / countries.length) * 100}%` }}
                            ></div>
                        </div>
                        <p>Question {totalQuestions + 1} / {countries.length} pays</p>
                    </div>
                </>
            ) : (
                <div className="game-finished">
                    <h2>🎉 Partie Terminée ! 🎉</h2>
                    <p className="final-message">Vous avez deviné tous les pays disponibles !</p>
                    <div className="final-stats">
                        <div className="stat-item">
                            <span className="stat-label">Score Final:</span>
                            <span className="stat-value">{score}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Pays devinés:</span>
                            <span className="stat-value">{score} / {countries.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Précision:</span>
                            <span className="stat-value">{Math.round((score / totalQuestions) * 100)}%</span>
                        </div>
                    </div>
                </div>
            )}

            <Score score={score} />

            <button className="reset-btn" onClick={resetGame}>
                {gameFinished ? '🎮 Nouvelle Partie' : '🔄 Recommencer'}
            </button>
            <div className="controls-hint">
                <button className="save-exit-btn" onClick={handleExitAndSave}>
                    💾 Exit & Save
                </button>
            </div>
        </div>
    );
};

export default Game;
