//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$(document).ready(function () {
    $('#form-btn').on('click', function () {
        //check input
        if (!$('#movie_name').val()) {
            alert('Movie name cannot be empty.');
        } else if (!$('#movie_type').val()) {
            alert('Movie type cannot be empty.');
        } else if (!$('#description').val()) {
            alert('Description field cannot be empty.');
        } else if (!$('#trailer').val()) {
            alert('Trailer field cannot be empty.');
        } else if (document.getElementById('cover_img').files.length != 1) {
            alert('Please upload the image/poster of movie.');
        } else {
            const file = document.getElementById('cover_img').files[0];
            const fileType = file['type'];
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            if (!validImageTypes.includes(fileType)) {
                alert('Invalid file type. Please upload image only. ');
            } else {
                //upload form data
                var form = document.getElementById('event_form');
                var formData = new FormData(form);

                $.ajax({
                    url: '/admin/add_new_event',
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                })
                    .done(function (res) {
                        console.log(res);
                        alert('Movie added successfully');
                        location.href = '/admin/';
                    })
                    .fail(function (res) {
                        console.log('failed to create event');
                        const r = res.responseJSON;
                        alert(r.message);
                    });
            }
        }
    });
});
