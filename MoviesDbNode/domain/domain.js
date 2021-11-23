var MoviesDb = MoviesDb || {};
MoviesDb.Domain = {

    // Storage-ready movie model
    movieModel: function (title, format, length, releaseYear, rating, allMovieFormats) {
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
        movie.formatGuid = movieFormat.guid;
        movie.length = length;
        movie.releaseYear = releaseYear;
        movie.rating = rating;

        return movie;
    },

    // Storage-ready user model
    userModel: function (guid, authId, email) {
        var user = {};

        // Guid logic
        // - a guid must be specified
        if (!guid || guid.length < 1) {
            throw 'All users must have a guid.'
        }

        // Auth ID logic
        // - an auth ID must be specified
        if (!authId || authId.length < 1) {
            throw 'All users must have an auth ID.'
        }

        // Email logic
        // - an auth ID must be specified
        if (!email || email.length < 1) {
            throw 'All users must have an email.'
        }

        user.guid = guid;
        user.auth_id = authId;
        user.email = email;

        return user;
    }
};

module.exports = MoviesDb.Domain;

