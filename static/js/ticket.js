//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
$(document).ready(function () {
    const pathname = window.location.pathname;
    console.log(pathname);
    $.post(pathname, function (res) {
        console.log(res);
        init_page(res.data.movie, res.data.theater);
    }).fail(function (error) {
        console.log('Fail to load webpage: seatMap. ');
    });
});

function convertTime(mins) {
    const hr = mins / 60;
    const min = mins % 60;
    return hr + 'hr ' + min + 'min';
}

function init_page(movie, theater) {
    //console.log(movie._id);
    //Movie Information
    $('title').text(movie.name + ' Ticket-Seat');
    $('#movie-name').text(movie.name);
    const formattedShowtime = new Date(movie.showtime).toLocaleString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
    const _formattedShowtime = formattedShowtime.slice(0, formattedShowtime.lastIndexOf(','));
    $('#showtime').text(_formattedShowtime);
    // get the string that removed after the comma
    const removed = formattedShowtime.slice(formattedShowtime.lastIndexOf(',') + 1);
    $('#time').text(removed);
    $('#runtime').text(convertTime(movie['RunTime']));
    $('#cinema').text(movie.cinema);
    $('#type').text(movie.type);
    $('#language').text(movie.language);
    $('#version').text(movie.version);
    $('#poster').attr('src', '/' + movie.image);
    $('#poster').attr('alt', movie.name);
    $('#back-btn').on('click', function () {
        location.href = '/movie/showtime/' + movie.name;
    });
    $('.price_cate_1').text('$' + theater.price_cate1);
    $('.price_cate_2').text('$' + theater.price_cate2);

    var x = 50;
    var y = 120;

    //add screen
    $('#cinema-seatMap').append(`  
        <svg height="600" class="mx-auto" id="seat-container" >                
            <rect width="500" height="10" y="10" style="fill:rgb(211, 208, 8);" id="screen" />
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

    var booked = [];
    movie.bookedSeat.forEach(function (record) {
        //console.log(record);
        for (var seat in record) booked.push(seat);
    });
    console.log(movie.bookedSeat);
    if (booked != null) {
        $('.seats').each(function () {
            if (booked.includes($(this).attr('id').slice(-3))) {
                $(this).removeClass('available').addClass('sold');
            }
        });
    } else {
        booked = []; //turn it into array
    }

    var seat_cate2 = theater.seat_cate2;
    if (seat_cate2 != null) {
        $('.seats').each(function () {
            if (seat_cate2.includes($(this).attr('id').slice(-3))) {
                $(this).addClass('cate2');
            }
        });
    }

    var clickedSeats = []; //store clicked seats
    $('.available').on('click', function () {
        if (clickedSeats.length <= 5) {
            //at most select 5 seats
            var currentClickedID = $(this).attr('id').slice(-3);

            if ($(this).hasClass('clicked')) {
                clickedSeats = clickedSeats.filter(function (seat) {
                    return seat != currentClickedID;
                });
            } else {
                if (clickedSeats.length < 5) {
                    clickedSeats.push(currentClickedID);
                } else {
                    return; //quit the function to avoid selecting more seats
                }
            }

            $('#seat-' + currentClickedID).toggleClass('clicked'); //reset or change color if clicked
            $('#seat-no' + currentClickedID).toggleClass('clicked');
            $('#seat-rect' + currentClickedID).toggleClass('clicked');

            //update message and price
            msgUpdate(clickedSeats, theater);
            console.log(clickedSeats); //for debugging
            $('#seat_count').text(clickedSeats.length);
        }
    });

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

    $('.sold').on('click', function () {
        $('#caution-sold').fadeIn(500).delay(3000).fadeOut(500);
    });

    $('#confirm').on('click', function () {
        if (clickedSeats.length) {
            //get here
            //console.log(movie._id);
            $.get('/auth/me', function (res) {
                if (res.status == 'success') {
                    //console.log("ok");
                    $.ajax({
                        method: 'POST',
                        url: '/movie/payment',
                        data: {
                            movie_id: movie._id,
                            seat: clickedSeats,
                            price: price,
                        },
                        dataType: 'json',
                    })
                        .done(function (res) {
                            //console.log(res);
                            location.replace('/movie/payment'); //disable naviagte back to this page
                        })
                        .fail(function (res, error) {
                            console.log('fail to submit data');
                            console.error(error);
                        });
                }
            }).fail(function (res) {
                console.log('please login');
                let text = 'Login in  to proceed';
                if (confirm(text) == true) {
                    location.href = '/login';
                }
            });
        }
    });

    $('.cancel').on('click', function () {
        clickedSeats = []; //clean all selected seats
        $('.clicked').removeClass('clicked');
        msgUpdate(clickedSeats, theater);
    });
}

var price;
function msgUpdate(seats, theater) {
    //update message
    seats.sort();
    if (seats.length == 0) {
        $('#seat-select').text('Please select your seats'); //reset msg to intial state
        $('.confirm-cancel').addClass('d-none'); //hide buttons
    } else {
        $('#seat-select').html(`Selecting seat: </br><span class="font-medium text-2xl text-black">${seats}</span>`); //message
        $('.confirm-cancel').each(function () {
            if ($(this).hasClass('d-none')) {
                $(this).removeClass('d-none').hide().fadeIn(400); //show buttons
            }
        });
    }
    //update price
    price = 0;
    console.log(seats);

    seats.forEach(function (s) {
        price += $('#seat-' + s).hasClass('cate2') ? theater.price_cate2 : theater.price_cate1;
    });
    $('#price').text(price);
}
