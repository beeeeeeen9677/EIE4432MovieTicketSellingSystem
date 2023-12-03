//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$(document).ready(function () {
    const original_name = location.pathname.slice(12);
    $.post('/admin/movie/showtime/' + original_name)
        .done(function (movies) {
            //console.log(movies);

            let index = 0;
            movies.forEach(function (movie) {
                $('#showtime_list').append(`
                    <div
                        id=${'t-' + index}
                        class="ticket group hover:bg-amber-200 rounded-3xl w-full h-fit p-4 my-4 hover:scale-110 transition-all duration-500 flex gap-4">
                        <div class="w-32 ps-2">
                            <div>${convertDate(movie.showtime.slice(0, 10))}</div>
                            <div>${movie.showtime.slice(-5)}</div>
                        </div>
                        <div class="div_bar w-[1px] h-auto border group-hover:border-amber-500 transition-all"></div>
                        <div class="w-24">
                            <div>Theater: ${movie.cinema}</div>
                            <div>${movie.RunTime} min</div>
                        </div>
                        <div class="div_bar w-[1px] h-auto border group-hover:border-amber-500 transition-all"></div>
                        <div class="w-20">
                            <div>${movie.language}</div>
                            <div>${movie.version}</div>
                        </div>
                        <div class="div_bar w-[1px] h-auto border group-hover:border-amber-500 transition-all"></div>

                        <div class="my-auto flex gap-6">
                            <button
                                onclick="location.href='/admin/add/${movie.name}/${movie._id}/edit';" 
                                class="transition bg-transparent hover:bg-violet-500 text-violet-600 font-semibold hover:text-white py-2 px-4 border border-violet-500 hover:border-transparent rounded-xl">
                                Edit
                            </button>
                            <button
                                value="${movie._id}"
                                id=${'tb-' + index}
                                class="ticket_btn transition bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-xl">
                                Ticket
                            </button>
                        </div>
                    </div>
                `);
                index++;
            });

            $('.ticket_btn').on('click', function () {
                //console.log($(this).val());
                let current_id = $(this).val();
                $.post('/admin/loadTransactionHistory', { movie_id: $(this).val() })
                    .done(function (users) {
                        console.log(users);
                        $('.right_part').removeClass('hidden');
                        $('#ticket_list').empty();
                        if (users.length == 0) {
                            //no transaction history was found for this showtime
                            $('#ticket_list').append(`
                                <div class="fade-in bg-amber-100 rounded-xl p-4">
                                    No transaction history was found for this showtime.
                                </div>
                            `);
                        } else {
                            //console.log(users);
                            users.forEach(function (user) {
                                if (user.transactionHistory) {
                                    user.transactionHistory.forEach(function (record) {
                                        if (record.movie_id == current_id) {
                                            //get transaction history for THIS showtime only
                                            $('#ticket_list').append(`
                                            <div class="fade-in bg-amber-100 rounded-xl p-4 my-5 justify-between flex">
                                                <div>
                                                    <div>${user.username}</div>
                                                    <div>Amount: $${record.price}</div>
                                                    <div>Seat: ${record.seat}</div>
                                                    <div>Date: ${convertDate(record.date.slice(0, 10))}</div>

                                                </div>
                                                <div><img alt="icon" src="${
                                                    user.avatar
                                                }" class="box-content h-20"/></div>
                                            </div>
                                        `);
                                        }
                                    });
                                }
                            });
                        }
                    })
                    .fail(function (res) {
                        console.log(res.responseJSON.message);
                    });

                $('.ticket').each(function () {
                    console.log($(this).hasClass('selected'));
                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                    }
                });
                $('#t-' + $(this).attr('id').slice(3)).addClass('selected');
            });
        })
        .fail(function (res) {
            console.log(res.responseJSON.message);
        });
});

function convertDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.slice(5, 7) - 1] + ' ' + date.slice(-2) + ' ' + date.slice(0, 4);
}
