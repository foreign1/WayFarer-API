const express = require('express');
const debug = require('debug');
const usersRouter = require('./routes/users');
const tripRouter = require('./routes/trips');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const router = express.Router();

app.use('/api/v1', usersRouter(router));
app.use('/api/v1', tripRouter(router));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => debug('dev')(`Listening on port ${port}...`));

module.exports = server;
