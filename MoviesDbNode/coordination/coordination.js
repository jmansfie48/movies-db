var MoviesDb = MoviesDb || {};
MoviesDb.Domain = require('../domain/domain.js');
MoviesDb.DataAccess = require('../data-access/data.access.js');
MoviesDb.Display = require('../ui/display.js');

MoviesDb.Coordination = {

    // Delete a movie
    deleteMovie: function (req) {

        // Initialize response
        var res = {
            status: 200,
            message: 'Movie successfully deleted.'
        };

        // Extract guid of movie to delete
        var deleteGuid;
        var params = req.params;
        if (params) {
            deleteGuid = req.params.guid;
        }

        // Get authenticated user / create user record if needed
        var user = MoviesDb.DataAccess.createUser(req);
        var userGuid = MoviesDb.Coordination.userGuidForAuthId(req);

        var moviesForUser = MoviesDb.DataAccess.getMoviesForUser(userGuid);
        var movieToDelete = MoviesDb.DataAccess.getMovie(moviesForUser, deleteGuid);

        if (!movieToDelete) {
            res.status = 404;
            res.message = 'Could not find movie ' + deleteGuid + ' for user with ID ' + userGuid;
        } else {
            var allMovies = MoviesDb.DataAccess.getAllMovies();
            var movieIndex = allMovies.findIndex(m => m.guid === deleteGuid);
            if (movieIndex > -1) {
                allMovies.splice(movieIndex, 1);
            }
            try {
                var updatedMovies = MoviesDb.DataAccess.updateMovies(allMovies);
            } catch (err) {
                res.status = 400;
                res.message = err;
            }
        }

        return res;
    },

    // Update a movie
    updateMovie: function (req) {

        // Initialize response
        var res = {
            status: 200,
            message: 'Movie successfully updated.'
        };

        // Extract movie information
        var update = req.body;
        var guid = update.guid;

        // Get authenticated user / create user record if needed
        var user = MoviesDb.DataAccess.createUser(req);
        var userGuid = MoviesDb.Coordination.userGuidForAuthId(req);

        // Find movie being updated
        var movieToUpdate;
        var moviesForUser = MoviesDb.DataAccess.getMoviesForUser(userGuid);
        movieToUpdate = MoviesDb.DataAccess.getMovie(moviesForUser, guid);
        if (!movieToUpdate) {
            res.status = 404;
            res.message = 'Could not find movie with ID ' + guid + ' to delete.';
        }

        // If we found a movie to update, update it
        if (movieToUpdate) {
            var movies = MoviesDb.DataAccess.getAllMovies();
            var movieIndex = movies.findIndex(m => m.guid === guid);
            try {
                var storageReadyMovie = MoviesDb.Coordination.convertMovieUpdateToStoredMovie(update, update.guid, userGuid);
                movies[movieIndex] = storageReadyMovie;
                var updatedMovies = MoviesDb.DataAccess.updateMovies(movies);
            } catch (err) {
                res.status = 400;
                res.message = err;
            }
        } else {
            res.status = 404;
            res.message = 'Could not find movie for user with ID ' + userGuid;
        }
        return res;
    },

    // Add a movie
    addMovie: function (req) {

        // Initialize response
        var res = {
            status: 200,
            message: 'Movie successfully added.'
        };

        // Extract movie information
        var add = req.body;
        var guid = MoviesDb.DataAccess.generateGuid();

        // Get authenticated user / create user record if needed
        var user = MoviesDb.DataAccess.createUser(req);
        var userGuid = MoviesDb.Coordination.userGuidForAuthId(req);

        // Unlikely, but check if any movies have the generated GUID
        var movieWithGuid;
        var allMovies = MoviesDb.DataAccess.getAllMovies();
        movieWithGuid = MoviesDb.DataAccess.getMovie(allMovies, guid);
        if (!movieWithGuid) {
            // TODO: Loop until we have an unused GUID
            guid = MoviesDb.DataAccess.generateGuid();
        }

        // Add the movie to storage
        try {
            var storageReadyMovie = MoviesDb.Coordination.convertMovieUpdateToStoredMovie(add, guid, userGuid);
            allMovies.push(storageReadyMovie);
            var updatedMovies = MoviesDb.DataAccess.updateMovies(allMovies);
        } catch (err) {
            res.status = 400;
            res.message = err;
        }  

        return res;
    },

    // Get list of movies
    getMovies: function (req) {

        // Get authenticated user data / create user record if needed
        var user = MoviesDb.DataAccess.createUser(req);
        var userGuid = MoviesDb.Coordination.userGuidForAuthId(req);
        var user = req.oidc.user;

        // Get movie formats
        var movieFormats = MoviesDb.DataAccess.getAllMovieFormats();

        // Get movies
        var movies = MoviesDb.DataAccess.getAllMovies();

        // Build model of movies
        var myMovies = new MoviesDb.Display.myMoviesModel(userGuid, movieFormats, movies, user);

        return myMovies;
    },

    // Get the user GUID for a given Auth ID
    userGuidForAuthId: function (req) {
        var users = MoviesDb.DataAccess.getAllUsers();;
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
    },

    // Convert a display movie model to a storage-ready movie
    convertMovieUpdateToStoredMovie: function (movieToUpdate, guid, userGuid) {
        try {
            if (movieToUpdate) {
                var allMovieFormats = MoviesDb.DataAccess.getAllMovieFormats();
                var updatedMovie = new MoviesDb.Domain.movieModel(movieToUpdate.title, movieToUpdate.format, movieToUpdate.length, movieToUpdate.releaseYear, movieToUpdate.rating, allMovieFormats);
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
};

module.exports = MoviesDb.Coordination;
