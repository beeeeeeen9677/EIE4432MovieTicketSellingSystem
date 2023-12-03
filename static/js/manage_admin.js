//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$(document).ready(function () {
    $.post('/admin/manage', function (data) {
        data.forEach(function (item) {
            console.log(item);
            $('#index').append(` 
                
                        <div class="group mx-auto max-w-[300px] w-full">
                            <div>
                                <a href="/admin/edit/${item.name}">
                                    <img
                                        src="/${item.image}"
                                        class="group-hover:scale-[1.075] shadow-lg transition-all duration-[0.3s] object-cover w-full aspect-[1/1.5] rounded-md" />
                                </a>
                                <div class="mt-3 group-hover:mt-8 transition-all duration-[0.3s]">
                                    <div>
                                        <p
                                            class="inline-block my-auto px-2 rounded-[3px] w-fit bg-[#848484] text-white text-sm font-medium">
                                            ${item.type}
                                        </p>
                                    </div>
                                    <p class="inline-block font-semibold text-xl box-content h-14 w-full">
                                        ${item.name}
                                    </p>
                                    <div class="flex grid grid-cols-2 gap-4 mt-12 transition-all duration-[0.3s] group-hover:mt-7">
                                        <button onclick="location.href='/admin/add/${item.name}/0/new';" 
                                        class="hover:bg-black w-full hover:text-white transition-colors border-2 border-black text-center font-semibold mt-6 w-full p-4 py-2 text-lg rounded-md">ADD</button>
                                        <button onclick="location.href='/admin/edit/${item.name}';" 
                                        class="hover:bg-black w-full hover:text-white transition-colors border-2 border-black text-center font-semibold mt-6 w-full p-4 py-2 text-lg rounded-md">EIDT</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
            `);
        });
    }).fail(function (res) {
        $('#index').html('Failed to fetch data! Try again later!');
    });
});
