//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

var selectedDay;
var showtime;
var cinemas = [];
var arr_theater_info = {};
let theaterSeatNum;

const fetchData = async () => {
    await $.get('/movie/theaterSeatNum').done(function (data) {
        theaterSeatNum = data;
    });
};

function findUniqueNumbers(arr) {
    var uniqueNumbers = [...new Set(arr)];
    return uniqueNumbers;
}

const getDate = (day) => {
    var currentDate = new Date(day);
    // console.log(currentDate, selectedDay);
    // currentDate.setDate(currentDate.getDate() + parseInt(selectedDay));
    var formattedDate = currentDate.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }).split(',')[0];
    var dateParts = formattedDate.split('/');
    for (var i = 0; i < 2; i++) {
        if (dateParts[i] < 10) {
            dateParts[i] = '0' + dateParts[i];
        }
    }
    return `${dateParts[2]}/${dateParts[0]}/${dateParts[1]}`;
};

const getTime = (time) => {
    //switch to 12hour version from 24 hour
    var hour = time.split(':')[0];
    var minute = time.split(':')[1];
    var ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minute} ${ampm}`;
};

const generateTheaterTime = async (cinema) => {
    var theaterTime = '';

    arr_theater_info[cinema].forEach(function (info, index) {
        if (info.bookedSeat.length == theaterSeatNum) {
            `<div onclick="location.href='/movie/ticket/${info.id}'"
        class="group cursor-pointer font-semibold border-2 border-black text-xl rounded-md hover:bg-black hover:text-white transition-colors flex flex-col h-[80px]">
            <div class="relative">
                <p class="group-hover:opacity-0 group-hover:pointer-event-none transition-all duration-200 px-10 pt-1.5 pb-0.5">${
                    info.time
                }</p>
                <p class="group-hover:opacity-100 group-hover:pointer-event-auto transition-all duration-200 absolute left-0 top-0 w-full text-center opacity-0 pointer-event-none px-8 pt-1.5 pb-0.5"> ${
                    info.bookedSeat.length
                } / ${theaterSeatNum[info.theater]}</p>
           </div>
           <div class="group-hover:bg-red-700 transition-colo``rs w-full h-4 flex-1 bg-[#cd292a] rounded-md text-sm text-white flex items-center justify-center gap-2 ml-[-2px] w-[calc(100%+4px)] mb-[-2px]"><p>SOLD OUT</p></div>
       
    </div>`;
        } else if (info.bookedSeat.length > theaterSeatNum / 2) {
            theaterTime += `<div onclick="location.href='/movie/ticket/${info.id}'"
        class="group cursor-pointer font-semibold border-2 border-black text-xl rounded-md hover:bg-black hover:text-white transition-colors flex flex-col h-[80px]">
     
           <div class="relative">
                <p class="group-hover:opacity-0 group-hover:pointer-event-none transition-all duration-200 px-10 pt-1.5 pb-0.5">${
                    info.time
                }</p>
                <p class="group-hover:opacity-100 group-hover:pointer-event-auto transition-all duration-200 absolute left-0 top-0 w-full text-center opacity-0 pointer-event-none px-8 pt-1.5 pb-0.5"> ${
                    info.bookedSeat.length
                } / ${theaterSeatNum[info.theater]}</p>
           </div>
           <div class="group-hover:bg-orange-700 transition-colors w-full h-4 flex-1 bg-[#e15822] rounded-md text-sm text-white font-light flex items-center justify-center gap-2 ml-[-2px] w-[calc(100%+4px)] mb-[-2px]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17.66 11.2c-.23-.3-.51-.56-.77-.82c-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32c-2.59 2.08-3.61 5.75-2.39 8.9c.04.1.08.2.08.33c0 .22-.15.42-.35.5c-.23.1-.47.04-.66-.12a.58.58 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5c.14.6.41 1.2.71 1.73c1.08 1.73 2.95 2.97 4.96 3.22c2.14.27 4.43-.12 6.07-1.6c1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6c-1.12.4-2.24-.16-2.9-.82c1.19-.28 1.9-1.16 2.11-2.05c.17-.8-.15-1.46-.28-2.23c-.12-.74-.1-1.37.17-2.06c.19.38.39.76.63 1.06c.77 1 1.98 1.44 2.24 2.8c.04.14.06.28.06.43c.03.82-.33 1.72-.93 2.27Z"/></svg><p>Almost Full</p></div>
    </div>
    `;
        } else {
            theaterTime += `
                <div onclick="location.href='/movie/ticket/${info.id}'"
                    class="group px-10 py-4 cursor-pointer shrink-0 font-semibold border-2 border-black text-xl rounded-md hover:bg-black hover:text-white transition-colors h-[80px] grid place-items-center">
                    <div class="relative">
                <p class="group-hover:opacity-0 group-hover:pointer-event-none transition-all duration-200">${
                    info.time
                }</p>
                <p class="group-hover:opacity-100 group-hover:pointer-event-auto transition-all duration-200 absolute left-0 top-0 w-full text-center opacity-0 pointer-event-none"> ${
                    info.bookedSeat.length
                } / ${theaterSeatNum[info.theater]}</p>
           </div>
                </div>`;
        }
    });
    return theaterTime;
};

const handleSelectDay = (e) => {
    selectedDay = e.dataset.index;
    compareShowDateWithCurrentDate(showtime);
    document.querySelector('.day-con').innerHTML = generateDateList();
};

function convertTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours}hr ${mins}min`;
}

const compareShowDateWithCurrentDate = async (showtime) => {
    cinemas = [];
    arr_theater_info = {};

    showtime.forEach(function (show, index) {
        //show.showtime format is 2023/11/16 10:00 if the date is equal current date
        var showdate = show.showtime.split(' ')[0];
        if (showdate == getDate(selectedDay)) {
            cinemas.push(showtime[index].cinema);
            //if arr_theater_time include showtime[index].cinema then push showtime[index].showtime to arr_theater_time[showtime[index].cinema]
            if (arr_theater_info[showtime[index].cinema] == undefined) {
                arr_theater_info[showtime[index].cinema] = [];
                arr_theater_info[showtime[index].cinema].push({
                    id: showtime[index]._id,
                    time: getTime(showtime[index].showtime.split(' ')[1]),
                    bookedSeat: showtime[index].bookedSeat,
                    theater: showtime[index].cinema,
                });
            } else {
                arr_theater_info[showtime[index].cinema].push({
                    id: showtime[index]._id,
                    time: getTime(showtime[index].showtime.split(' ')[1]),
                    bookedSeat: showtime[index].bookedSeat,
                    theater: showtime[index].cinema,
                });
            }
        }
    });

    document.querySelector('.theater-con').innerHTML = '';

    if (findUniqueNumbers(cinemas).length == 0) {
        document.querySelector('.theater-con').innerHTML = `
        <div class="fade-in flex-1 flex flex-col justify-center items-center">
            <svg class="w-40 text-[#d1274a]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><path d="M19 5h-9v14h9a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2Z" opacity=".16"/><path d="M3 10H2a1 1 0 0 0 1 1v-1Zm0 4v-1a1 1 0 0 0-1 1h1Zm18-4v1a1 1 0 0 0 1-1h-1Zm0 4h1a1 1 0 0 0-1-1v1ZM5 6h5V4H5v2Zm5 0h9V4h-9v2Zm9 12h-9v2h9v-2Zm-9 0H5v2h5v-2ZM9 5v14h2V5H9Zm-5.293 6.293a1 1 0 0 1 0 1.414l1.414 1.414a3 3 0 0 0 0-4.242l-1.414 1.414Zm16.586 1.414a1 1 0 0 1 0-1.414l-1.414-1.414a3 3 0 0 0 0 4.242l1.414-1.414ZM3 11c.257 0 .512.097.707.293l1.414-1.414A2.994 2.994 0 0 0 3 9v2Zm1-1V7H2v3h2Zm0 7v-3H2v3h2Zm-.293-4.293A.994.994 0 0 1 3 13v2c.766 0 1.536-.293 2.121-.879l-1.414-1.414Zm16.586-1.414A.994.994 0 0 1 21 11V9c-.766 0-1.536.293-2.121.879l1.414 1.414ZM20 7v3h2V7h-2Zm0 7v3h2v-3h-2Zm1-1a.994.994 0 0 1-.707-.293l-1.414 1.414A2.994 2.994 0 0 0 21 15v-2ZM5 18a1 1 0 0 1-1-1H2a3 3 0 0 0 3 3v-2Zm14 2a3 3 0 0 0 3-3h-2a1 1 0 0 1-1 1v2Zm0-14a1 1 0 0 1 1 1h2a3 3 0 0 0-3-3v2ZM5 4a3 3 0 0 0-3 3h2a1 1 0 0 1 1-1V4Z"/></g></svg>
            <div class="text-4xl font-medium text-center">Oops!<br/> <p class="text-lg font-normal text-gray-500 mt-4">No Movie Available</p></div>
        </div>
        `;
    }

    const uniqueCinemas = await findUniqueNumbers(cinemas);
    for (const cinema of uniqueCinemas) {
        document.querySelector('.theater-con').innerHTML += `
        <div class="fade-in">
            <p class="text-2xl font-semibold">Theater ${cinema}</p>
            <div class="flex items-center gap-8 mt-4 theater-1-time flex-wrap">
                ${await generateTheaterTime(cinema)}
            </div>
        </div>
    `;
    }
};

function generateDateList() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    let uniqueDates = [...new Set(showtime.map((show) => show.showtime.split(' ')[0]))];
    uniqueDates.sort((a, b) => new Date(a) - new Date(b));
    uniqueDates = uniqueDates.filter((date) => new Date(date) >= new Date());
    let dateList = '';
    if (uniqueDates.length == 0) {
        document.querySelector('.day-con').remove();
    } else {
        uniqueDates.forEach((date, index) => {
            let currentDate = new Date(date);
            if (selectedDay == undefined) {
                selectedDay = currentDate;
            }
            let isSelected = getDate(currentDate) == getDate(new Date(selectedDay));
            dateList += `
                <div data-index="${currentDate}" onclick="handleSelectDay(this)" class="p-5 flex cursor-pointer flex-col items-center gap-3 rounded-lg ${
                    isSelected ? 'bg-[#10316c]' : 'group hover:bg-[#10316c] group transition-colors'
                }">
                    <p class="text-${
                        isSelected ? 'white' : '[#898989] group-hover:text-white'
                    } font-light transition-colors">${
                        currentDate.getDate() == new Date().getDate() ? 'Today' : days[currentDate.getDay()]
                    }</p>
                    <p class="text-4xl ${
                        isSelected ? 'text-white' : 'group-hover:text-white'
                    } font-semibold transition-colors">${currentDate.getDate()}</p>
                    <p class="text-${
                        isSelected ? 'white' : '[#898989] group-hover:text-white'
                    } font-light transition-colors">${months[currentDate.getMonth()]}</p>
                </div>`;
        });
    }
    compareShowDateWithCurrentDate(showtime);
    return dateList;
}

const main = async () => {
    await fetchData();
    const currentPath = window.location.pathname;
    console.log(currentPath);
    $.post(currentPath)
        .done(function (data) {
            console.log(data);
            document.querySelector('title').text = data.movie.name + ' Ticket-Showtime';
            document.querySelector('.poster').src = '../../' + data.movie.image;
            document.querySelector('.title').innerHTML = data.movie.name;
            document.querySelector('.time').innerHTML = convertTime(data.movie.runtime);
            document.querySelector('#description').innerHTML = data.movie.description;
            $('#trailer_btn').on('click', function () {
                window.open(data.movie.trailer);
            });

            //foreach data.movie.showtime
            showtime = data.movie.showtime;
            document.querySelector('.day-con').innerHTML = generateDateList();
        })
        .fail(function () {
            console.log('error');
        });
};

main();
