//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
import express from 'express';
import session from 'express-session';
import login from './login.js';
import movie from './movie.js';
import admin from './admin.js';
import mongostore from 'connect-mongo';
import client from './dbclient.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
    session({
        secret: 'eie4432_groupproject',
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true },
        store: mongostore.create({
            client,
            dbName: 'GP4432db',
            collectionName: 'session',
        }),
    })
);

const PREAUTH_KEY = 'UR_J_is_smol';
app.use((req, res, next) => {
    if (!req.session?.allow_access) {
        if (req.query?.authkey === PREAUTH_KEY) {
            req.session.allow_access = true;
        } else {
            res.status(401).json({
                status: 'failed',
                message: 'Unauthorized',
            });
        }
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/index.html'));

    //console.log(req.session);
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/login.html'));
});

app.use('/auth', login);
app.use('/movie', movie);
app.use('/admin', admin);
app.use('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/history.html'));
});

app.use('/', express.static(path.join(process.cwd(), '/static')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/notFound.html'));
});

app.listen(8080, function () {
    let current = new Date();
    let cDate = current.getMonth() + 1 + '/' + current.getDate() + '/' + current.getFullYear();
    let cHour = current.getHours();
    let ampm = cHour >= 12 ? 'PM' : 'AM';
    cHour = cHour % 12;
    let cTime = cHour + ':' + current.getMinutes() + ':' + current.getSeconds() + ' ' + ampm;
    let dateTime = cDate + ', ' + cTime;
    console.log(dateTime);
    console.log('Server started at http://127.0.0.1:8080');
});
