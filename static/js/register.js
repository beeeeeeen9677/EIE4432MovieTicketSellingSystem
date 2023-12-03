//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
function previewFile() {
    var preview = document.querySelector('img');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
    }
}
$(document).ready(function () {
    $('#register').on('click', function () {
        console.log('1');
        if (!$('#username').val().trim() || !$('#password').val()) {
            //one of them empty
            alert('Username and password cannot be empty');
        } else if ($('#password').val() != $('#repeat-password').val()) {
            //Password mismatch!
            alert('Password mismatch!');
        } else if (!$('#nickname').val().trim()) {
            alert('Nickname cannot be empty');
        } else if (!$('#email').val().trim()) {
            alert('Email Address cannot be empty');
        } else if ($('#email').val().indexOf('@') == -1) {
            alert('Email Address error');
        } else if (!$('#avatar').val().trim()) {
            alert('Avatar cannot be empty');
        } else if ($('#gender').val() == 'null') {
            //Gender is empty
            alert('Please select your gender');
        } else if (!$('#birthday').val().trim()) {
            alert('Birthday cannot be empty');
        } else {
            $('#role').prop('disabled', false);
            var form = document.getElementById('register-form');
            var formdata = new FormData(form);
            console.log(formdata);
            console.log($('#role').val());
            $.ajax({
                url: '/auth/register',
                method: 'post',
                data: formdata,
                processData: false,
                contentType: false,
            })
                .done(function (res) {
                    alert(`Welcome, ${res.user.username}!\nYou can login with your account now!`);
                    location.replace('/login.html');
                })
                .fail(function (response) {
                    const res = response.responseJSON;
                    alert(res.message);
                });
        }
    });
});
