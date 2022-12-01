module.exports = app => {
    const roll = require('../controllers/roll.controller.js');
    
    var router = require('express').Router();

    router.get('/items', roll.getItems);

    app.use('/api/roll', router);
}