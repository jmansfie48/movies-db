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
            .always(function () { });
    });
}