//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
// Function to get access token from cookies
const getAccessToken = () => {
    // Split cookies
    const cookies = document.cookie.split(';');
    // Find the cookie that includes 'access_token'
    const cookie = cookies.find((item) => item.includes('access_token'));
    // If cookie is found, return the access token
    if (cookie) {
        console.log(cookie.split('=')[1]);
        return cookie.split('=')[1];
    }
    // If no cookie is found, return null
    return null;
};

// Ajax call to validate the access token
$.ajax({
    url: '/auth/validation',
    method: 'GET',
    data: {
        access_token: getAccessToken(),
    },
}).done(function (data) {
    // If data is returned, hide login and register buttons and show user icon and sign out button
    if (data) {
        $('.btn-login').hide();
        $('.btn-reg').hide();
        $('.user-icon').show();
        $('.btn-signout').show();
    } else {
        // If no data is returned, show login and register buttons and hide user icon and sign out button
        $('.btn-login').show();
        $('.btn-reg').show();
        $('.user-icon').hide();
        $('.btn-signout').hide();
    }
});

// Toggle user options on user icon click
$('.user-icon').click(function () {
    if (document.querySelector('.username-con').innerHTML == 'admin') {
        $('.admin-option-con').toggle();
    } else {
        $('.user-option-con').toggle();
    }
});

// Close user options container when user clicks outside
$(document).click(function (event) {
    const target = $(event.target);
    if (
        !target.closest('.user-icon').length &&
        !target.closest('.user-option-con').length &&
        !target.closest('.admin-option-con').length
    ) {
        $('.user-option-con').hide();
        $('.admin-option-con').hide();
    }
});

// Sign out function
const signout = () => {
    // Post request to logout
    $.post('/auth/logout').done(function () {
        // Reload the page after successful logout
        location.reload();
    });
    // Remove access_token cookie
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

const profile = () => {
    location.href = '/profile.html';
};

const history = () => {
    location.href = '/history';
};

const admin_seat = () => {
    location.href = '/seat_admin.html';
};

const admin_manage = () => {
    location.href = '/manage_admin.html';
};

// Get user details
$.get('/auth/me').done(function (data) {
    // Set user avatar and username
    document.querySelector('.image-avatar').src = data.user.avatar;
    document.querySelector('.username-con').innerHTML = data.user.username;
});
