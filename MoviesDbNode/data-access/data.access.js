var MoviesDb = MoviesDb || {};
var fs = require('fs');
MoviesDb.Domain = require('../domain/domain.js');

const storagePath = '././storage/'
const usersPath = storagePath + 'users.json';
const moviesPath = storagePath + 'movies.json';
const movieFormatsPath = storagePath + 'movie-formats.json';

MoviesDb.DataAccess = {

    // Generate a GUID
    generateGuid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Create a user (if needed) from a request
    createUser: function (req) {
        var allUsers = MoviesDb.DataAccess.getAllUsers();
        var authUser = req.oidc.user;
        var authId = authUser.sub.split('|')[1];
        var authEmail = authUser.email;
        var user;
        if (authId && allUsers && allUsers.length > 0) {
            var user = allUsers.find(u => u.auth_id === authId);
            if (!user) {
                // Add the user to storage
                try {
                    var newUserGuid = MoviesDb.DataAccess.generateGuid();
                    user = new MoviesDb.Domain.userModel(newUserGuid, authId, authEmail);
                    allUsers.push(user);
                    var updatedUsers = MoviesDb.DataAccess.updateUsers(allUsers);
                } catch (err) {
                    console.log(err);
                }
            }
        }
        return user;
    },

    // Get all users
    getAllUsers: function () {
        var usersRaw = fs.readFileSync(usersPath);
        var users = JSON.parse(usersRaw);
        return users;
    },

    // Get all movies from storage
    getAllMovies: function () {
        var moviesRaw = fs.readFileSync(moviesPath);
        var movies = JSON.parse(moviesRaw);
        return movies;
    },

    // Get all movie formats from storage
    getAllMovieFormats: function () {
        var movieFormatsRaw = fs.readFileSync(movieFormatsPath);
        var movieFormats = JSON.parse(movieFormatsRaw);
        return movieFormats;
    },

    // Update users with new value
    updateUsers: function (updatedUsers) {
        var jsonString = JSON.stringify(updatedUsers);
        fs.writeFileSync(usersPath, jsonString);
        var usersAfterUpdate = MoviesDb.DataAccess.getAllUsers();
        return usersAfterUpdate;
    },

    // Update movies with new value
    updateMovies: function (updatedMovies) {
        var jsonString = JSON.stringify(updatedMovies);
        fs.writeFileSync(moviesPath, jsonString);
        var moviesAfterUpdate = MoviesDb.DataAccess.getAllMovies();
        return moviesAfterUpdate;
    },

    // Get authenticated user's movies
    getMoviesForUser: function (userGuid) {
        var myMovies = [];
        var movies = MoviesDb.DataAccess.getAllMovies();
        if (movies && movies.length > 0) {
            var userMoviesForUser = movies.filter(um => um.userGuid === userGuid);
            myMovies = userMoviesForUser;
        }
        return myMovies;
    },

    // Get a movie from a collection by GUID
    getMovie: function (movies, guid) {
        var movie;
        if (movies && movies.length > 0) {
            var movieWithGuid = movies.filter(um => um.guid === guid);
            movie = movieWithGuid;
        }
        return movie;
    }
};

module.exports = MoviesDb.DataAccess;

