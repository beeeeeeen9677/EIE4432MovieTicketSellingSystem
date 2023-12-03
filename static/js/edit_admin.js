//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

var original_name;
var original_img;
$(document).ready(function () {
    const pathname = location.pathname.slice(6);
    //console.log(pathname);
    $.post('/admin/moviedata' + location.pathname.slice(6))
        .done(function (movie) {
            original_name = movie.name;
            original_img = movie.image;
            $('title').text(original_name + ' Event Management');
            $('#original_name').text(movie.name);
            $('#poster').attr('src', '/' + movie.image);
            $('#trailer').val(movie.trailer);
            $('#movie_type').val(movie.type);
            $('#description').val(movie.description);
            $('#movie_name').val(movie.name);

            console.log(movie);
        })
        .fail(function (res) {
            console.log(res.responseJSON.message);
        });
});

function updateData() {
    //check input
    if (!$('#movie_name').val()) {
        alert('Movie name cannot be empty.');
    } else if (!$('#movie_type').val()) {
        alert('Movie type cannot be empty.');
    } else if (!$('#description').val()) {
        alert('Description field cannot be empty.');
    } else if (!$('#trailer').val()) {
        alert('Trailer field cannot be empty.');
    } else if (document.getElementById('cover_img').files.length > 1) {
        alert('You upload at most 1 image/poster only.');
    } else {
        var type_isValid = true;
        if (document.getElementById('cover_img').files.length == 1) {
            const file = document.getElementById('cover_img').files[0];
            const fileType = file['type'];
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            type_isValid = validImageTypes.includes(fileType);
        }

        if (!type_isValid) {
            alert('Invalid file type. You can upload image only. ');
            document.getElementById('cover_img').value = '';
        } else {
            //upload form data
            var form = document.getElementById('event_form');
            var formData = new FormData(form);
            formData.append('original_name', original_name);
            formData.append('original_img', original_img);

            $.ajax({
                url: '/admin/edit/update',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
            })
                .done(function (res) {
                    console.log(res);
                    alert(res.message);
                    location.replace('/admin/edit/' + $('#movie_name').val());
                })
                .fail(function (res) {
                    console.log('failed to create event');
                    const r = res.responseJSON;
                    alert(r.message);
                });
        }
    }
}
