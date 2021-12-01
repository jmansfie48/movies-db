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

/* Load main app page */
router.get('/', requiresAuth(), function (req, res) {
    try {
        return MoviesDb.Coordination.getMovies(req).then(function (myMovies) {
            res.render('movies', { title: 'My Movies', movies: myMovies.movies, movieFormats: myMovies.formats, userEmail: myMovies.email });
        }).catch(function (err) {
            res.status(400).send('Unable to load My Movies.');
        });
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to load My Movies.');
    }
});

/* GET movies for user */
router.get('/get', requiresAuth(), function (req, res) {

    try {
        return MoviesDb.Coordination.getMovies(req).then(function (myMovies) {
            res.status(200).send(JSON.stringify(myMovies.movies));
        }).catch(function(err) {
            res.status(400).send('Unable to get movies.');
        });
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to get movies.');
    }
});

/* POST add a movie */
router.post('/add', requiresAuth(), function (req, res) {
    try {
        return MoviesDb.Coordination.addMovie(req).then(function (response) {
            res.status(response.status).send(response.message);
        }).catch(function (err) {
            res.status(400).send('Unable to add movie.');
        });
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to add movie.');
    }    
});

/* PUT update a movie */
router.put('/update', requiresAuth(), function (req, res) {
    try {
        return MoviesDb.Coordination.updateMovie(req).then(function (response) {
            res.status(response.status).send(response.message);
        }).catch(function (err) {
            res.status(400).send('Unable to update movie.');
        });
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to update movie.');
    }
});

/* DELETE a movie */
router.delete('/delete/:guid', requiresAuth(), function (req, res) {
    try {
        return MoviesDb.Coordination.deleteMovie(req).then(function (response) {
            res.status(response.status).send(response.message);
        }).catch(function (err) {
            res.status(400).send('Unable to delete movie.');
        });
    } catch (err) {
        console.log(err);
        res.status(400).send('Unable to delete movie.');
    }
});

module.exports = router;
