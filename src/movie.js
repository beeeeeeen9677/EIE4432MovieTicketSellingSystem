//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
import { Router } from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import { update_transactionRecord } from './userdb.js';
import { fetch_movie, fetch_type, purchaseUpdateSeat, fetch_movie_type, fetch_movieData } from './moviedb.js';
import { fetch_theater } from './theaterdb.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const route = Router();

const form = multer();
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));

route.get('/showtime/:name', async (req, res) => {
    res.sendFile(path.join(__dirname, '../static/showtime.html'));
});

route.post('/showtime/:name', async (req, res) => {
    console.log('post');
    try {
        const moviename = req.params.name;
        const movie = await fetch_movie(moviename, true);
        //console.log(movie);
        const img_src = movie[0].image;
        const runtime = movie[0]['RunTime'];
        const moviedata = await fetch_movieData(moviename);
        res.json({
            status: 'success',
            movie: {
                name: moviename,
                image: img_src,
                runtime: runtime,
                showtime: movie,
                description: moviedata.description,
                trailer: moviedata.trailer,
            },
        });
    } catch (err) {
        console.log('showtime.html: Error. Cannot fetch movie data. ');
        console.error(err);
    }
});

route.get('/ticket/:id', async (req, res) => {
    res.sendFile(path.join(__dirname, '../static/ticket.html'));
});

route.post('/ticket/:id', async (req, res) => {
    try {
        const movie = await fetch_movie('', false, req.params.id);
        const theater = await fetch_theater(movie.cinema);
        //console.log(movie);
        res.json({ status: 'success', data: { movie: movie, theater: theater } });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            status: 'failed',
            message: 'no movie is selected. ',
        });
    }
});

route.get('/payment', async (req, res) => {
    res.sendFile(path.join(__dirname, '../static/payment.html'));
});

route.post('/payment', form.none(), async (req, res) => {
    try {
        const movie_id = req.body.movie_id;
        const seat = req.body.seat;
        const price = req.body.price;
        req.session.movie_id = movie_id;
        req.session.seat = seat;
        req.session.price = price;
        /*
      console.log("session data:");
      console.log(req.session.movie_id);
      console.log(req.session.seat);
      console.log(req.session.price);
      */
        res.json({ status: 'success' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'failed', message: 'fail to go to payment' });
    }
});

route.post('/paymentDetails', form.none(), async (req, res) => {
    try {
        const movie_id = req.session.movie_id;
        const seat = req.session.seat;
        const price = req.session.price;
        req.session.movie_id = null;
        req.session.seat = null;
        req.session.price = null;
        /*
      console.log("details:");
      console.log(movie_id);
      console.log(seat);
      console.log(price);
      */
        const movie = await fetch_movie('', false, movie_id);
        res.json({
            status: 'success',
            details: {
                movie: movie,
                seat: seat,
                price: price,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: 'invalid request',
        });
        console.log('no payment details data is found');
    }
});

route.post('/payment/complete', form.none(), async (req, res) => {
    console.log('complete');
    try {
        console.log(req.body);
        const { username, movie_id, price, transaction_id } = req.body;
        console.log(username);
        //change JSON back to array
        const seat = JSON.parse(req.body.seat, (key, value) => {
            return typeof value === 'object' && value !== null ? Object.values(value) : value;
        });
        //console.log(seat);
        const trResult = await update_transactionRecord(transaction_id, username, movie_id, price, seat);
        const puResult = await purchaseUpdateSeat(username, movie_id, seat);
        if (trResult && puResult) {
            res.json({ status: 'success' });
        } else {
            res.status(400).json({ status: 'failed' });
        }
    } catch (err) {
        res.status(400).json({ status: 'failed', message: 'payment failed' });
        console.error(err);
    }
});

route.get('/type', async (req, res) => {
    try {
        const type = await fetch_type();
        res.json(type);
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'failed',
            message: 'no movie type is found. ',
        });
    }
});

route.get('/moviedata_type', async (req, res) => {
    try {
        const type = await fetch_movie_type();
        res.json(type);
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'failed',
            message: 'no movie type is found. ',
        });
    }
});

route.get('/theaterSeatNum', async (req, res) => {
    try {
        const theaters = await fetch_theater();
        let seatNum = {};
        theaters.forEach(function (theater) {
            seatNum[theater.cinema] = theater.row * theater.column;
        });
        console.log(seatNum);
        res.json(seatNum);
    } catch (err) {
        console.error(err);
        console.log('failed to fetch theater data');
        res.status(404).json({ status: 'failed', message: 'failed' });
    }
});

//load homepage
route.get('/homepage', async (req, res) => {
    const movies = await fetch_movie('', true); //get all
    //console.log(movies);
    var distinct = [];
    var output = [];
    movies.forEach(function (data) {
        //get distinct
        if (!distinct.includes(data.name)) {
            distinct.push(data.name);
            output.push(data);
        }
    });

    res.json(output);
});

export default route;
