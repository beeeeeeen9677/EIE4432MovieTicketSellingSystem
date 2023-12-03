//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$(document).ready(function () {
    $('#login').on('click', function () {
        if ($('#username').val().trim() == '' || $('password').val() == '') {
            //username or password is empty
            console.log('Incorrect username/password');
            alert('Username and password cannot be empty');
        } else {
            //console.log("post form data");
            var form = document.getElementById('login-form');
            var formData = new FormData(form);
            var remember = $('.remember').is(':checked');
            //console.log(formData);
            //submit form data
            $.ajax({
                url: '/auth/login',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
            })
                .done(function (response) {
                    //handel response
                    //console.log(response);  //response is object
                    if (response.status == 'success') {
                        // alert(`Logged as \`${response.user.username}\` (${response.user.role}) \`${response.user.session}\``);
                        location.replace('/index.html');
                        localStorage.setItem('access-token', 'test');
                        //save response.user.session.cookie to cookie
                        console.log('remember: ' + remember);
                        if (remember) {
                            setCookie('access_token', response.user.access_token, 525600);
                            setCookie('remember', $('#username').val(), 525600);
                        } else {
                            setCookie('remember', '', -1);
                            setCookie('access_token', response.user.access_token, 1);
                        }
                    }
                })
                .fail(function (response) {
                    //handle error
                    //console.log(response);
                    const res = response.responseJSON;
                    const msg_error = document.querySelector('.msg-error');
                    msg_error.style.marginTop = '0';
                    msg_error.style.opacity = '1';
                    msg_error.style.pointerEvent = 'auto';
                    msg_error.style.maxHeight = '24px';
                });
        }
    });
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}
