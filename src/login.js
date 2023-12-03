//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
import { Router } from 'express';
import fs from 'fs/promises';
import client from './dbclient.js';
import multer from 'multer';
import { ObjectId } from 'mongodb';
import bodyParser from 'body-parser';
import {
    validate_user,
    update_user,
    fetch_user,
    username_exist,
    update_transactionRecord,
    update_user_pw,
} from './userdb.js';
import { fetch_movie, addNewMovie, check_exist } from './moviedb.js';
import crypto from 'crypto';

const route = Router();
const form = multer();

route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));
const salt = 'f963ae68e579755e';

route.post('/login', form.none(), async (req, res) => {
    req.session.logged = false;
    const un = req.body.username;
    const pw = req.body.password;
    //encrypt password by using crypto hash
    const hash = crypto.pbkdf2Sync(pw, salt, 1000, 64, 'sha512').toString('hex');
    const remember = req.body.remember;
    const user = await validate_user(un, hash);
    if (!user) {
        //incorrect username or password
        res.status(401).json({
            status: 'failed',
            message: 'Incorrect username and password',
        });
    } else {
        //user is valid
        if (user.enabled == false) {
            res.status(401).json({
                status: 'failed',
                message: `User \`${user.username}\` is currently disabled`,
            });
        } else {
            //console.log(user);
            req.session.username = user.username;
            req.session.role = user.role;
            req.session.logged = true;
            req.session.currentTimestamp = Date.now();
            req.session._id = user._id;
            //generate 16 bytes random string
            var access_token = '';
            for (let i = 0; i < 16; i++) {
                access_token += Math.floor(Math.random() * 16).toString(16);
            }
            //find user by user._id and update
            const users = await client.db('GP4432db').collection('users');
            //update access token to user
            await users.updateOne(
                { _id: user._id },
                {
                    $set: {
                        access_token: access_token,
                    },
                }
            );
            if (remember) {
                req.session.cookie = { originalMaxAge: 365 * 24 * 60 * 60 * 1000 }; //1 year
            } else {
                req.session.cookie = { originalMaxAge: 5 * 60 * 1000 }; //5 minutes
            }

            res.json({
                status: 'success',
                user: {
                    username: user.username,
                    role: user.role,
                    access_token: access_token,
                },
            });
        }
    }
});

route.post('/logout', (req, res) => {
    if (req.session.logged) {
        req.session.destroy();
        res.end();
        //console.log("Logout")
    } else {
        res.status(401).json({
            status: 'failed',
            message: 'Unauthorized',
        });
    }
});

route.get('/me', async (req, res) => {
    console.log(req.session);
    if (req.session?.logged) {
        const user = await fetch_user(req.session.username);
        //console.log(user);
        res.json({
            status: 'success',
            user: {
                username: user.username,
                avatar: user.avatar,
                password: user.password,
                nickname: user.nickname,
                gender: user.gender,
                birthday: user.birthday,
                email: user.email,
                role: user.role,
                transactionHistory: user.transactionHistory,
            },
        });
    } else {
        res.status(401).json({
            status: 'failed',
            message: 'Unauthorized',
        });
    }
});

const validateUserByToken = async (_id, token) => {
    try {
        const users = await client.db('GP4432db').collection('users');
        const user = await users.findOne({ _id: new ObjectId(_id), access_token: token });
        //console.log(user);
        if (!user) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
    }
};

route.get('/validation', async (req, res) => {
    try {
        res.send(await validateUserByToken(req.session._id, req.query.access_token));
    } catch (err) {
        console.log(err);
    }
});

route.post('/update_user', async (req, res) => {
    try {
        const { avatar, username, nickname, password, email, birthday, gender, enabled } = req.body;
        const users = await client.db('GP4432db').collection('users');
        const user = await users.findOne({ username: username, password: password });
        if (user) {
            await update_user_pw(username, password, nickname, email, gender, birthday, avatar, enabled);
        } else {
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            await update_user(username, hash, nickname, email, gender, birthday, avatar, enabled);
        }

        console.log(req.body);
        res.json({
            status: 'success',
            message: 'Finish Your Update',
        });
    } catch (err) {
        console.log(err);
    }
});

route.post('/del_ac', async (req, res) => {
    try {
        const { avatar, username, nickname, password, email, birthday, gender, enabled } = req.body;
        const users = await client.db('GP4432db').collection('users');
        await users.findOneAndDelete({ username });
        res.json({
            status: 'success',
            message: 'Finish Your Removing',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred',
        });
    }
});

route.get('/history', async (req, res) => {
    try {
        const user = await fetch_user(req.session.username);

        var movies = [];
        for (let i = 0; i < user.transactionHistory.length; i++) {
            const movieId = user.transactionHistory[i].movie_id;
            const movie = await fetch_movie(null, null, movieId);
            movies.push(movie);
            console.log(movie);
        }

        res.json({
            status: 'success',
            user: {
                username: user.username,
                transactionHistory: user.transactionHistory,
                movies: movies,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Unable to fetch transaction history' });
    }
});

route.post('/forget', async (req, res) => {
    const { username, password, email } = req.body;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    try {
        const users = await client.db('GP4432db').collection('users');
        const user = await users.findOne({ username: username, email: email });
        if (!user) {
            res.status(500).json({
                status: 'failed',
                error: 'Unable to reset your password!',
            });
            return false;
        } else {
            await update_user(
                username,
                hash,
                user.nickname,
                user.email,
                user.gender,
                user.birthday,
                user.avatar,
                user.enabled
            );
            res.json({
                status: 'success',
                message: 'Finish Your Reset',
            });
        }
    } catch (err) {
        console.log(err);
    }
});

route.post('/register', form.none(), async (req, res) => {
    const username = req.body.username;
    const pw = req.body.password;
    const hash = crypto.pbkdf2Sync(pw, salt, 1000, 64, 'sha512').toString('hex');
    const nickname = req.body.nickname;
    const email = req.body.email;
    const gender = req.body.gender;
    const birthday = req.body.birthday;
    const avatar = req.body.avatar;
    const role = req.body.role;
    console.log(role);
    try {
        if (!username || !pw) {
            res.status(400).json({ status: 'failed', message: 'Missing fields' });
        } else {
            var valid = true;
            var msg = '';
            if (username.length < 3) {
                valid = false;
                msg = 'Username must be at least 3 characters';
            } else if (await username_exist(username)) {
                valid = false;
                msg = `Username ${username} already exists`;
            } else if (pw.length < 8) {
                valid = false;
                msg = 'Password must be at least 8 characters';
            }

            if (!valid) {
                res.status(400).json({ status: 'failed', message: msg });
            } else {
                //valid
                const success = await update_user(
                    username,
                    hash,
                    nickname,
                    email,
                    gender,
                    birthday,
                    avatar,
                    role,
                    true
                );
                if (success) {
                    res.json({
                        status: 'success',
                        user: {
                            username: `${username}`,
                        },
                    });
                } else {
                    res.status(500).json({
                        status: 'failed',
                        message: 'Account created but unable to save into the database',
                    });
                }
            }
        }
    } catch (err) {
        console.log('Error occured when post /register');
    }
});

export default route;
