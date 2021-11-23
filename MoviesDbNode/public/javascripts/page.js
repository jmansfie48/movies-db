
// Extract updates from page and call the update route
function updateMovie(id) {

    var title = $("#movie-title-" + id).val();
    var format = $("#movie-format-" + id).val();
    var length = +($("#movie-length-" + id).val());
    var releaseYear = +($("#movie-release-year-" + id).val());
    var rating = +($("#movie-rating-" + id).val());
    var guid = $("#movie-guid-" + id).val();

    var jsonData = {
        guid: guid,
        format: format,
        rating: rating,
        title: title,
        releaseYear: releaseYear,
        length: length
    };

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: './update',
            data: JSON.stringify(jsonData),
            type: "PUT",
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function (data) {
                resolve(alert(data));
            })
            .fail(function (jqXHR) {
                reject(alert(jqXHR.responseText));
            })
            .always(function () {
                window.location.href = window.location.href;
            });
    });
}

// Extract updates from page and call the update route
function addMovie() {

    var title = $("#new-movie-title").val();
    var format = $("#new-movie-format").val();
    var length = +($("#new-movie-length").val());
    var releaseYear = +($("#new-movie-release-year").val());
    var rating = +($("#new-movie-rating").val());

    var jsonData = {
        format: format,
        rating: rating,
        title: title,
        releaseYear: releaseYear,
        length: length
    };

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: './add',
            data: JSON.stringify(jsonData),
            type: "POST",
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function (data) {
                resolve(alert(data));
            })
            .fail(function (jqXHR) {
                reject(alert(jqXHR.responseText));
            })
            .always(function () {
                window.location.href = window.location.href;
            });
    });
}

// Extract updates from page and call the update route
function deleteMovie(id) {

    var guid = $("#movie-guid-" + id).val();

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: './delete/' + guid,
            type: "DELETE",
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function (data) {
                resolve(alert(data));
            })
            .fail(function (jqXHR) {
                reject(alert(jqXHR.responseText));
            })
            .always(function () {
                window.location.href = window.location.href;
            });
    });
}

// Clear fields on the add table
function resetAddFields() {
    var title = $("#new-movie-title").val(null);
    var format = $("#new-movie-format").val(null);
    var length = +($("#new-movie-length").val(null));
    var releaseYear = +($("#new-movie-release-year").val(null));
    var rating = +($("#new-movie-rating").val(null));
}