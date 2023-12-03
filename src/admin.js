//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
import { Router } from 'express';
import fs from 'fs/promises';
import client from './dbclient.js';
import multer from 'multer';
import { ObjectId } from 'mongodb';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { fetch_theater, update_theater, update_seatCategory, create_theater } from './theaterdb.js';
import {
    fetch_movie,
    addNewMovie,
    check_exist,
    fetch_movieData,
    check_collision,
    update_showtime,
    updateMovieData,
    update_allShowtime,
    deleteShowtime,
} from './moviedb.js';
import { fetch_user } from './userdb.js';

const route = Router();

var storage = multer.diskStorage({
    destination: './static/assets',
    filename: async (req, file, cb) => {
        await cb(null, file.originalname);
    },
});
var form = multer({ storage: storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));

route.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/manage_admin.html'));
});

route.post('/manage', async (req, res) => {
    try {
        const movies = await fetch_movieData();
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(404).json({ status: 'failed' });
    }
});

route.get('/new_event', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/event_admin.html'));
});

route.post('/add_new_event', form.any(), async (req, res) => {
    try {
        //console.log(file.filename + ' is uploaded to ' + file.path);
        console.log(req.body);

        const { movie_name, movie_type, description, trailer } = req.body;
        const exist = await check_exist(movie_name);
        console.log('Exist?');
        console.log(exist);
        if (exist) {
            res.status(400).json({ status: 'failed', message: 'movie existed already' });
            res.end();
        } else {
            const file = req.files[0];
            const image = 'assets/' + file.filename;
            const result = await addNewMovie(movie_name, movie_type, description, trailer, image);
            if (result) {
                res.json({ status: 'success' });
                res.end();
            } else {
                res.status(400).json({ status: 'failed', message: 'failed to add new movie' });
                res.end();
            }
        }
    } catch (err) {
        res.status(400).json({ status: 'failed', message: 'failed to add new movie' });
        console.error(err);
    }
});

route.get('/add/:name/:id/:mode', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/act_admin.html'));
});

route.post('/add/:name/:id/:mode', async (req, res) => {
    try {
        let mode = req.params.mode;
        let showtime_data = null;
        if (mode == 'edit') {
            const id = req.params.id;
            showtime_data = await fetch_movie('', false, id);
        }
        const theaters = await fetch_theater();
        res.json({ data: { theaters: theaters, movie: req.params.name, mode: mode, showtime_data: showtime_data } });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'failed', message: 'failed to add event' });
    }
});

route.post('/deleteShowtime', async (req, res) => {
    try {
        const result = await deleteShowtime(req.body.movie_id);
        if (result) {
            res.json({ status: 'success', message: 'This showtime is deleted successfully. ' });
        } else {
            res.status(404).json({ status: 'failed', message: 'no showtime is deleted. ' });
        }
    } catch (err) {
        console.error(err);
        console.log('failed to delete showtime');
        res.status(400).json({ status: 'failed', message: 'failed to delete showtime' });
    }
});

route.post('/update/add/:name/:id/:mode', form.none(), async (req, res) => {
    try {
        //console.log(req.body);
        const datetime = req.body.showtime;
        const day = datetime.slice(8, 10);
        const month = datetime.slice(5, 7);
        const year = datetime.slice(0, 4);
        const time = datetime.slice(-5);
        const showtime = year + '/' + month + '/' + day + ' ' + time;
        const runtime = Number(req.body.runtime);
        const theater = Number(req.body['theater-no']);
        const language = req.body.language;
        const version = req.body.version;
        //console.log(showtime);

        let movie_id = null;
        if (req.params.mode == 'edit') {
            movie_id = req.params.id;
        }

        const collision = await check_collision(showtime, runtime, theater, movie_id); //check collision
        console.log('Time Collision: ' + collision);

        if (!collision) {
            //add showtime
            const result = await update_showtime(
                req.body.moviename,
                showtime,
                runtime,
                theater,
                language,
                version,
                movie_id
            );
            if (result) {
                res.json({ status: 'success', message: 'updated successfully' });
            } else {
                res.status(400).json({ status: 'failed', message: 'failed to add/update event' });
                console.log('failed to add/update event');
            }
        } else {
            res.status(400).json({ status: 'failed', message: 'failed to add/update event due to time collision' });
            console.log('failed to add/update event due to time collision');
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'failed', message: 'failed to add/update event' });
    }
});

route.get('/seat', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/seat_admin.html'));
});

route.post('/seat', async (req, res) => {
    try {
        const theater = await fetch_theater();
        const movie = await fetch_movie('', true);
        res.json({ status: 'success', data: { movie: movie, theater: theater } });
    } catch (err) {
        console.log('Failed to fetch theater data');
        console.error(err);
    }
});

route.post('/seatUpdate', async (req, res) => {
    try {
        const { cinema, row, column, price_cate1, price_cate2 } = req.body;
        console.log(req.body);
        var result;
        if (cinema != 'new') {
            result = await update_theater(cinema, row, column, price_cate1, price_cate2);
        } else {
            result = await create_theater(row, column, price_cate1, price_cate2);
        }
        if (result) {
            res.json({ status: 'success', message: 'update successfully' });
        } else {
            res.json({ status: 'failed', message: 'update failed' });
        }
    } catch (err) {
        //
        res.status(400).json({ status: 'failed', message: 'update failed' });
    }
});

route.post('/seatCateUpdate', async (req, res) => {
    try {
        const { cinema, seat_cate2 } = req.body;
        const result = await update_seatCategory(cinema, seat_cate2);
        if (result) {
            res.json({ status: 'success', message: 'update successfully' });
        } else {
            res.json({ status: 'failed', message: 'update failed' });
        }
    } catch (err) {
        res.status(400).json({ status: 'failed', message: 'update failed' });
    }
});

route.get('/edit/:name', async (req, res) => {
    res.sendFile(path.join(__dirname, '../static/edit_admin.html'));
});

route.post('/moviedata/edit/:name', async (req, res) => {
    try {
        const movie = await fetch_movieData(req.params.name);
        if (!movie) {
            console.log('no moviedata was found');

            res.status(404).json({ status: 'failed', message: 'no moviedata was found' });
        } else {
            res.json(movie);
        }
    } catch (err) {
        console.error(err);
        console.log('unexcepted error');
        res.status(404).json({ status: 'failed', message: 'unexpected error' });
    }
});

route.post('/edit/update', form.any(), async (req, res) => {
    try {
        //console.log(req.body);

        const { movie_name, movie_type, description, trailer, original_name, original_img } = req.body;
        const exist = await check_exist(original_name);
        console.log('Exist?');
        console.log(exist);
        if (exist) {
            const file = req.files[0];
            var image;
            if (file) {
                //an image file is uploaded
                image = 'assets/' + file.filename;
            } else {
                image = original_img;
            }
            const result_moviedata = await updateMovieData(
                movie_name,
                movie_type,
                description,
                trailer,
                image,
                original_name
            );
            if (result_moviedata) {
                const updated_showtime = await update_allShowtime(movie_name, original_name);
                res.json({
                    status: 'success',
                    message: 'moviedata updated successfully. \nshowtime updated: ' + updated_showtime.modifiedCount,
                });
                res.end();
            } else {
                res.status(400).json({ status: 'failed', message: 'failed to update moviedata' });
                res.end();
            }
        } else {
            res.status(404).json({ status: 'failed', message: 'no moviedata was found' });
        }
    } catch (err) {
        res.status(400).json({ status: 'failed', message: 'unexpected error' });
        console.error(err);
    }
});

route.post('/movie/showtime/:name', async (req, res) => {
    try {
        const movie = await fetch_movie(req.params.name, true);
        if (!movie) {
            res.status(404).json({ message: 'no showtime is found' });
        } else {
            res.json(movie);
        }
    } catch (err) {
        console.error(err);
        console.log('failed to load showtime');
        res.status(404).json({ message: 'failed to load showtime' });
    }
});

route.post('/userinfo', async (req, res) => {
    try {
        const user = await fetch_user(req.body.username);
        res.json(user);
    } catch (err) {
        console.error(err);
        console.log('Failed to load user img');
        res.status(404).json({ status: 'failed', message: 'failed to load user image' });
    }
});

route.post('/loadTransactionHistory', async (req, res) => {
    try {
        const movie = await fetch_movie('', false, req.body.movie_id);

        let usernames = [];
        if (movie.bookedSeat) {
            movie.bookedSeat.forEach(function (record) {
                for (let seat_no in record) {
                    usernames.push(record[seat_no]);
                    //console.log(record[seat_no]);
                }
            });
        }
        usernames = Array.from(new Set(usernames));

        var users = [];
        for (let i = 0; i < usernames.length; i++) {
            const user = await fetch_user(usernames[i]);
            //console.log(user);
            users.push(user);
        }
        console.log('users: ');
        console.log(users.length);

        res.json(users);
    } catch (err) {
        console.error(err);
        console.log('Failed to load transaction history');
        res.status(404).json({ status: 'failed', message: 'failed to load transaction history' });
    }
});

export default route;
