//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

import fs from 'fs/promises';
import client from './dbclient.js';
import mongoose from 'mongoose';

async function create_theater(row, column, price_cate1, price_cate2) {
    try {
        const theaters = await client.db('GP4432db').collection('theaters');

        await theaters.insertOne({
            cinema: Number((await theaters.countDocuments()) + 1),
            column: Number(column),
            row: Number(row),
            price_cate1: Number(price_cate1),
            price_cate2: Number(price_cate2),
            seat_cate2: [],
        });
        return true;
    } catch (err) {
        console.log('Failed to update theater data');
        console.error(err);
    }
    //    { "cinema": 3, "column": 10, "row": 4, "price_cate1": 80, "price_cate2": 100, "seat_cate2": ["A06", "B08"] }
}

async function update_theater(cinema, row, column, price_cate1, price_cate2) {
    try {
        const theaters = await client.db('GP4432db').collection('theaters');
        await theaters.updateOne(
            { cinema: Number(cinema) },
            {
                $set: {
                    column: Number(column),
                    row: Number(row),
                    price_cate1: Number(price_cate1),
                    price_cate2: Number(price_cate2),
                },
            }
        );
        return true;
    } catch (err) {
        console.log('Failed to update theater data');
        console.error(err);
    }
}

async function update_seatCategory(cinema, seat_cate2) {
    try {
        const theaters = await client.db('GP4432db').collection('theaters');
        await theaters.updateOne(
            { cinema: Number(cinema) },
            {
                $set: {
                    seat_cate2: seat_cate2,
                },
            }
        );
        return true;
    } catch (err) {
        console.log('Failed to update theater data');
        console.error(err);
    }
}

async function fetch_theater(cinema) {
    //return all or one theater data
    try {
        const theaters = await client.db('GP4432db').collection('theaters');
        if (!cinema) {
            return await theaters.find({}).sort({ cinema: 1 }).toArray();
        } else {
            console.log(cinema);
            return await theaters.findOne({ cinema: cinema });
        }
    } catch (err) {
        console.log('Unable to fetch the database!');
        console.error(err);
    }
}

async function init_theaterdb() {
    try {
        //                                          table
        const theaters = await client.db('GP4432db').collection('theaters');

        if ((await theaters.countDocuments()) == 0) {
            const data = await fs.readFile('theater.json', 'utf-8');
            const theater_info = JSON.parse(data);
            const result = await theaters.insertMany(theater_info);
            console.log('Added ' + result.insertedCount + ' theaters');
        }
    } catch (err) {
        console.log('Unable to initialize the database!');
        console.error(err);
    }
}

init_theaterdb().catch(console.dir);

export { fetch_theater, update_theater, update_seatCategory, create_theater };
