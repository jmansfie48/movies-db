var MoviesDb = MoviesDb || {};
MoviesDb.Domain = require('../domain/domain.js');
MoviesDb.DataAccess = require('../data-access/data.access.js');
MoviesDb.Display = require('../ui/display.js');

MoviesDb.Coordination = {

    // Delete a movie
    deleteMovie: function (req) {
        return new Promise(data => {
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
            return MoviesDb.DataAccess.createUser(req).then(function (user) {
                return MoviesDb.Coordination.userGuidForAuthId(req).then(function (userGuid) {
                    return MoviesDb.DataAccess.getMoviesForUser(userGuid).then(function (moviesForUser) {
                        return MoviesDb.DataAccess.getMovie(moviesForUser, deleteGuid).then(function (movieToDelete) {
                            if (!movieToDelete) {
                                res.status = 404;
                                res.message = 'Could not find movie ' + deleteGuid + ' for user with ID ' + userGuid;
                            } else {
                                return MoviesDb.DataAccess.deleteMovie(movieToDelete).then(function (updatedMovies) {
                                    data(res);
                                }).catch(function (err) {
                                    res.status = 400;
                                    res.message = err;
                                });
                            }
                        }).catch(function (err) {
                            res.status = 400;
                            res.message = err;
                        });
                    }).catch(function (err) {
                        res.status = 400;
                        res.message = err;
                    });;
                }).catch(function (err) {
                    res.status = 400;
                    res.message = err;
                });;
            }).catch(function (err) {
                res.status = 400;
                res.message = err;
            });
            data(res);
        });
    },

    // Update a movie
    updateMovie: function (req) {
        return new Promise(data => {

            // Initialize response
            var res = {
                status: 200,
                message: 'Movie successfully updated.'
            };

            // Extract movie information
            var update = req.body;
            var guid = update.guid;

            // Get authenticated user / create user record if needed
            return MoviesDb.DataAccess.createUser(req).then(function (user) {
                return MoviesDb.Coordination.userGuidForAuthId(req).then(function (userGuid) {
                    // Find movie being updated
                    return MoviesDb.DataAccess.getMoviesForUser(userGuid).then(function (moviesForUser) {
                        return MoviesDb.DataAccess.getMovie(moviesForUser, guid).then(function (movieToUpdate) {
                            if (!movieToUpdate) {
                                res.status = 404;
                                res.message = 'Could not find movie with ID ' + guid + ' to update.';
                                data(res);
                            } else {
                                // If we found a movie to update, update it
                                if (movieToUpdate) {
                                    return MoviesDb.DataAccess.getAllMovies().then(function (movies) {
                                        return MoviesDb.DataAccess.getAllMovieFormats().then(function (allMovieFormats) {
                                            try {
                                                var storageReadyMovie = MoviesDb.Coordination.convertMovieUpdateToStoredMovie(update, update.guid, userGuid, allMovieFormats);
                                                return MoviesDb.DataAccess.updateMovie(storageReadyMovie).then(function (updatedMovies) {
                                                    data(res);
                                                }).catch(function (err) {
                                                    res.status = 400;
                                                    res.message = err;
                                                    data(res);
                                                });
                                            } catch (err) {
                                                res.status = 400;
                                                res.message = err;
                                                data(res);
                                            }
                                        }).catch(function (err) {
                                            res.status = 400;
                                            res.message = err;
                                            data(res);
                                        });                                        
                                    }).catch(function (err) {
                                        res.status = 400;
                                        res.message = err;
                                        data(res);
                                    });
                                } else {
                                    res.status = 404;
                                    res.message = 'Could not find movie for user with ID ' + userGuid;
                                    data(res);
                                }
                            }
                        }).catch(function (err) {
                            res.status = 400;
                            res.message = err;
                            data(res);
                        });
                    }).catch(function (err) {
                        res.status = 400;
                        res.message = err;
                        data(res);
                    });
                }).catch(function (err) {
                    res.status = 400;
                    res.message = err;
                    data(res);
                });
            }).catch(function (err) {
                res.status = 400;
                res.message = err;
                data(res);
            });
        });
    },

    // Add a movie
    addMovie: function (req) {
        return new Promise(data => {
            // Initialize response
            var res = {
                status: 200,
                message: 'Movie successfully added.'
            };

            // Extract movie information
            var add = req.body;
            var guid = MoviesDb.DataAccess.generateGuid();

            // Get authenticated user / create user record if needed
            return MoviesDb.DataAccess.createUser(req).then(function (user) {
                return MoviesDb.Coordination.userGuidForAuthId(req).then(function (userGuid) {
                    // Unlikely, but check if any movies have the generated GUID
                    return MoviesDb.DataAccess.getAllMovies().then(function (allMovies) {
                        return MoviesDb.DataAccess.getMovie(allMovies, guid).then(function (movieWithGuid) {
                            if (!movieWithGuid) {
                                guid = MoviesDb.DataAccess.generateGuid();
                            }

                            // Add the movie to storage
                            return MoviesDb.DataAccess.getAllMovieFormats().then(function (allMovieFormats) {
                                try {
                                    var storageReadyMovie = MoviesDb.Coordination.convertMovieUpdateToStoredMovie(add, guid, userGuid, allMovieFormats);
                                    return MoviesDb.DataAccess.addMovie(storageReadyMovie).then(function (updatedMovies) {
                                        data(res);
                                    }).catch(function (error) {
                                        res.status = 400;
                                        res.message = err;
                                        data(res);
                                    });
                                } catch (err) {
                                    res.status = 400;
                                    res.message = err;
                                    data(res);
                                }
                            });
                        }).catch(function (err) {
                            res.status = 400;
                            res.message = err;
                            data(res);
                        });
                    }).catch(function (err) {
                        res.status = 400;
                        res.message = err;
                        data(res);
                    });
                }).catch(function (err) {
                    res.status = 400;
                    res.message = err;
                    data(res);
                });                
            }).catch(function (err) {
                res.status = 400;
                res.message = err;
                data(res);
            });
        });
    },

    // Get list of movies
    getMovies: function (req) {
        return new Promise(data => {
            // Get authenticated user data / create user record if needed
            return MoviesDb.DataAccess.createUser(req).then(function (result) {
                return MoviesDb.Coordination.userGuidForAuthId(req).then(function (userGuid) {
                    var user = req.oidc.user;

                    // Get movie formats
                    return MoviesDb.DataAccess.getAllMovieFormats().then(function (movieFormats) {
                        // Get movies
                        return MoviesDb.DataAccess.getAllMovies().then(function (movies) {
                            // Build model of movies
                            return MoviesDb.Display.myMoviesModel(userGuid, movieFormats, movies, user).then(function (myMovies) {
                                data(myMovies);
                            }).catch(function (err) {
                                throw err;
                            });
                        }).catch(function (err) {
                            throw err;
                        });
                    }).catch(function (err) {
                        throw err;
                    });
                }).catch(function (err) {
                    throw err;
                });
            }).catch(function (err) {
                throw err;
            });
        });
    },

    // Get the user GUID for a given Auth ID
    userGuidForAuthId: function (req) {
        return new Promise(data => {
            return MoviesDb.DataAccess.getAllUsers().then(function (users) {
                var msg = 'No userGuid found for auth ID ' + userId;
                if (req.oidc && req.oidc.user) {
                    var userId = req.oidc.user.sub.split('|')[1];
                    var userGuid = '';
                    if (userId && users && users.length > 0) {
                        var user = users.find(u => u.auth_id === userId);
                        if (user) {
                            userGuid = user.guid;
                            data(userGuid);
                        } else {
                            data(msg);
                        }
                    } else {
                        data(msg);
                    }
                }
            });
        });
    },

    // Convert a display movie model to a storage-ready movie
    convertMovieUpdateToStoredMovie: function (movieToUpdate, guid, userGuid, allMovieFormats) {
        if (movieToUpdate) {
            var updatedMovie = new MoviesDb.Domain.movieModel(movieToUpdate.title, movieToUpdate.format, movieToUpdate.length, movieToUpdate.releaseYear, movieToUpdate.rating, allMovieFormats);
            updatedMovie.guid = guid;
            updatedMovie.userGuid = userGuid;
            return updatedMovie;
        } else {
            throw 'There is no movie update information.';
        }
    }
};

module.exports = MoviesDb.Coordination;
