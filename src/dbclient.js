//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';

const connect_uri = config.CONNECTION_STR;
const client = new MongoClient(connect_uri, {
   connectTimeoutMS: 2000,
   serverSelectionTimeoutMS: 2000,
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

let current = new Date();
let cDate = current.getMonth() + 1 + '/' + current.getDate() + '/' + current.getFullYear();
let cHour = current.getHours();
let ampm = cHour >= 12 ? 'PM' : 'AM';
cHour = cHour % 12;
let cTime = cHour + ':' + current.getMinutes() + ':' + current.getSeconds() + ' ' + ampm;
let dateTime = cDate + ', ' + cTime;

async function connect() {
   try {
      // TODO
      await client.connect();
      await client.db('GP4432db').command({ ping: 1 });
      console.log(dateTime);
      //console.log("Server started at http://127.0.0.1:8080");
      console.log('Successfully connected to the database!');
   } catch (err) {
      // TODO
      console.log('Unable to establish connect to the database!');
      process.exit(1);
   }
}
connect().catch(console.dir);

export default client;
