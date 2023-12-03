//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
$(document).ready(function () {
    $.get('/auth/me')
        .done(function (res) {
            if (res.user.role != 'admin') {
                alert('Unauthorized access');
                location.replace('/');
            }
        })
        .fail(function (res) {
            console.log(res.responseJSON.message);
            alert('Unauthorized access');
            location.replace('/');
        });
});
