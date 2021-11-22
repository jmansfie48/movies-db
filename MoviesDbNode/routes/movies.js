'use strict';
const { auth, requiresAuth } = require('express-openid-connect');
var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET movies for user */
router.get('/', requiresAuth(), function (req, res) {

    // Get authenticated user
    var userGuid = userGuidForAuthId(req);

    // Get movie formats
    var movieFormats = getAllMovieFormats();

    // Get movies
    var movies = getAllMovies();

    // Build model of movies
    var myMovies = new myMoviesModel(userGuid, movieFormats, movies);

    res.render('movies', { title: 'My Movies', movies: myMovies.movies, movieFormats: myMovies.formats });
});

/* PUT movie */
router.put('/update', requiresAuth(), function (req, res) {

    // Extract movie information
    var update = req.body;
    var guid = update.guid;

    // Get authenticated user
    var userGuid = userGuidForAuthId(req);

    // Find movie being updated
    var movieToUpdate;
    var moviesForUser = getMoviesForUser(userGuid);
    movieToUpdate = getMovie(moviesForUser, guid);
    if (!movieToUpdate) {
        res.status(404).send('Could not find any movie for user with ID ' + userGuid);
    }

    // If we found a movie to update, update it
    if (movieToUpdate) {
        var movies = getAllMovies();
        var movieIndex = movies.findIndex(m => m.guid === guid);
        try {
            var storageReadyMovie = convertMovieUpdateToStoredMovie(update, update.guid, userGuid);
            movies[movieIndex] = storageReadyMovie;
            var updatedMovies = updateMovies(movies);
            res.status(200).send('Movie successfully updated.');
        } catch (err) {
            res.status(400).send(err);
        }            
    } else {
        res.status(404).send('Could not find movie for user with ID ' + userGuid);
    }
});

/* DELETE movie */
router.delete('/delete', requiresAuth(), function (req, res) {

});

// UI: Display model for showing movies
function myMoviesModel(userGuid, movieFormats, movies) {
    var model = {};
    var myMovies = [];
    if (movies && movies.length > 0) {
        var moviesForUser = getMoviesForUser(userGuid);
        if (moviesForUser.length > 0) {
            for (var i = 0; i < moviesForUser.length; i++) {
                var userMovie = moviesForUser[i];
                try {
                    var movieModel = new displayMovieModel(userMovie, movieFormats, movies);
                } catch (err) {
                    console.log(err);
                }
                myMovies.push(movieModel);
            }
        }
    }
    var allMovieFormats = getAllMovieFormats();
    var movieFormatDropdownValues = allMovieFormats.map(mf => mf.description);

    myMovies.formats = movieFormatDropdownValues;
    myMovies.movies = myMovies;

    return myMovies;
}

// UI: Display model for an individual movie
function displayMovieModel(userMovie, movieFormats) {
    var movieModel = {};
    const UNKNOWN = 'Unknown';
    var title = UNKNOWN;
    var format = UNKNOWN;
    var releaseYear = UNKNOWN;
    var length = UNKNOWN;
    var rating = userMovie.rating;
    var movieFormat;
    if (userMovie) {
        title = userMovie.title;
        releaseYear = userMovie.releaseYear;
        length = userMovie.length;
    } else {
        console.log('Could not find movie with guid ' + userMovie.movieGuid);
    }
    if (movieFormats && movieFormats.length > 0) {
        movieFormat = movieFormats.find(m => m.guid === userMovie.formatGuid);
        if (movieFormat) {
            format = movieFormat.description;
        }
    }
    movieModel = {
        guid: userMovie.guid,
        title: title,
        format: format,
        length: length,
        releaseYear: releaseYear,
        rating: rating
    };    
    return movieModel;
}

// COORDINATION: Get authenticated user's system ID
function userGuidForAuthId(req) {
    var usersRaw = fs.readFileSync('./storage/users.json');
    var users = JSON.parse(usersRaw);
    if (req.oidc && req.oidc.user) {
        var userId = req.oidc.user.sub.split('|')[1];
        var userGuid = '';
        if (userId && users && users.length > 0) {
            var user = users.find(u => u.auth_id === userId);
            if (user) {
                userGuid = user.guid;
            } else {
                console.log('No userGuid found for auth ID ' + userId);
            }
        }
    }
    return userGuid;
}

// DATA: Get all movies from storage
function getAllMovies() {
    var moviesRaw = fs.readFileSync('./storage/movies.json');
    var movies = JSON.parse(moviesRaw);
    return movies;
}

 // DATA: Get all movie formats from storage
function getAllMovieFormats() {
    var movieFormatsRaw = fs.readFileSync('./storage/movie-formats.json');
    var movieFormats = JSON.parse(movieFormatsRaw);
    return movieFormats;
}

// DATA: Update movies with new value
function updateMovies(updatedMovies) {
    var jsonString = JSON.stringify(updatedMovies);
    fs.writeFileSync('./storage/movies.json', jsonString);
    var moviesAfterUpdate = getAllMovies();
    return moviesAfterUpdate;
}

// DATA: Get authenticated user's movies
function getMoviesForUser(userGuid) {
    var myMovies = [];
    var movies = getAllMovies();
    if (movies && movies.length > 0) {
        var userMoviesForUser = movies.filter(um => um.userGuid === userGuid);
        myMovies = userMoviesForUser;
    }
    return myMovies;
}

// DATA: Get a movie from a collection by GUID
function getMovie(movies, guid) {
    var movie;
    if (movies && movies.length > 0) {
        var movieWithGuid = movies.filter(um => um.guid === guid);
        movie = movieWithGuid;
    }
    return movie;
}

// COORDINATION/DOMAIN: Convert movie updates (front-end) to storage-ready movie data
function convertMovieUpdateToStoredMovie(movieToUpdate, guid, userGuid) {
    try {
        if (movieToUpdate) {
            var updatedMovie = movieModel(movieToUpdate.title, movieToUpdate.format, movieToUpdate.length, movieToUpdate.releaseYear, movieToUpdate.rating);
            updatedMovie.guid = guid;
            updatedMovie.userGuid = userGuid;
            return updatedMovie;
        } else {
            console.log('There is no movie update information.');
        }
    }
    catch (err) {
        throw err;
    }
}

//// DOMAIN: Storage-ready movie model
function movieModel(title, format, length, releaseYear, rating) {
    var movie = {};

    // Title logic
    // - a title must be specified
    // - title must be between 1 and 50 characters
    if (!title) {
        throw 'All movies must have a title.'
    }
    if (title.length === 0 || title.length > 50) {
        throw 'Movie titles must be between 1 and 50 characters.'
    }

    // Format logic:
    // - a format must be specified
    // - must be one of the valid formats from storage
    if (!format) {
        throw 'All movies must have a format.'
    }
    var allMovieFormats = getAllMovieFormats();
    var movieFormat;
    if (allMovieFormats && allMovieFormats.length > 0) {
        var movieFormat = allMovieFormats.find(mf => mf.description === format);
        if (!movieFormat) {
            throw 'Movie format ' + format + ' is not a valid format.';
        }
    }

    // Length logic:
    // - length must be between 0 and 500 minutes
    if (!length || Number.isNaN(length) || !Number.isInteger(length) || length < 0 || length > 500) {
        throw 'All movies must have a length between 0 and 500 minutes.'
    }

    // Release Year logic:
    // - length must be between 0 and 500 minutes
    if (!releaseYear || Number.isNaN(releaseYear) || !Number.isInteger(releaseYear) || releaseYear < 1800 || releaseYear > 2100) {
        throw 'All movies must have a release year between 1800 and 2100.'
    }

    // Rating logic:
    // - length must be between 0 and 500 minutes
    if (Number.isNaN(rating) || rating && (rating < 1 || rating > 5)) {
        throw 'All movies must have a rating between 1 and 5.'
    }

    movie.title = title;
    movie.format = movieFormat.guid;
    movie.length = length;
    movie.releaseYear = releaseYear;
    movie.rating = rating;

    return movie;
}

module.exports = router;
