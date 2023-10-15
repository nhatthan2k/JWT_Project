const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const db = require('../backend/src/config/db');
const route = require('./src/route');

dotenv.config()
// setup
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// connect
db.connect();

// route
route(app);

app.listen(8000, () => {
    console.log('server is running ...');
})