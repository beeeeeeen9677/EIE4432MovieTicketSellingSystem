//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
function convertTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours}hr ${mins}min`;
}
$(document).ready(function () {
    $.get('/movie/homepage', function (data) {
        data.forEach(function (item) {
            $('#index').append(` 
            <div class="fade-in group mx-auto max-w-[300px] w-full">
                <div>
                        <img src="${
                            item.image
                        }" class="poster group-hover:scale-[1.075] shadow-lg transition-all duration-[0.3s] object-cover w-full aspect-[1/1.5] rounded-md">
                        <div class="card-body mt-3 group-hover:mt-6 transition-all duration-[0.3s]">
                            <p class="card-text font-semibold text-xl box-content h-14 w-full">${item.name}</p>
                            <div class="flex items-center gap-3 mt-10 transition-all duration-[0.3s] group-hover:mt-7 text-[#888888]">
                              <p class="px-2 rounded-[3px] w-fit bg-[#848484] text-white text-sm font-medium">
                                 ${item.type}
                              </p>
                              <p class="font-medium">R</p>
                              <p class="font-medium">${convertTime(item.RunTime)}</p>
                            </div>
                            <button onclick="location.href='/movie/showtime/${
                                item.name
                            }';" class="hover:bg-black w-full hover:text-white transition-colors border-2 border-black text-center font-semibold mt-6 w-full p-4 py-2 text-lg rounded-md">BUY TICKET</button>
                        </div>
                </div> 
            </div>
      `);
        });
    }).fail(function (error) {
        $('#index').html('Failed to fetch data! Try again later!');
    });
});
