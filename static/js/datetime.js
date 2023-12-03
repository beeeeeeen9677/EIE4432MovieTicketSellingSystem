//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

const datetime = () => {
    let current = new Date();
    let cDate = current.getDate() + '/' + (current.getMonth() + 1) + '/' + current.getFullYear();
    let cHour = current.getHours();
    let ampm = cHour >= 12 ? 'PM' : 'AM';
    cHour = cHour % 12;
    cHour = cHour ? cHour : 12; // handle midnight
    let cTime =
        cHour +
        ':' +
        (current.getMinutes() < 10 ? '0' : '') +
        current.getMinutes() +
        ':' +
        (current.getSeconds() < 10 ? '0' : '') +
        current.getSeconds() +
        ' ' +
        ampm;
    let dateTime = cDate + ' ' + cTime;
    $('#datetime').text(dateTime);
};
datetime();
setInterval(function () {
    datetime();
}, 1000);
