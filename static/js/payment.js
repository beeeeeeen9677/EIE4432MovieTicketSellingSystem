//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$(document).ready(function () {
    $(document).ready(function () {
        $.post('/movie/paymentDetails')
            .done(function (data) {
                console.log(data);
                init_payment(data.details);
            })
            .fail(function (res, err) {
                console.log('invalid request');
            });
    });
});

function convertTime(mins) {
    const hr = mins / 60;
    const min = mins % 60;
    return hr + 'hr ' + min + 'min';
}

async function init_payment(data) {
    const movie = data.movie;
    //if movie is empty, redirect to /index
    // if (!movie) {
    //     location.href = '/';
    // }
    $('title').text(movie.name + ' Ticket-Payment');
    $('#movie-name').text(movie.name);
    $('#ticket-moviename').text(movie.name);
    const formattedShowtime = new Date(movie.showtime).toLocaleString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
    let theaterSeatNum;
    await $.get('/movie/theaterSeatNum').done(function (data) {
        theaterSeatNum = data;
    });

    //remove string after the last comma
    const _formattedShowtime = formattedShowtime.slice(0, formattedShowtime.lastIndexOf(','));
    $('#showtime').text(_formattedShowtime);
    // get the string that removed after the comma
    const removed = formattedShowtime.slice(formattedShowtime.lastIndexOf(',') + 1);
    $('#time').text(removed);
    $('#ticket-date').text(_formattedShowtime);
    $('#ticket-time').text(removed);
    $('#runtime').text(convertTime(movie['RunTime']));
    $('#ticket-runtime').text(convertTime(movie['RunTime']));
    $('.seat-con').empty();
    data.seat.forEach((seat) => {
        $('.seat-con').append(`<p>${seat}</p>`);
    });
    $('.seat-count').text(data.seat.length);
    $('#cinema').text(movie.cinema);
    $('#type').text(movie.type);
    $('#ticket-type').text(movie.type);
    $('#language').text(movie.language);
    $('#version').text(movie.version);
    $('#poster').attr('src', '/' + movie.image);
    $('#ticket-poster').attr('src', '/' + movie.image);
    $('#poster').attr('alt', movie.name);
    $('#ticket-poster').attr('alt', movie.name);
    $('#back-btn').attr('href', '/movie/ticket/' + movie._id);
    $('#price').text('$ ' + data.price);
    // $('#total').text('$ ' + data.price);
    $('#selected-seat').text(data.seat);
    $('#ticket-seat').text(data.seat);
    //$('#totalSeat').text(theaterSeatNum[movie.cinema]);

    document.querySelector('#back-btn').addEventListener('click', function () {
        location.href = '/movie/ticket/' + movie._id;
    });

    var ch_valid = false;
    $('#cardHolder').on('change', function () {
        if ($(this).val()) {
            ch_valid = true;
            $('#cardHolder').removeClass('error').addClass('error-free');
        } else {
            ch_valid = false;
            $('#cardHolder').removeClass('error-free').addClass('error');
        }
    });

    var cn_valid = false;
    $('#cardNumber').on('change', function () {
        if ($(this).val().length == 16) {
            cn_valid = true;
            $('#cardNumber').removeClass('error').addClass('error-free');
        } else {
            cn_valid = false;
            $('#cardNumber').removeClass('error-free').addClass('error');
        }
    });

    document.querySelector('#back-btn').addEventListener('click', function () {
        location.href = '/movie/ticket/' + movie._id;
    });
    var exp_valid = false;
    var expMM_valid = false;
    var expYY_valid = false;
    $('.exp-MD ').on('change', function () {
        if (!$('#expiration-MM').val().length > 0) {
            expMM_valid = false;
            $('#expiration-MM').removeClass('error-free').addClass('error');
        } else if ($('#expiration-MM').val() >= 1 && $('#expiration-MM').val() <= 12) {
            expMM_valid = true;
            $('#expiration-MM').removeClass('error').addClass('error-free');
        } else {
            expMM_valid = false;
            $('#expiration-MM').removeClass('error-free').addClass('error');
        }

        if (!$('#expiration-YY').val().length > 0) {
            expYY_valid = false;
            $('#expiration-YY').removeClass('error-free').addClass('error');
        } else if ($('#expiration-YY').val() >= 23) {
            expYY_valid = true;
            $('#expiration-YY').removeClass('error').addClass('error-free');
        } else {
            expYY_valid = false;
            $('#expiration-YY').removeClass('error-free').addClass('error');
        }
        exp_valid = expMM_valid && expYY_valid;
    });

    var cvc_valid = false;
    $('#cvc').on('change', function () {
        if ($(this).val().length >= 3) {
            cvc_valid = true;
            $('#cvc').removeClass('error').addClass('error-free');
        } else {
            cvc_valid = false;
            $('#cvc').removeClass('error-free').addClass('error');
        }
    });

    $(':input').on('change', function () {
        //console.log(ch_valid, cn_valid, exp_valid, cvc_valid);
        if (ch_valid && cn_valid && exp_valid && cvc_valid) {
            //all valid
            $('#purchase').prop('disabled', false);
        } else {
            $('#purchase').prop('disabled', true);
        }
    });

    //console.log(data.seat);

    $('#purchase').on('click', function () {
        if (ch_valid && cn_valid && exp_valid && cvc_valid) {
            //generate 16 digi random string
            var transaction_id = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < 16; i++) {
                transaction_id += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            //console.log("OK");
            $.get('/auth/me', function (res) {
                if (res.status == 'success') {
                    //console.log("ok");
                    var form = document.getElementById('payment-visa');
                    var formData = new FormData(form);
                    formData.append('username', res.user.username);
                    formData.append('movie_id', movie._id);
                    formData.append('price', data.price);
                    const seatJSON = JSON.stringify(data.seat);
                    formData.append('seat', seatJSON);
                    formData.append('transaction_id', transaction_id);
                    $.ajax({
                        url: '/movie/payment/complete',
                        method: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                    })
                        .done(function (res) {
                            location.href = '/history/' + transaction_id;
                        })
                        .fail(function (res, err) {
                            console.log('payment failed');
                            alert('payment failed');
                        });
                }
            }).fail(function (res) {
                console.log('please login');
                let text = 'Login in  to proceed';
                if (confirm(text) == true) {
                    location.href = '/login';
                }
            });
        } else {
            alert('Incorrect input');
        }
    });
}
