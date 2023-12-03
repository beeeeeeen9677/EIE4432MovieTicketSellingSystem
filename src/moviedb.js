//LAU Ying Pan 21019528D Siu Kai Dick 21015057d

import fs from 'fs/promises';
import client from './dbclient.js';
import mongoose from 'mongoose';

//movies_data

async function addNewMovie(name, type, description, trailer, image) {
    //add to movies_data
    try {
        const movies_data = await client.db('GP4432db').collection('movies_data');

        await movies_data.insertOne({
            name: name,
            type: type,
            description: description,
            trailer: trailer,
            image: image,
        });

        return true;
    } catch (err) {
        console.log('Unable to update database!');
        console.log(err);
        return false;
    }
}

async function updateMovieData(newName, type, description, trailer, image, oldName) {
    //update movies_data
    try {
        const movies_data = await client.db('GP4432db').collection('movies_data');

        await movies_data.updateOne(
            { name: oldName },
            {
                $set: {
                    name: newName,
                    type: type,
                    description: description,
                    trailer: trailer,
                    image: image,
                },
            }
        );

        return true;
    } catch (err) {
        console.log('Unable to update database!');
        console.log(err);
        return false;
    }
}

async function fetch_movieData(moviename) {
    try {
        const movies_data = await client.db('GP4432db').collection('movies_data');

        var movie = false;

        if (!moviename) {
            //find all
            movie = await movies_data.find({});
            movie = movie.toArray();
        } else {
            movie = await movies_data.findOne({ name: moviename });
        }

        return movie;
    } catch (err) {
        console.log('Unable to fetch movie data from database!');
        console.log(err);
        return false;
    }
}

async function check_exist(moviename) {
    try {
        const movies_data = await client.db('GP4432db').collection('movies_data');
        var movie = false;
        movie = await movies_data.findOne({ name: moviename });
        return movie;
    } catch (err) {
        console.log('Unable to fetch movie data from database!');
        console.log(err);
    }
}

const fetch_movie_type = async () => {
    try {
        const movies_data = await client.db('GP4432db').collection('movies_data');
        const type = await movies_data.aggregate([{ $group: { _id: '$type' } }]).toArray();
        return type.map((t) => t._id);
    } catch (err) {
        console.log('Unable to fetch movie type from database!');
        console.log(err);
    }
};

//movies
async function update_allShowtime(newName, oldName) {
    //update existing showtime data
    try {
        const movies = await client.db('GP4432db').collection('movies'); //showtime
        const movie = await fetch_movieData(newName); //movie_data
        //console.log('fetched data:');
        //console.log(movie);
        const result = await movies.updateMany(
            { name: oldName },
            {
                $set: {
                    name: movie.name,
                    type: movie.type,
                    image: movie.image,
                },
            }
        );
        //console.log(result);

        return result;
    } catch (err) {
        console.log('Failed to add/update showtime');
        console.error(err);

        return false;
    }
}

async function deleteShowtime(movie_id) {
    try {
        const movies = await client.db('GP4432db').collection('movies');
        const result = await movies.deleteOne({ _id: new mongoose.Types.ObjectId(movie_id) });
        return result.deletedCount;
    } catch (err) {
        console.error(err);
        console.log('failed to delete showtime');
        return false;
    }
}

async function update_showtime(moviename, showtime, runtime, theater, language, version, id) {
    //do not provide id to add new showtime / provide id to edit existing showtime
    try {
        const movies = await client.db('GP4432db').collection('movies');
        const movie = await fetch_movieData(moviename);
        //console.log('fetched data:');
        //console.log(movie);

        let result;

        if (!id) {
            result = await movies.updateOne(
                { _id: new mongoose.Types.ObjectId(id) },
                {
                    $set: {
                        name: movie.name,
                        type: movie.type,
                        bookedSeat: [], //add empty array only if create new showtime
                        showtime: showtime,
                        RunTime: Number(runtime),
                        cinema: Number(theater),
                        language: language,
                        version: version,
                        image: movie.image,
                    },
                },
                { upsert: true }
            );
        } else {
            result = await movies.updateOne(
                { _id: new mongoose.Types.ObjectId(id) },
                {
                    $set: {
                        name: movie.name,
                        type: movie.type,
                        showtime: showtime,
                        RunTime: Number(runtime),
                        cinema: Number(theater),
                        language: language,
                        version: version,
                        image: movie.image,
                    },
                }
            );
        }

        if (!id) {
            //add new
            if (result.upsertedCount == 1) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    } catch (err) {
        console.log('Failed to add/update showtime');
        console.error(err);

        return false;
    }
}

async function check_collision(showtime, runtime, theater, movie_id) {
    //check time collision before adding a showtime of movie
    try {
        var day = showtime.slice(8, 10);
        var month = showtime.slice(5, 7);
        var year = showtime.slice(0, 4);
        var hr = showtime.slice(-5, -3);
        var min = showtime.slice(-2);

        //create a Date object for start time and end time
        const newStart = new Date(year, month, day, hr, min, 0);
        const newEnd = new Date(newStart.getTime() + runtime * 60000);

        console.log('new start: ' + newStart);
        console.log('new end: ' + newEnd);

        const movies = await client.db('GP4432db').collection('movies');
        const movie_list = await movies.find({ cinema: theater }).toArray();

        var collision = false;

        movie_list.forEach(function (movie) {
            if (movie._id == movie_id) {
                //for edit existing showtime, skip checking with itself
                console.log('skip checking');
                return;
            }

            var day = movie.showtime.slice(8, 10);
            var month = movie.showtime.slice(5, 7);
            var year = movie.showtime.slice(0, 4);
            var hr = movie.showtime.slice(-5, -3);
            var min = movie.showtime.slice(-2);

            //create a Date object for start time and end time
            const existStart = new Date(year, month, day, hr, min, 0);
            const existEnd = new Date(existStart.getTime() + movie.RunTime * 60000);

            //console.log('exist start: ' + existStart);
            //console.log('exist end: ' + existEnd);

            //check collision
            if (existStart.getTime() <= newStart.getTime() && newStart.getTime() < existEnd.getTime()) {
                //console.log('time collison');
                collision = true;
            }
            if (existStart.getTime() <= newEnd.getTime() && newEnd.getTime() < existEnd.getTime()) {
                //console.log('time collison');
                collision = true;
            }

            if (newStart.getTime() <= existStart.getTime() && existStart.getTime() < newEnd.getTime()) {
                //console.log('time collison');
                collision = true;
            }
            if (newStart.getTime() <= existEnd.getTime() && existEnd.getTime() < newEnd.getTime()) {
                //console.log('time collison');
                collision = true;
            }
        });

        return collision; //no collision
    } catch (err) {
        console.log('Unable to check time collision');
        console.error(err);
        return true;
    }
}

async function purchaseUpdateSeat(username, id, seat) {
    try {
        const movies = await client.db('GP4432db').collection('movies');
        var movie = await movies.findOne({ _id: new mongoose.Types.ObjectId(id) });
        var bookedSeat = movie.bookedSeat;
        for (let s of seat) {
            bookedSeat.push({ [s]: username });
        }
        const result = await movies.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    bookedSeat: bookedSeat,
                },
            }
        );
        //movie = await movies.findOne({_id: new mongoose.Types.ObjectId(id)});
        //console.log(movie.bookedSeat);
        return true;
    } catch (err) {
        console.log('Unable to update database!');
        console.log(err);
        return false;
    }
}

async function fetch_movie(moviename, all, id) {
    //reutrn an (array of) objects, bool: all, string: id
    try {
        const movies = await client.db('GP4432db').collection('movies');
        var movie = false;
        if (!id) {
            // if id is not provided
            if (all) {
                //find all?
                if (moviename) {
                    movie = await movies.find({ name: moviename }).sort({ showtime: 1, name: 1, cinema: 1 });
                } else {
                    movie = await movies.find().sort({ showtime: 1, name: 1, cinema: 1 }); //find all
                }
                movie = movie.toArray();
            } else {
                movie = await movies.findOne({ name: moviename });
            }
        } else {
            //fetch by id
            movie = await movies.findOne({ _id: new mongoose.Types.ObjectId(id) });
        }
        return movie;
    } catch (err) {
        console.log('Unable to fetch movie data from database!');
        console.log(err);
    }
}

const fetch_type = async () => {
    try {
        const movies = await client.db('GP4432db').collection('movies');
        const type = await movies.aggregate([{ $group: { _id: '$type' } }]).toArray();
        return type.map((t) => t._id);
    } catch (err) {
        console.log('Unable to fetch movie type from database!');
        console.log(err);
    }
};

async function init_moviedb() {
    try {
        //                                          table
        const movies = await client.db('GP4432db').collection('movies');

        if ((await movies.countDocuments()) == 0) {
            const data = await fs.readFile('static/assets/indexinf.json', 'utf-8');
            const movie_info = JSON.parse(data);
            const result = await movies.insertMany(movie_info);
            console.log('Added ' + result.insertedCount + ' movies');
        }

        const movies_data = await client.db('GP4432db').collection('movies_data');

        if ((await movies_data.countDocuments()) == 0) {
            const data = await fs.readFile('movie_description.json', 'utf-8');
            const movie_info = JSON.parse(data);
            const result = await movies_data.insertMany(movie_info);
            console.log('Added ' + result.insertedCount + ' movie data');
        }
    } catch (err) {
        console.log('Unable to initialize the database!');
        console.error(err);
    }
}

init_moviedb().catch(console.dir);

export {
    fetch_movie,
    fetch_type,
    purchaseUpdateSeat,
    addNewMovie,
    check_exist,
    fetch_movieData,
    check_collision,
    update_showtime,
    fetch_movie_type,
    updateMovieData,
    update_allShowtime,
    deleteShowtime,
};
