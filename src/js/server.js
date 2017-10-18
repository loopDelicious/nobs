// load express and input votes into db
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const promise = require('bluebird');
const options = {promiseLib: promise};
const pg = require("pg-promise")(options);
const connectionString = "postgres://localhost:5432/nobs_db";
const db = pg(connectionString);

const app = express();

// allow CORS access
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Content-Type", "application/json");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create POSTGRES tables if none exists
db.tx(function () {
    return this.batch([
        this.none("CREATE TABLE IF NOT EXISTS pages (id SERIAL PRIMARY KEY, rootAndPath TEXT)"),
        this.none("CREATE TABLE IF NOT EXISTS votes (id SERIAL PRIMARY KEY, ipAddress VARCHAR(40) not null, vote BOOLEAN)")
    ]);
})
    .then(function () {
        console.log('created PAGES');
        console.log('created VOTES');
    })
    .catch(function (error) {
        console.log(error);
    });

// GET to retrieve vote info from nobs db
app.get('/votes', function (req, res) {


});

// POST to insert vote info into nobs db
app.post('/votes', function (req, res) {


});

app.listen(process.env.PORT || 4800);
