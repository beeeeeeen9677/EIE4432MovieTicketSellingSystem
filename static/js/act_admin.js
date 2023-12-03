//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$(document).ready(function () {
    const pathname = window.location.pathname;
    console.log(pathname);

    var moviename;
    var mode;
    $.post(pathname, function (res) {
        moviename = res.data.movie;
        $('#movie_name').val(res.data.movie);
        $('#movie_name').prop('disabled', true);
        res.data.theaters.sort().forEach(function (theater) {
            $('#theater-no').append(`<option value=${theater.cinema}>Theater ${theater.cinema}</option>`);
        });

        mode = res.data.mode;

        if (res.data.mode == 'edit') {
            $('title').text('Edit-' + moviename);
            //preset the form value
            const showtime_data = res.data.showtime_data;
            //console.log(showtime_data);
            $('#runtime').val(showtime_data.RunTime);
            let $select;
            $select = document.querySelector('#theater-no');
            $select.value = showtime_data.cinema;
            $select = document.querySelector('#language');
            $select.value = showtime_data.language;
            $select = document.querySelector('#version');
            $select.value = showtime_data.version;
            const s_year = showtime_data.showtime.slice(0, 4);
            const s_month = showtime_data.showtime.slice(5, 7);
            const s_day = showtime_data.showtime.slice(8, 10);
            const s_time = showtime_data.showtime.slice(-5);
            //console.log(s_day + '/' + s_month + '/' + s_year + 'T' + s_time);
            $('#showtime').val(s_year + '-' + s_month + '-' + s_day + 'T' + s_time);

            $('#form_title').text('Edit showtime for current movie');
            $('#form-btn').text('Modify');
            $('#delete-btn').removeClass('hidden');
            $('#delete-btn').on('click', function () {
                if (confirm('Warning: Confirm to proceed deletion? ')) {
                    $.post('/admin/deleteShowtime', { movie_id: showtime_data._id })
                        .done(function (res) {
                            alert(res.message);
                            location.href = '/admin/edit/' + moviename;
                        })
                        .fail(function (res) {
                            alert(res.responseJSON.message);
                        });
                }
            });
        } else {
            $('title').text('Add-' + moviename);
        }
    });

    $('#form-btn').on('click', function () {
        //check input
        if ($('#movie_name').val() != moviename) {
            alert('Invalid action.');
        } else if (!$('#showtime').val()) {
            alert('Showtime field cannot be empty.');
        } else if (!$('#runtime').val()) {
            alert('Runtime field cannot be empty.');
        } else if (Number($('#runtime').val()) < 0 || !Number.isInteger(Number($('#runtime').val()))) {
            alert('Runtime should be a positive integer. ');
        } else if (!$('#theater-no').val()) {
            alert('Theater number cannot be empty.');
        } else if (!$('#language').val()) {
            alert('Language field cannot be empty.');
        } else if (!$('#version').val()) {
            alert('Version field cannot be empty.');
        } else {
            //upload form data
            var form = document.getElementById('event_form');
            var formData = new FormData(form);
            formData.append('moviename', moviename);
            $.ajax({
                url: '/admin/update' + pathname.slice(6),
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
            })
                .done(function (res) {
                    console.log(res);

                    alert(`Movie ${mode == 'edit' ? 'updated' : 'added'} successfully`);
                    location.href = '/admin/' + (mode == 'edit' ? 'edit/' + moviename : '');
                })
                .fail(function (res) {
                    console.log('failed to create event');
                    const r = res.responseJSON;
                    alert(r.message);
                });
        }
    });
});
