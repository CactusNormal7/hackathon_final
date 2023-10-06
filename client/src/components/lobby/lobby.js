import { useEffect, useState } from 'react';
import io from 'socket.io-client'
import { useLocation } from 'react-router-dom'
import Userbanner from '../userbanner/userbanner'
import Chatmsg from '../chatMessage/chatmsg'

//feat quentin le ↓
//         __                            
//  ____ |__| ____   ____   _____  ____ 
// /    \|  |/ ___\ / ___\_/ __ \_  __ \
// |   |  \  / /_/  > /_/  >  ___/|  | \/
// |___|  /__\___  /\___  / \___  >__|   
//     \/  /_____//_____/       \/      


const socketio = io.connect('http://localhost:3001');
// const socketio  = io.connect('https://testsocket-4vkm.onrender.com');



const Lobby = () => {
    const [allMsgTable, setAllMsgTable] = useState({})
    const [messageInputValue, setMessageInputValue] = useState("")
    const [chatInputValue, setChatInputValue] = useState("")
    const [chatMessages, setChatMessages] = useState([])
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [songsToGuess, setSongsToGuess] = useState([])
    const [actualSong, setActualSong] = useState([])
    const [allScore, setAllScore] = useState([])
    const [i, setI] = useState(0)
    // const [answered, setAnswered] = useState(false)

    const [allUsers, setAllUsers] = useState([])

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const room = searchParams.get('room')
    const username = searchParams.get('username')
    let score = 0
    let alsco = []


    const onStart = () => {
        socketio.emit("on_start")
    }


    const gameLoop = (data) => {
        setSongsToGuess(data)
        console.log(data);
        let i = 0
        let answereed = false
        const nextIteration = () => {
            answereed = false
            if (i < 5) {
                document.querySelector(`.${username}`).style.backgroundColor = "gray"
                let url = ((data[i].track).split('?')[1]).split("&");
                let videoId = null
                url.forEach(parametre => {
                    const [cle, valeur] = parametre.split('=');
                    if (cle === "v") {
                        videoId = valeur;
                        return;
                    }
                });
                setActualSong(`https://www.youtube.com/embed/${videoId}?start=25&end=40&autoplay=1`)
                i++
                setI(i)
                setTimeout(nextIteration, 15000)
            }
        }
        socketio.on('answer_message_received', (values) => {
            if (!answereed) {
                if (values.message === data[i - 1].title) {
                    console.log("true");
                    document.querySelector(`.${values.username}`).style.backgroundColor = "green"
                    answereed = true
                    const index = alsco.findIndex((object) => object.username === values.username)
                    alsco[index].score += 1
                    setAllScore(alsco)
                } else {
                    console.log(data[i - 1].title);
                    console.log("false");
                }
            } else {

                console.log("already answered");
            }
        })
        nextIteration();

    }

    useEffect(() => {
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

        socketio.on('game_started', (data) => {
            setIsGameStarted(true)
            gameLoop(data);
        })

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
    }, [])

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

    return (
        <div>
            <div id='wrapperall'>
                <div id='leftside'></div>
                <div id='middleside'>
                    <div id='midtopside'>
                        <div>
                            <h1>Quel est le titre de cette oeuvre ?</h1>
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
            </div>
        </div>
    );
}

export default Lobby;
