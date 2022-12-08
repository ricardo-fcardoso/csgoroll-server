const dbConfig = require('../config/db.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.roll = require('./roll.model.js')(mongoose);
db.item = require('./item.model.js')(mongoose);
db.underpriced = require('./underpricedItems.model.js')(mongoose);

module.exports = db;