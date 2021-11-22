'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET movies */
router.get('/', function (req, res) {
    let rawdata = fs.readFileSync('./storage/movies.json');
    let myMovies = JSON.parse(rawdata);

    res.render('movies', { title: 'My Movies', movies: myMovies });
});

/* PUT movie */
router.put('/update/:guid', function (req, res) {

});

/* DELETE movie */
router.delete('/delete/:guid', function (req, res) {

});

module.exports = router;
