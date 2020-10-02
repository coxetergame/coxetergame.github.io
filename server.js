const express = require('express');
const katex = require('katex');

const app = express();
const port = 3000;

const html = katex.render("c = \\pm\\sqrt{a^2 + b^2}");

app.use(express.static('public'));

app.get('/katex', (req, res) => {
    res.send(html)
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
