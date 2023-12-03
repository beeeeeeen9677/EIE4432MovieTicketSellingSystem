//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

$.get('/auth/me').done(function (data) {
    // Set user avatar and username
    document.querySelector('title').text = data.user.username + ' Profile';
    document.querySelector('.image-avatar').src = data.user.avatar;
    document.querySelector('.username-con').innerHTML = data.user.username;
    document.querySelector('#nickname').value = data.user.nickname;
    document.querySelector('#username').value = data.user.username;
    document.querySelector('#password').value = data.user.password;
    document.querySelector('#photo').value = data.user.avatar;
    document.querySelector('#email').value = data.user.email;
    document.querySelector('#birthday').value = data.user.birthday;
    document.querySelector('#gender').value = data.user.gender;
});
$('#delete_ac').on('click', function () {
    $.post('/auth/del_ac', {
        username: document.querySelector('#username').value,
    })
        .done(function (data) {
            alert('Delete Successful');
            location.href = '/index.html';
        })
        .fail(function () {
            alert('An error occurred');
        });
});
$('#save').on('click', function () {
    $.post('/auth/update_user', {
        avatar: document.querySelector('#photo').value,
        username: document.querySelector('#username').value,
        user_o: document.querySelector('#username').value,
        nickname: document.querySelector('#nickname').value,
        password: document.querySelector('#password').value,
        email: document.querySelector('#email').value,
        birthday: document.querySelector('#birthday').value,
        gender: document.querySelector('#gender').value,
    })
        .done(function (data) {
            alert('Update Successfully!!!');
            document.querySelector('.username-con').innerHTML = data.username;
            document.querySelector('.image-avatar').src = data.avatar;
            location.href = '/index.html';
            console.log(data);
        })
        .fail(function () {
            alert('Error occurred');
        });
});
