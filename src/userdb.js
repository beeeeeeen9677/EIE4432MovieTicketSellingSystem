//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

import fs from 'fs/promises';
import client from './dbclient.js';
import crypto from 'crypto';
const salt = 'f963ae68e579755e';
async function validate_user(username, password) {
    if (!username || !password) {
        //empty
        return false;
    }
    try {
        const users = await client.db('GP4432db').collection('users');
        const user = await users.findOne({ username: username, password: password });
        if (!user) {
            return false;
        } else {
            return user;
        }
    } catch (err) {
        console.log('Unable to fetch from database!');
        console.log(err);
    }
}

async function update_transactionRecord(transaction_id, username, movie_id, price, seat) {
    try {
        const users = await client.db('GP4432db').collection('users');
        var user = await users.findOne({ username: username });
        console.log(user);
        var transactionHistory = user.transactionHistory;
        //console.log(transactionHistory);
        if (transactionHistory) {
            //exist
            transactionHistory.push({
                transaction_id: transaction_id,
                movie_id: movie_id,
                price: price,
                seat: seat,
                date: new Date(),
            });
        } else {
            transactionHistory = [];
            transactionHistory.push({
                transaction_id: transaction_id,
                movie_id: movie_id,
                price: price,
                seat: seat,
                date: new Date(),
            });
        }

        const result = await users.updateOne(
            { username: username },
            {
                $set: {
                    transactionHistory: transactionHistory,
                },
            }
        );

        //console.log(result);

        console.log('Added 1 transaction record for user' + username);

        return true;
    } catch (err) {
        console.log('Unable to update the transaction record!');
        console.error(err);
    }
}

async function update_user_pw(username, password, nickname, email, gender, birthday, avatar, role, enabled) {
    try {
        const users = await client.db('GP4432db').collection('users');
        console.log(role + '123');
        const result = await users.updateOne(
            { username: username, password: password },
            {
                $set: {
                    nickname: nickname,
                    email: email,
                    gender: gender,
                    birthday: birthday,
                    avatar: avatar,
                    role: 'user',
                    enabled: true,
                },
            },
            { upsert: true }
        );

        //console.log(result);

        console.log('Added ' + result.upsertedCount + ' users');

        return true;
    } catch (err) {
        console.log('Unable to update the database!');
    }
}

async function update_user(username, password, nickname, email, gender, birthday, avatar, role, enabled) {
    try {
        const users = await client.db('GP4432db').collection('users');
        console.log(role + '123');
        const result = await users.updateOne(
            { username: username },
            {
                $set: {
                    password: password,
                    nickname: nickname,
                    email: email,
                    gender: gender,
                    birthday: birthday,
                    avatar: avatar,
                    role: 'user',
                    enabled: true,
                },
            },
            { upsert: true }
        );

        //console.log(result);

        console.log('Added ' + result.upsertedCount + ' users');

        return true;
    } catch (err) {
        console.log('Unable to update the database!');
    }
}

async function fetch_user(username) {
    try {
        const users = await client.db('GP4432db').collection('users');
        const user = await users.findOne({ username: username });
        return user;
    } catch (err) {
        console.log('Unable to fetch from database!');
    }
}

async function username_exist(username) {
    try {
        if (await fetch_user(username)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log('Unable to fetch from database!');
    }
}

async function init_db() {
    try {
        //                                         table
        const users = await client.db('GP4432db').collection('users');
        //console.log(await users.countDocuments());
        if ((await users.countDocuments()) == 0) {
            const data = await fs.readFile('user.json', 'utf-8');
            const user_info = JSON.parse(data);
            const result = await users.insertMany(user_info);
            console.log('Added ' + result.insertedCount + ' user');
        }

        const movies = await client.db('GP4432db').collection('movie');
    } catch (err) {
        console.log('Unable to initialize the database!');
    }
}

init_db().catch(console.dir);

export { validate_user, update_user, fetch_user, username_exist, update_transactionRecord, update_user_pw };
