var MoviesDb = MoviesDb || {};
const UNKNOWN = 'Unknown';
MoviesDb.Domain = require('../domain/domain.js');
MoviesDb.DataAccess = require('../data-access/data.access.js');

MoviesDb.Display = {

    // UI: Display model for showing movies
    myMoviesModel: function (userGuid, movieFormats, movies, user) {
        var model = {};
        var myMovies = [];
        if (movies && movies.length > 0) {
            var moviesForUser = MoviesDb.DataAccess.getMoviesForUser(userGuid);
            if (moviesForUser.length > 0) {
                for (var i = 0; i < moviesForUser.length; i++) {
                    var userMovie = moviesForUser[i];
                    try {
                        var movieModel = new MoviesDb.Display.displayMovieModel(userMovie, movieFormats, movies);
                    } catch (err) {
                        console.log(err);
                    }
                    myMovies.push(movieModel);
                }
            }
        }
        var allMovieFormats = MoviesDb.DataAccess.getAllMovieFormats();
        var movieFormatDropdownValues = allMovieFormats.map(mf => mf.description);

        model.formats = movieFormatDropdownValues;
        model.movies = myMovies;
        model.email = user.email;

        return model;
    },

    // UI: Display model for an individual movie
    displayMovieModel: function(userMovie, movieFormats) {
        var movieModel = {};
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
};

module.exports = MoviesDb.Display;
