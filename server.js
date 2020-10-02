const express = require('express');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/katex', (req, res) => {
    res.send('Katex goes here');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
