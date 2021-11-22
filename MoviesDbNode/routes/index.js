'use strict';
var express = require('express');
var router = express.Router();

/* GET movies for user */
router.get('/', function (req, res) {
    var myMovies = ;
    res.render('movies', { title: 'My Movies', movies: myMovies });
});

module.exports = router;
