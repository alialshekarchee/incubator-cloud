const express = require('express');
const app = express();


app.get('/ws', (req, res) => {
    res.sendFile(__dirname + '../index.html');
});