
// Update a movie using numeric index from page
function updateMovie(id) {
    var title = $("#movie-title-" + id).val();
    var format = $("#movie-format-" + id).val();
    var length = +($("#movie-length-" + id).val());
    var releaseYear = +($("#movie-release-year-" + id).val());
    var rating = +($("#movie-rating-" + id).val());
    var guid = $("#movie-guid-" + id).val();

    if (guid) {
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
    } else {
        alert('No GUID found for movie ' + id);
    }
}

// Add a movie using numeric index from page
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

// Delete a movie using numeric index from page
function deleteMovie(id) {
    var guid = $("#movie-guid-" + id).val();
    if (guid) {
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
    } else {
        alert('No GUID found for movie ' + id);
    }
}

// Update a movie using numeric index from page
function testGet() {

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: './get',
            type: "GET",
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function (data) {
                resolve(alert(JSON.stringify(data)));
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
    $("#new-movie-title").val(null);
    $("#new-movie-format").val(null);
    $("#new-movie-length").val(null);
    $("#new-movie-release-year").val(null);
    $("#new-movie-rating").val(null);
}