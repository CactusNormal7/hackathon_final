import { useEffect, useState } from 'react';
import io from 'socket.io-client'
import { useLocation , useNavigate} from 'react-router-dom'
import Userbanner from '../userbanner/userbanner'
import Chatmsg from '../chatMessage/chatmsg'
import Settings from '../../Settings/Settings';



const socketio = io.connect('http://localhost:3001');
// const socketio  = io.connect('https://testsocket-4vkm.onrender.com');
// const socketio  = io.connect('https://hacathon-final.onrender.com');


const Lobby = () => {
    const MAX_POINTS = 1; 
    const [allMsgTable, setAllMsgTable] = useState({})
    const [messageInputValue, setMessageInputValue] = useState("")
    const [chatInputValue, setChatInputValue] = useState("")
    const [chatMessages, setChatMessages] = useState([])
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [songsToGuess, setSongsToGuess] = useState([])
    const [actualSong, setActualSong] = useState([])
    const [allScore, setAllScore] = useState([])
    const [i, setI] = useState(0)
    const [gameOver, setGameOver] = useState(false);
    const [sortedUsers, setSortedUsers] = useState([]);
    const [gameMode, setGameMode] = useState("mp3"); // par défaut
    const [showSettings, setShowSettings] = useState(false);
    const [maxPoints, setMaxPoints] = useState(2);
    const [timeLeft, setTimeLeft] = useState(15);
    const [songDuration, setSongDuration] = useState(15); // durée par défaut
    const [qcmQuestion, setQcmQuestion] = useState("");
    const [qcmChoices, setQcmChoices] = useState([]);
    const [qcmAnswer, setQcmAnswer] = useState("");
    const [currentQcmIndex, setCurrentQcmIndex] = useState(0);

    


    // const [answered, setAnswered] = useState(false)

    const [allUsers, setAllUsers] = useState([])

    const location = useLocation()
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search)
    const room = searchParams.get('room')
    const username = searchParams.get('username')
    let score = 0
    let alsco = []

    const resetUserColors = () => {
        allUsers.forEach(user => {
            const userElement = document.querySelector(`.${user.username}`);
            console.log("User element for", user.username, userElement);
            if (userElement) {
                userElement.style.backgroundColor = "gray";
            }
        });
    }

    const onStart = () => {
        socketio.emit("on_start") 
    }

    function randomNumber() {
        return Math.floor(Math.random() * 61); 
    }

    const gameLoop = (data) => {
        setSongsToGuess(data)
        console.log(data);
        let i = 0
        let timerInterval;
        // let answereed = false
        let playersAnswered = [];

        const nextIteration = () => {
            
            const highestScore = Math.max(...alsco.map(user => user.score));
            const startVideo= randomNumber();
            
            // answereed = false

            if (highestScore >= maxPoints) {
                console.log("Game Over!");
                setGameOver(true);
                const sorted = [...alsco].sort((a, b) => b.score - a.score);
                console.log("Sorted Users:", sorted);
                setSortedUsers(sorted);
            }

            if (highestScore < maxPoints) {
                
                if (i >= data.length) {
                    i = 0; // Recommence la liste de chansons
                }
                console.log(data.length);
                clearInterval(timerInterval);
            
                // Redémarre le chronomètre pour la prochaine chanson
                console.log("Setting initial time:", songDuration);
                setTimeLeft(songDuration); // Réinitialisez timeLeft à la durée totale de la chanson
                timerInterval = setInterval(() => {
                    setTimeLeft(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(timerInterval);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
            
                document.querySelector(`.${username}`).style.backgroundColor = "gray";
                let url = ((data[i].track).split('?')[1]).split("&");
                let videoId = null;
                url.forEach(parametre => {
                    const [cle, valeur] = parametre.split('=');
                    if (cle === "v") {
                        videoId = valeur;
                        return;
                    }
                });
                setActualSong(`https://www.youtube.com/embed/${videoId}?start=${startVideo}&end=${startVideo + songDuration - (songDuration - timeLeft)}&autoplay=1`);
                i++;
                setI(i);
                setTimeout(nextIteration, songDuration * 1000);
                resetUserColors();
                playersAnswered = [];
            } else {
                clearInterval(timerInterval);
            }
            
            
        }
        socketio.on('answer_message_received', (values) => {
            if (!playersAnswered.includes(values.username)) {
                if (values.message === data[i - 1].title) {
                    console.log("true");
                    document.querySelector(`.${values.username}`).style.backgroundColor = "green";
                    playersAnswered.push(values.username);
                    
                    const index = alsco.findIndex((object) => object.username === values.username);
                    
                    // Vérifie si l'utilisateur n'a pas déjà atteint le maximum de points
                    if (alsco[index].score < maxPoints) {
                        alsco[index].score += 1;
                    }
                    
                    setAllScore(alsco);
        
                    // Gère la fin du jeu si le score maximum est atteint
                    if (alsco[index].score >= maxPoints) {
                        // Gère la fin du jeu ici (par exemple, affiche un message)
                        clearInterval(timerInterval);
                    }
        
                } else {
                    console.log(data[i - 1].title);
                    console.log("false");
                }
            } else {
                console.log(values.username + " has already answered");
            }
        });        
        
        
        nextIteration();

    }

    useEffect(() => {
        console.log("maxPoints has changed:", maxPoints);
        socketio.emit("join_room", { username: username, room: room })

        socketio.on('console_message', (message) => {
            console.log(message);
        })

        socketio.on('users_infos', (data) => {
            let temp = data.users
            const newTab = temp.map((item) => ({
                ...item,
                score: 0,
            }));
            setAllScore(newTab)
            alsco = newTab
            setAllUsers(data.users)
        })

        socketio.on('settings_updated', (data) => {
            setGameMode(data.gameMode);
            setSongDuration(data.songDuration);
            setMaxPoints(data.maxPoints);
        });
        

        socketio.on('game_started', (data) => {
            setIsGameStarted(true);
            gameLoop(data);
        });

        socketio.on('send_score', (d) => {
            setAllScore(allScore => ({ ...allScore, ...{ [d.username]: d.score } }))
        })

        socketio.on('chat_message_received', async (data) => {
            setChatMessages(old => ([old, <Chatmsg username={data.user} message={data.message} />]));
        })

        socketio.on('answer_message_received', (data) => {
            let updval = { [data.username]: data.message }
            setAllMsgTable(allMsgTable => ({ ...allMsgTable, ...updval }))
        })
        setTimeLeft(songDuration);
        return () => {
            socketio.off('console_message');
            socketio.off('users_infos');
            socketio.off('settings_updated');
            socketio.off('game_started');
            socketio.off('send_score');
            socketio.off('chat_message_received');
            socketio.off('answer_message_received');
        }
    }, [songDuration])

    const sendMessage = () => {
        socketio.emit('chat_message', { username: username, message: chatInputValue })
        setChatInputValue('')
    }

    const sendAnswer = () => {
        socketio.emit('answer_message', { message: messageInputValue, score: score })
        setMessageInputValue('')
    }

    const handleInputChange = (event) => {
        setMessageInputValue(event.target.value);
    };

    const handleChatChange = (event) => {

        setChatInputValue(event.target.value);
    }

    const goToHomePage = () => {
        navigate('/'); 
    };

    
    const openSettings = () => {
        setShowSettings(true);
    };

    const closeSettings = () => {
        setShowSettings(false);
    };
        
    return (
        <div>
            <div id='wrapperall'>
                <div id='leftside'>
                <button onClick={openSettings}>Paramètres</button>
                    {showSettings && (
                        <Settings 
                            closeSettings={closeSettings}
                            gameMode={gameMode}
                            setGameMode={setGameMode}
                            songDuration={songDuration}
                            setSongDuration={setSongDuration}
                            maxPoints={maxPoints}
                            setMaxPoints={setMaxPoints}
                            socketio={socketio}
                            setTimeLeft={setTimeLeft}
                        />
                    )}
                    
                </div>
                <div id='middleside'>
                    <div id='midtopside'>
                        <div>
                            <h1>Quel est le titre de cette oeuvre ?</h1>
                            <div>Temps restant : {timeLeft} secondes</div>
                        </div>
                    </div>
                    <div id='midmidside'>
                        {!isGameStarted &&
                            <button id='startButton' onClick={onStart}>START</button>
                        }
                        {isGameStarted &&
                            <h1>{i}</h1>
                        }
                        <h1 id='testtrack'>

                        </h1>
                        <iframe
                            width={0}
                            height={0}
                            src={actualSong}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        ></iframe>
                    </div>
                    <div id='midbotside'>
                        <input id='messageinput' placeholder='message' onKeyDown={(e) => { if (e.key === 'Enter') { sendAnswer() } }} onChange={handleInputChange} value={messageInputValue}></input>
                        <button id='sendButton' onClick={sendAnswer}>send</button>
                    </div>
                </div>

                <div id='rightside'>
                    <div id='userlistpart'>
                        <p id='userlisttittle'>Connected Users</p>
                        {
                            allUsers.map(function (values) {
                                return (
                                    <Userbanner iid={values.username} username={values.username} message={allMsgTable[values.username]} score={allScore[allScore.findIndex((object) => object.username === values.username)].score} />
                                )
                            })
                        }
                    </div>
                    <div id='chatpart'>
                        <div id='chatMessageWrapper'>
                            {chatMessages}
                        </div>
                        <div id='chatinputsection' >
                            <input value={chatInputValue} onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage() } }} onChange={handleChatChange} placeholder='send a message'></input>
                            <button onClick={sendMessage}>send</button>
                        </div>
                    </div>
                </div>
                {gameOver && (
                <div className="ranking">
                    <h2>Classement final</h2>
                    {sortedUsers.map((user, index) => (
                        <div key={user.username} className="ranking-item">
                            <span>{index + 1}. {user.username} - {user.score} points</span>
                        </div>
                    ))}
                    <button onClick={goToHomePage}>Retour à l'accueil</button>
                </div>
            )}
            </div>
            
            
        </div>
    );
}

export default Lobby;
