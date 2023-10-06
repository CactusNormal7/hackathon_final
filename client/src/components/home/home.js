import React, { useState, useEffect, useRef } from 'react';
import Particles from 'particles.js';
import logo from './logo.png';
import notes from './notes.png';
import waiting from './waiting.mp3';
import pause from './pause.png';
import play from './play.png';
import mute from './mute.png';
import volumeup from './volumeup.png';
import {Link} from 'react-router-dom'

const Home = () => {

    const audioRef = useRef(null);
    const [volume, setVolume] = useState(0.5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const handleStartGame = () => {
    };

    const [room, setRoom] = useState("")
    const [username, setUsername] = useState("")


    const roomInputChange = (event) => {
        setRoom(event.target.value);
    };
    const usernameInputChange = (event) => {
        setUsername(event.target.value);
    };

    const handleClick = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio(waiting);
            audioRef.current.volume = volume;
            audioRef.current.addEventListener('ended', () => {
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            });
        }

        if (!isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }

        setIsPlaying(!isPlaying);
    };

    const handleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    useEffect(() => {
        const particlesConfig = {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 500,
                    },
                },
                shape: {
                    type: 'image',
                    stroke: {
                        width: 0,
                        color: '#000000',
                    },
                    polygon: {
                        nb_sides: 5,
                    },
                    image: {
                        src: notes,
                        width: 100,
                        height: 100,
                    },
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false,
                    },
                },
                size: {
                    value: 15,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false,
                    },
                },
                line_linked: {
                    enable: false,
                },
            },
            interactivity: {
                events: {
                    onhover: {
                        enable: false,
                    },
                },
            },
            retina_detect: false,
        };

        window.particlesJS('particles-js', particlesConfig);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', () => { });
            }
        };
    }, []);

    return (
        <div id="particles-js" className="home-background">
            <div className="music-controls">
                <button onClick={handleClick}>
                    {isPlaying ? <img className="pause" src={pause} /> : <img className="play" src={play} />}
                </button>
                <button onClick={handleMute}>
                    {isMuted ? <img className="mute" src={mute} /> : <img className="volumeup" src={volumeup} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                />
            </div>
            <div className="home-container">
                <img className="logo" src={logo} alt="Logo" />
                <h1>Bienvenue dans QuizTune</h1>
                <div className="input-container">
                    <label htmlFor="pseudo">Pseudo:</label>
                    <input
                        type="text"
                        id="pseudo"
                        placeholder="Entrez votre pseudo"
                        value={username}
                        onChange={(e) => {setUsername(e.target.value)}}
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="room">Room:</label>
                    <input
                        type="text"
                        id="room"
                        placeholder="Entrez le nom de la room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                </div>
                <Link to={`./lobby?username=${username}&room=${room}`}>
                    <button className="launch" onClick={handleStartGame}>
                        Commencer la partie
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Home;