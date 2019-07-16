const express = require('express');
const debug = require('debug');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const router = express.Router();

app.use('/api/v1', usersRouter(router));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => debug('dev')(`Listening on port ${port}...`));

module.exports = server;
