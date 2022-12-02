const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./model');

const app = express();
const PORT = 8000

app.use(cors());

app.use(bodyParser.json());

db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to the database.');
    })
    .catch(err => {
        console.log('Cannot connect to the database.', err);
        process.exit();
    });

// simple route
app.get('/', function (req, res) {
    res.json({ message: 'Welcome to the CSGORoll Server' });
});

require('./routes/roll.routes')(app);

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`);
})