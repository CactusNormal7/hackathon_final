import React from 'react';

const Settings = ({ closeSettings, gameMode, setGameMode, songDuration, setSongDuration, maxPoints, setMaxPoints, socketio , setTimeLeft }) => {
   
    const saveSettings = (updatedGameMode, updatedSongDuration, updatedMaxPoints) => {
        console.log("Sending settings to server:", { updatedSongDuration, updatedMaxPoints, updatedGameMode });
        socketio.emit('update_settings', { songDuration: updatedSongDuration, maxPoints: updatedMaxPoints, gameMode: updatedGameMode });
        setTimeLeft(songDuration);
    };
    

    return (
        <div className="settings-container">
            <h2>Paramètres</h2>
            <div>
                <label>Mode de jeu:</label>
                <select value={gameMode} onChange={(e) => { setGameMode(e.target.value); saveSettings(e.target.value, songDuration, maxPoints); }}>
                    <option value="mp3">MP3</option>
                    <option value="qcm">QCM</option>
                    <option value="truefalse">Vrai/Faux</option>
                </select>
            </div>
            <div>
                <label>Durée des chansons:</label>
                <input type="number" value={songDuration} onChange={(e) => {const newDuration = e.target.value; setSongDuration(newDuration); setTimeLeft(newDuration); saveSettings(gameMode, e.target.value, maxPoints); }} />
            </div>
            <div>
                <label>Points max:</label>
                <input type="number" value={maxPoints} onChange={(e) => { setMaxPoints(Number(e.target.value)); saveSettings(gameMode, songDuration, Number(e.target.value)); }} />
            </div>
            <button onClick={closeSettings}>Fermer</button>
        </div>
    );
}

export default Settings;
