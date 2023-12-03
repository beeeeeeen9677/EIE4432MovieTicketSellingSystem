//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
var theater;
$(document).ready(function () {
    $.post('/admin/seat')
        .done(function (res) {
            const movies = res.data.movie;
            theater = res.data.theater;
            theater.forEach(function (theater) {
                $('#theater-no').append(`<option value=${theater.cinema}>Theater ${theater.cinema}</option>`);
            });
            $('#theater-no').append(`<option value="new">Create NEW theater</option>`);

            //console.log(movie);
            //console.log(theater);
            $('#theater-no').on('change', function () {
                //console.log($(this).val());
                $('.totalSeatNumber').prop('disabled', false);
                $('.price_cate').prop('disabled', false);
                $('#confirm-btn').prop('disabled', false);
                if ($(this).val() && $(this).val() != 'new') {
                    $('#movie-list').prop('disabled', false);
                    $('#showtime-list').prop('disabled', true);
                    $('#showtime-list').empty();
                    $('#showtime-list').append(`<option value="none" selected disabled>Please Select</option>`);
                    $('.seat_info').removeClass('d-none').hide().fadeIn('1500');
                    $('.seat_info_cate').addClass('d-none');
                    $('#radio-status').prop('disabled', false);

                    load_movieList(movies);

                    var currentTheater = theater.find((obj) => obj.cinema == $(this).val());
                    const rowNum = currentTheater.row;
                    const colNum = currentTheater.column;
                    $('#totalSeatRow').val(rowNum);
                    $('#totalSeatCol').val(colNum);
                    const price_cate1 = currentTheater.price_cate1;
                    const price_cate2 = currentTheater.price_cate2;
                    $('#price_cate1').val(price_cate1);
                    $('#price_cate2').val(price_cate2);
                    load_seatMap(currentTheater);
                    show_category(currentTheater);
                } else if ($(this).val() == 'new') {
                    //add new theater
                    $('#radio-status').prop('disabled', true);
                    document.getElementById('radio-modify').checked = true;
                    $('#cinema-seatMap').empty();
                    $('.seat_info').addClass('d-none');
                    $('#seat-modify').removeClass('d-none');
                    $('#seat-status').addClass('d-none');
                    $('#totalSeatRow').val(4);
                    $('#totalSeatCol').val(10);
                    $('#price_cate1').val(100);
                    $('#price_cate2').val(120);
                } else {
                    $('.totalSeatNumber').prop('disabled', true);
                    $('.price_cate').prop('disabled', true);
                    $('#confirm-btn').prop('disabled', true);
                    $('#movie-list').prop('disabled', true);
                }
            });

            $('#confirm-btn').on('click', function () {
                const rowNum = Number($('#totalSeatRow').val());
                const colNum = Number($('#totalSeatCol').val());
                const price_cate1 = $('#price_cate1').val();
                const price_cate2 = $('#price_cate2').val();
                if ($('#theater-no').val() && rowNum && colNum) {
                    //all input field not empty
                    if (!Number.isInteger(rowNum) || !Number.isInteger(colNum)) {
                        alert('Invalid. Row number and Column number should be INTEGER. ');
                    } else if (rowNum <= 0 || colNum <= 0) {
                        alert('Invalid. Row number and Column number should be larger than 0. ');
                    } else if (rowNum * colNum < 40) {
                        alert('Total number of seats should be at least 40. ');
                    } else if (price_cate1 <= 0 || price_cate2 <= 0) {
                        alert('Price of seats should be larger than 0. ');
                    } else {
                        //update
                        $.post('/admin/seatUpdate', {
                            cinema: $('#theater-no').val(),
                            row: rowNum,
                            column: colNum,
                            price_cate1: price_cate1,
                            price_cate2: price_cate2,
                        })
                            .done(function (res) {
                                console.log(res);
                                alert('Updated successfully');
                                location.reload();
                            })
                            .fail(function () {
                                console.log('Failed to update number of seats');
                            });
                    }
                }
            });

            $('#movie-list').on('change', function () {
                //console.log($('#movie-list').val());
                //console.log($('#theater-no').val());
                //console.log(movies);
                //reset seat map
                $('.seats').each(function () {
                    if ($(this).hasClass('sold')) {
                        $(this).removeClass('sold').addClass('available');
                    }
                });
                $('.seat_info_cate').addClass('d-none');
                $('#showtime-list').prop('disabled', false);
                $('#showtime-list').empty();
                $('#showtime-list').append(`<option value="none" selected disabled>Please Select</option>`);
                movies.forEach(function (movie, index) {
                    if (movie.name == $('#movie-list').val() && movie.cinema == $('#theater-no').val()) {
                        $('#showtime-list').append(`<option value=${index}>${movie.showtime}</option>`);
                    }
                });
            });

            $('#showtime-list').on('change', function () {
                $('.seat_info_cate').addClass('d-none');
                show_status(movies[$(this).val()]);
            });
            //onchange=${show_status(movie)}
        })
        .fail(function () {
            console.log('Fail to load theater data');
        });

    $("input[name='function_radio']").on('change', function () {
        $('.mode-btn').toggleClass('selected-mode');
        $('#user_info').addClass('hidden');
        var selectedFunction = $('input[name="function_radio"]:checked').val();
        //console.log(selectedFunction);
        if (selectedFunction == 'status') {
            $('#seat-modify').addClass('d-none');
            $('#seat-status').removeClass('d-none').hide().fadeIn(500);
            $('#available_status').removeClass('d-none');
            $('#available_status').empty();
        } else {
            $('#seat-modify').removeClass('d-none').hide().fadeIn(500);
            $('#seat-status').addClass('d-none');
            $('#available_status').addClass('d-none');
        }

        if ($('#theater-no').val()) {
            //selected theater
            //refresh
            $('.seats').each(function () {
                if ($(this).hasClass('sold')) {
                    $(this).removeClass('sold').addClass('available');
                }
            });
            const $select = document.querySelector('#showtime-list');
            $select.value = 'none';
        }
    });
});

function load_movieList(movies) {
    //will be called after theater number changed
    $('#movie-list').empty();
    $('#movie-list').append(`<option value="none" selected disabled>Please Select</option>`);
    var distinct = [];
    movies.forEach(function (data) {
        //get distinct movie
        if (data.cinema == $('#theater-no').val()) {
            if (!distinct.includes(data.name)) {
                distinct.push(data.name);
                $('#movie-list').append(`<option value="${data.name}">${data.name}</option>`);
            }
        }
    });
}

var booked_user;
function show_status(movie) {
    if ($('#showtime-list').val()) {
        //reset
        $('.seats').each(function () {
            if ($(this).hasClass('sold')) {
                $(this).removeClass('sold').addClass('available');
            }
        });
        // selected
        //console.log(movie);
        booked_user = movie.bookedSeat;
        var booked = [];
        movie.bookedSeat.forEach(function (record) {
            //console.log(record);
            for (var seat in record) booked.push(seat);
        });
        if (booked != null) {
            $('.seats').each(function () {
                if (booked.includes($(this).attr('id').slice(-3))) {
                    $(this).removeClass('available').addClass('sold');
                }
            });
        } else {
            booked = []; //turn it into array
        }
    }
}

function show_category(theater) {
    if ($('#theater-no').val()) {
        //reset
        $('.seats').each(function () {
            if ($(this).hasClass('cate2')) {
                $(this).removeClass('cate2');
            }
        });
        // update seat map
        //console.log(theater);
        var seat_cate2 = theater.seat_cate2;
        if (seat_cate2 != null) {
            $('.seats').each(function () {
                if (seat_cate2.includes($(this).attr('id').slice(-3))) {
                    $(this).addClass('cate2');
                }
            });
        } else {
            seat_cate2 = []; //turn it into array
        }
    }
}

function load_seatMap(theater) {
    var x = 50;
    var y = 120;

    $('#cinema-seatMap').empty();

    //add screen
    $('#cinema-seatMap').append(`  
        <svg height="600" class="mx-auto fade-in" id="seat-container" >                
            <rect width="500" height="10" y="10" style="fill:rgb(211, 208, 8);" id="screen" />
            <text x="0" y="40" fill="black" id="screen-text" class="fs-5">Screen</text>
        </svg>
    `);

    //add seats
    var charCode = 65;
    for (let j = 0; j < theater.row; j++) {
        //row
        var ch = String.fromCharCode(65 + j);
        for (let i = 0; i < theater.column; i++) {
            //col
            if (i != 0) {
                if (i % (theater.column / 2) == 0) {
                    var rowChar = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    rowChar.setAttribute('class', 'text-xl font-medium');
                    rowChar.setAttribute('x', `${x + 20}`);
                    rowChar.setAttribute('y', `${y + 32}`);
                    rowChar.textContent = ch;
                    svg.appendChild(rowChar);

                    if ($('#screen-text').attr('x') == 0) {
                        $('#screen-text').attr('x', `${x}`);
                    }

                    x += 55; //middle walking space
                }
            }

            var currentSeat = `${i + 1}`;
            if (i + 1 < 10) {
                //zero padding
                currentSeat = '0' + currentSeat;
            }
            currentSeat = ch + currentSeat;

            var svg = document.getElementById('seat-container'); //Get svg element

            var newRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); //rect for seat buttons
            newRect.id = `seat-rect${currentSeat}`;
            newRect.setAttribute('class', 'seats available');
            newRect.setAttribute('width', '50');
            newRect.setAttribute('height', '50');
            newRect.setAttribute('x', `${x}`);
            newRect.setAttribute('y', `${y}`);
            newRect.setAttribute('opacity', '0');
            svg.appendChild(newRect);

            var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            newElement.setAttribute('x', `${x}`);
            newElement.setAttribute('y', `${y}`);

            var newSeat = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            newSeat.id = `seat-${currentSeat}`;
            newSeat.setAttribute('class', 'seats available');
            newSeat.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            newSeat.setAttribute(
                'd',
                'M935.292 958.682H729.154c-13.727 0-24.855-11.129-24.855-24.855v-38.712H320.181v38.712c0 13.727-11.129 24.855-24.855 24.855H90.189c-13.726 0-24.856-11.129-24.856-24.855V408.563c0-13.726 11.13-24.856 24.856-24.856h38.712V138.436c0-41.18 33.375-74.568 74.568-74.568h618.542c41.18 0 74.567 33.388 74.567 74.568v245.271h38.713c13.727 0 24.854 11.13 24.854 24.856v525.263c0.001 13.727-11.126 24.856-24.853 24.856zM832.866 152.436c0-13.727-11.128-24.856-24.854-24.856H216.469c-13.726 0-24.856 11.129-24.856 24.856v231.271h41.712c13.726 0 22.855 11.13 22.855 24.856v166.992h512.118V408.563c0-13.726 11.129-24.856 24.855-24.856h39.712V152.436z m63.572 294.984h-64.426v166.99c0 13.727-11.129 24.856-24.857 24.856H217.326c-13.728 0-24.856-11.13-24.856-24.856V447.419h-64.424v448.55H256.47v-38.712c0-13.727 11.129-24.855 24.856-24.855h460.829c13.729 0 24.857 11.129 24.857 24.855v38.712h129.426V447.42z'
            );
            newSeat.setAttribute('transform', 'scale(0.05,0.05)');
            newElement.appendChild(newSeat);

            svg.appendChild(newElement);

            var newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            newText.id = `seat-no${currentSeat}`;
            newText.setAttribute('class', 'seats available');
            newText.setAttribute('font-weight', 'bold');
            newText.setAttribute('x', `${x + 16}`);
            newText.setAttribute('y', `${y + 24}`);
            newText.textContent = currentSeat.slice(-2);
            newText.style.fontFamily = 'Arial';
            svg.appendChild(newText);

            x += 50;
        }
        x = 50;
        y += 70;
    }

    let seatWidth = document.getElementById('seat-A01').getBoundingClientRect().width;
    $('#seat-container').attr('width', `${(theater.column + 1) * 50 + 55 + seatWidth}`);
    $('#screen').attr('x', `${($('#seat-container').attr('width') - 500) / 2}`);

    /*
    var booked = movie.bookedSeat;
    if (booked != null) {
        $('.seats').each(function () {
            if (booked.includes($(this).attr('id').slice(-3))) {
                $(this).removeClass('available').addClass('sold');
            }
        });
    } else {
        booked = []; //turn it into array
    }
    */

    $('.available').hover(
        function () {
            let selectingID = $(this).attr('id').slice(-3);
            $('#seat-' + selectingID).addClass('selecting');
            $('#seat-no' + selectingID).addClass('selecting');
        },
        function () {
            let selectingID = $(this).attr('id').slice(-3);
            $('#seat-' + selectingID).removeClass('selecting');
            $('#seat-no' + selectingID).removeClass('selecting');
        }
    );

    $('.seats').on('click', function () {
        console.log($('#theater-no').val());
        console.log($('#movie-list').val());
        console.log($('#showtime-list').val());

        $('.seat_info_cate').removeClass('d-none').hide().fadeIn(500);
        $('#seat_icon').removeClass('d-none').hide().fadeIn(500);
        currentClickedID = $(this).attr('id').slice(-3);
        const color = $(this).hasClass('cate2') ? 'purple' : 'green';

        if ($('#showtime-list').val()) {
            $('#available_status').html(
                'Status: <span >' + ($(this).hasClass('sold') ? 'Sold' : 'Available') + '</span>'
            );
            document.querySelector('#available_status span').style.color = $(this).hasClass('sold') ? 'red' : 'green';
        }

        $('#seat_icon svg text').attr('fill', color);
        $('#seat_icon svg text').text(currentClickedID.slice(1));
        $('#seat_icon svg path').attr('fill', color);
        $('#seat_id').text('Seat: ' + currentClickedID);

        const $select = document.querySelector('#cate_select');
        $select.value = $(this).hasClass('cate2') ? '2' : '1';

        var showtime_list = $('#showtime-list').val();
        //console.log(showtime_list);
        var seat_holder;
        $('#user_info').addClass('hidden');
        if (showtime_list) {
            booked_user.forEach(function (record) {
                for (var seat in record)
                    if (seat == currentClickedID) {
                        $('#user_info').removeClass('hidden');
                        seat_holder = record[seat];
                        $.post('/admin/userinfo', { username: seat_holder })
                            .done(function (user) {
                                console.log(user);
                                $('#user_name').text(user.role + ': ' + seat_holder);
                                $('#user_nickname').text(user.nickname);
                                $('#user_gender').text(user.gender);
                                $('#user_birthday').text('birthday: ' + user.birthday);
                                $('#user_email').text(user.email);
                                $('#user_icon').attr('src', user.avatar);
                            })
                            .fail(function (res) {
                                console.log(res.message);
                            });

                        //console.log(seat_holder);
                        break;
                    }
            });
        }
    });
}

var currentClickedID;

function updateSeatCate() {
    //console.log(currentClickedID);
    //console.log(theater);

    //update local data
    theater.forEach(function (t) {
        //current cienma
        if (t.cinema == $('#theater-no').val()) {
            //ensure not duplicate
            t.seat_cate2 = t.seat_cate2.filter(function (seat) {
                return seat != currentClickedID;
            });

            if ($('#cate_select').val() == '2') {
                t.seat_cate2.push(currentClickedID);
            }
            //console.log(t.seat_cate2.sort());

            $.post('/admin/seatCateUpdate', { cinema: t.cinema, seat_cate2: t.seat_cate2 })
                .done(function (res) {
                    show_category(t);
                    const color = $('#seat-' + currentClickedID).hasClass('cate2') ? 'purple' : 'green';

                    $('#available_status').html(
                        'Status: <span>' +
                            ($('#seat-' + currentClickedID).hasClass('sold') ? 'Sold' : 'Available') +
                            '</span>'
                    );
                    document.querySelector('#available_status span').style.color = $(
                        '#seat-' + currentClickedID
                    ).hasClass('sold')
                        ? 'red'
                        : 'green';

                    console.log(color);
                    $('#seat_icon svg text').attr('fill', color);
                    $('#seat_icon svg path').attr('fill', color);
                })
                .fail(function (res) {
                    alert('Failed to update');
                });
        }
    });
}
