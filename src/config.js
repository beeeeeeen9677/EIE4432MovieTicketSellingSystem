//LAU Ying Pan 21019528D Siu Kai Dick 21015057d
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CONNECTION_STR) {
   //undefined
   console.log('CONNECT_STR is not defined');
   process.exit(1);
}
export default { CONNECTION_STR: process.env.CONNECTION_STR };
