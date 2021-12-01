var MoviesDb = MoviesDb || {};
var fs = require('fs');
MoviesDb.Domain = require('../domain/domain.js');

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'movies-db.cfwcuzkrizk2.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: '47DWuLFmm5gAs8UTPwze',
    database: 'moviesdb'
});

MoviesDb.Domain.x = '';
function parseResultsToJson(data) {
    var result;
    if (data) {
        result = JSON.parse(JSON.stringify(data));
    } else {
        console.log('No data to parse.');
    }
    return result;
}

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
        return new Promise(data => {
            return MoviesDb.DataAccess.getAllUsers().then(function (allUsers) {
                var allUsers = allUsers;
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
                            return MoviesDb.DataAccess.addUser(user).then(function (newUser) {
                                data(newUser);
                            }).catch(function (err) {
                                console.log(err);
                                throw 'Unable to create or identify user.';
                            });
                        } catch (err) {
                            console.log(err);
                            throw err;
                        }
                    } else {
                        data(user);
                    }
                } else {
                    console.log(err);
                    throw 'Unable to create or identify user.';
                }
            }).catch(function (err) {
                console.log(err);
                throw 'Unable to create or identify user.';
            });
        });
    },

    // Get all users
    getAllUsers: function () {
        return new Promise(data => {
            pool.query('SELECT * FROM users', function (error, results, fields) {
                if (error) {
                    throw error;
                } else {
                    var allUsers = parseResultsToJson(results);
                    data(allUsers);
                }
            });
        });
    },

    // Get all movies from storage
    getAllMovies: function () {
        return new Promise(data => {
            pool.query('SELECT * FROM movies', function (error, results, fields) {
                if (error) {
                    throw error;
                } else {
                    var allMovies = parseResultsToJson(results);
                    data(allMovies);
                }
            });
        });
    },

    // Get all movie formats from storage
    getAllMovieFormats: function () {
        return new Promise(data => {
            pool.query('SELECT * FROM movieFormats', function (error, results, fields) {
                if (error) {
                    throw error;
                } else {
                    var allMovieFormats = parseResultsToJson(results);
                    data(allMovieFormats);
                }
            });
        });
    },

    // Add new user
    addUser: function (user) {
        return new Promise(data => {
            var insertQuery = "INSERT INTO users (auth_id, guid, username) VALUES ('" + user.auth_id + "','" + user.guid + "','" + user.email + "');";
            pool.query(insertQuery, function (error, results, fields) {
                if (error) {
                    throw error;
                }
                return MoviesDb.DataAccess.getAllUsers().then(function (usersAfterInsert) {
                    var addedUser = usersAfterInsert.find(u => u.auth_id === user.auth_id);
                    data(addedUser);
                }).catch(function (err) {
                    console.log(err);
                    throw 'Could not add user.';
                });
            });
        });
    },

    // Delete existing movie
    deleteMovie: function (movie) {
        return new Promise(data => {
            var updateQuery = "DELETE FROM movies WHERE guid = '" + movie.guid + "';";
            pool.query(updateQuery, function (error, results, fields) {
                if (error) {
                    throw error;
                }
                return MoviesDb.DataAccess.getMoviesForUser(movie.userGuid).then(function (moviesAfterDelete) {
                    data(moviesAfterDelete);
                }).catch(function (err) {
                    console.log(err);
                    throw 'Could not delete movie.';
                });
            });
        });
    },

    // Update existing movie
    updateMovie: function (movie) {
        return new Promise(data => {
            var updateQuery = "UPDATE movies SET title = '" + movie.title + "', formatGuid = '" + movie.formatGuid + "', length = '" + movie.length + "', releaseYear='" + movie.releaseYear + "', rating='" + movie.rating + "' WHERE guid = '" + movie.guid + "';";
            pool.query(updateQuery, function (error, results, fields) {
                if (error) {
                    throw error;
                }
                return MoviesDb.DataAccess.getAllMovies().then(function (moviesAfterUpdate) {
                    var updatedMovie = moviesAfterUpdate.find(m => m.guid === movie.guid);
                    data(updatedMovie);
                }).catch(function (err) {
                    console.log(err);
                    throw 'Could not update movie.';
                });
            });
        });
    },

    // Add new movie
    addMovie: function (movie) {
        return new Promise(data => {
            var insertQuery = "INSERT INTO movies (title, formatGuid, length, releaseYear, rating, guid, userGuid) VALUES ('" + movie.title + "','" + movie.formatGuid + "','" + movie.length + "','" + movie.releaseYear + "','" + movie.rating + "','" + movie.guid + "','" + movie.userGuid + "');";
            pool.query(insertQuery, function (error, results, fields) {
                if (error) {
                    throw error;
                }
                return MoviesDb.DataAccess.getAllMovies().then(function (moviesAfterInsert) {
                    var addedMovie = moviesAfterInsert.find(m => m.guid === movie.guid);
                    data(addedMovie);
                }).catch(function (err) {
                    console.log(err);
                    throw 'Could not add movie.';
                });
            });
        });
    },

    // Update movies with new value
    updateMovies: function (updatedMovies) {
        return new Promise(data => {
            var jsonString = JSON.stringify(updatedMovies);
            fs.writeFileSync(moviesPath, jsonString);
            return MoviesDb.DataAccess.getAllMovies().then(function (moviesAfterUpdate) {
                data(moviesAfterUpdate);
            }).catch(function (err) {
                console.log(err);
                throw 'Could not update movies.';
            });
        });
    },

    // Get authenticated user's movies
    getMoviesForUser: function (userGuid) {
        return new Promise(data => {
            var myMovies = [];
            return MoviesDb.DataAccess.getAllMovies().then(function (movies) {
                if (movies && movies.length > 0) {
                    var userMoviesForUser = movies.filter(um => um.userGuid === userGuid);
                    myMovies = userMoviesForUser;
                }
                data(myMovies);
            }).catch(function (err) {
                console.log(err);
                throw 'Could not retrieve movies for user ' + userGuid + '.';
            });
        });
    },

    // Get a movie from a collection by GUID
    getMovie: function (movies, guid) {
        return new Promise(data => {
            var movie;
            if (movies && movies.length > 0) {
                var movieWithGuid = movies.filter(um => um.guid === guid);
                movie = movieWithGuid;
                if (movieWithGuid) {
                    data(movieWithGuid[0]);
                }
            } else {
                data(movie);
            }
            if (movie) {
                data(movie);
            } else {
                throw 'Could not find movie with guid ' + guid + '.';
            }
        });
    }
};

module.exports = MoviesDb.DataAccess;

