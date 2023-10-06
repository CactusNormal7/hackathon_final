const express = require("express");
const Song = require('../models/song');
// const Lyrics = require('../models/lyrics'); // Import Lyrics model if needed

const router = express.Router()

module.exports = router;

router.get('/getAll', async (req, res) => {
    try {
        const songs = await Song.find(); // Récupère toutes les chansons
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/getOneSong', (req, res) => {
    res.send(req.body);
});

// router.get('/getOneLyrics', (req, res) => {
//     res.send(req.body);
// });

// Define a route for adding a song
router.post('/addSong', async (req, res) => {
    try {
        const {
            title,
            author,
            type,
            release,
            track
        } = req.body;

        const newSong = new Song({
            title,
            author,
            type,
            release,
            track
        });

        const savedSong = await newSong.save();
        res.status(201).json(savedSong);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Define a route for adding lyrics (if needed)
// router.post('/addLyrics', async (req, res) => {
//     try {
//         const {
//             title,
//             author,
//             text,
//             track
//         } = req.body;

//         const newLyrics = new Lyrics({
//             title,
//             author,
//             text,
//             track
//         });

//         const savedLyrics = await newLyrics.save();
//         res.status(201).json(savedLyrics);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

module.exports = router;
