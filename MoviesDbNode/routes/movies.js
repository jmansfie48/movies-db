'use strict';
const { auth, requiresAuth } = require('express-openid-connect');
var express = require('express');
var MoviesDb = MoviesDb || {};
MoviesDb.Display = require('../ui/display.js');
MoviesDb.DataAccess = require('../data-access/data.access.js');
MoviesDb.Domain = require('../domain/domain.js');
MoviesDb.Coordination = require('../coordination/coordination.js');
var router = express.Router();
var fs = require('fs');

/* GET movies for user */
router.get('/', requiresAuth(), function (req, res) {

    try {
        var myMovies = MoviesDb.Coordination.getMovies(req);
        res.render('movies', { title: 'My Movies', movies: myMovies.movies, movieFormats: myMovies.formats, userEmail: myMovies.email });
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to add movie.');
    }
});

/* POST add a movie */
router.post('/add', requiresAuth(), function (req, res) {
    try {
        var response = MoviesDb.Coordination.addMovie(req);
        res.status(response.status).send(response.message);
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to add movie.');
    }    
});

/* PUT update a movie */
router.put('/update', requiresAuth(), function (req, res) {
    try {
        var response = MoviesDb.Coordination.updateMovie(req);
        res.status(response.status).send(response.message);
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to update movie.');
    }
});

/* DELETE a movie */
router.delete('/delete/:guid', requiresAuth(), function (req, res) {
    try {
        var response = MoviesDb.Coordination.deleteMovie(req);
        res.status(response.status).send(response.message);
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to delete movie.');
    }
});

module.exports = router;
