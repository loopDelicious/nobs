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
        this.none("CREATE TABLE IF NOT EXISTS pages (page_id SERIAL PRIMARY KEY, url TEXT UNIQUE)"),
        this.none("CREATE TABLE IF NOT EXISTS votes (ip_address INET not null PRIMARY KEY, page_id BIGINT not null REFERENCES pages ON DELETE CASCADE, vote BOOLEAN)")
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

    let page = req.query.url;

    db.one("SELECT count(*) FROM pages LEFT JOIN votes ON votes.page_id = pages.page_id WHERE url = '$1' GROUP BY vote;", page)
        .then(function (data) {
            console.log('DATA:', data.value);
            res.send('success');
        })
        .catch(function (error) {
            console.log('ERROR:', error);
            res.status(400).send({
                error: 'None shall pass - No votes counted',
                message: error
            });
        })
});

// POST to enter vote info into nobs db
app.post('/votes', function (req, res) {

    let page = req.query.url;
    let vote = req.query.vote;
    let ip = req.query.ip;

    console.log(page, vote, ip);

    db.one("INSERT INTO pages (url) VALUES ($1) ON CONFLICT (url) DO UPDATE SET url=EXCLUDED.url RETURNING page_id;", page)
        .then(function (pageResult) {
            console.log('PAGE DATA:', pageResult);
            res.send({
                success: true,
                data: pageResult
            });
            console.log(pageResult.page_id);
            console.log(typeof(pageResult.page_id));
            db.one("INSERT INTO votes (ip_address, page_id, vote) VALUES ($1, $2, $3) RETURNING ip_address;", [ip, 16, vote])
                .then(function (voteResult) {
                    console.log('DATA:', voteResult);
                    res.send({
                        success: true,
                        data: voteResult
                    });                })
                .catch(function (error) {
                    console.log('ERROR:', error);
                    res.status(400).send({
                        error: 'None shall pass - INSERT into votes',
                        message: error
                    });
                });
        })
        .catch(function (error) {
            console.log('ERROR:', error);
            res.status(400).send({
                error: 'None shall pass - INSERT into pages',
                message: error
            });
        });
});

app.listen(process.env.PORT || 4800);
