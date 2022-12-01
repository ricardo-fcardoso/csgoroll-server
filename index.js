const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8000

app.use(cors());

app.use(bodyParser.json());

// simple route
app.get('/', function (req, res) {
    res.json({ message: 'Welcome to the CSGORoll Server' });
});

require('./routes/roll.routes')(app);

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`);
})