import express from 'express';
import debug from 'debug';
import usersRouter from './routes/users';
import tripRouter from './routes/trips';
import bookingRouter from './routes/bookings';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const router = express.Router();

app.use('/api/v1', usersRouter(router));
app.use('/api/v1', tripRouter(router));
app.use('/api/v1', bookingRouter(router));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => debug('dev')(`Listening on port ${port}...`));

export default server;
