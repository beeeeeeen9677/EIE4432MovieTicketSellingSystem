// let histories = [];
// let movies = [];
// let mIndex = 0;
// const handleTransaction = (e) => {
//     const index = parseInt(e.dataset.index);
//     mIndex = index;
//     console.log(histories[index]);
//     window.history.pushState({}, '', `/history/${histories[index].transaction_id}`);
//     const date = new Date(movies[index].showtime.split(' ')[0]);
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     const month = months[date.getMonth()];
//     const day = date.getDate();
//     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const formatted_date = `${days[day]}, ${month} ${day}`;
//     document.querySelector('.seat-con').innerHTML = '';
//     histories[index].seat.forEach((seat) => {
//         document.querySelector('.seat-con').innerHTML += `<p class="seat">${seat}</p>`;
//     });
//     const runtime = movies[index].RunTime;
//     const hours = Math.floor(runtime / 60);
//     const minutes = runtime % 60;
//     document.querySelector('#runtime').textContent = `${hours}h ${minutes}m`;
//     document.querySelector('.seat-count').textContent = histories[index].seat.length;
//     document.querySelector('#time').textContent = movies[index].showtime.split(' ')[1];
//     document.querySelector('#showtime').textContent = formatted_date;
//     document.querySelector('#poster').src = `/${movies[index].image}`;
//     document.querySelector('#movie-name').textContent = movies[index].name;
//     document.querySelector('.price').textContent = `$${histories[index].price}.`;
//     document.querySelector('.theater').textContent = `Theater ${movies[index].cinema}`;
//     document.getElementById('qrcode').innerHTML = '';
//     var qrcode = new QRCode(document.getElementById('qrcode'), {
//         text: `${histories[index].transaction_id}`,
//         width: 128,
//         height: 128,
//         colorDark: '#000000',
//         colorLight: '#ffffff',
//         correctLevel: QRCode.CorrectLevel.H,
//     });
//     renderHistories();
// };
// $.get('/auth/history').done(function (data) {
//     histories = data.user.transactionHistory;
//     movies = data.user.movies;
//     renderHistories();
//     const path = window.location.pathname.split('/')[2];
//     handleTransaction(
//         document.querySelector(!path ? '[data-index="0"]' : `[data-id="${window.location.pathname.split('/')[2]}"]`)
//     );
// });
// const renderHistories = () => {
//     const transaction_container = document.querySelector('.transaction-con');
//     transaction_container.innerHTML = '';
//     histories.forEach((item, index) => {
//         const date = new Date(item.date);
//         const month = date.toLocaleString('en-US', { month: 'long' });
//         const day = date.getDate();
//         const formatted_date = `${month} ${day}`;

//         transaction_container.innerHTML +=
//             mIndex == index
//                 ? `
//                         <div data-index="${index}" data-id="${histories[index].transaction_id}" onclick="handleTransaction(this)" class="flex h-fit overflow-hidden border rounded-md z-1 font-medium bg-black text-white border-black transition-all cursor-pointer">
//                             <div class="p-4 py-5 min-w-[125px] shrink-0">${formatted_date}</div>
//                             <div class="p-4 py-5 flex-[2] md:min-w-[290px] truncate">${movies[index].name}</div>
//                             <div class="p-4 py-5 min-w-[125px] shrink-0">$${histories[index].price}.00</div>
//                         </div>
//                     `
//                 : `<div data-index="${index}" data-id="${histories[index].transaction_id}" onclick="handleTransaction(this)" class="flex h-fit overflow-hidden hover:bg-black hover:text-white border rounded-md z-1 font-medium text-gray-600 hover:border-black transition-all cursor-pointer">
//                             <div class="p-4 py-5 min-w-[125px] shrink-0">${formatted_date}</div>
//                             <div class="p-4 py-5 flex-[2] md:min-w-[290px] truncate">${movies[index].name}</div>
//                             <div class="p-4 py-5 min-w-[125px] shrink-0">$${histories[index].price}.00</div>
//                         </div>`;
//     });
// };
