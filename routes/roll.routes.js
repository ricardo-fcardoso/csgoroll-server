module.exports = app => {
    const roll = require('../controllers/roll.controller.js');

    var router = require('express').Router();

    router.get('/items/update', roll.forceUpdate);

    router.get('/items', roll.getUnderpricedItems);

    app.use('/api/roll', router);
}