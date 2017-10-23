// load express and input votes into db
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const promise = require('bluebird');
const options = {promiseLib: promise};
const pg = require("pg-promise")(options);
const connectionString = "postgres://localhost:5432/nobs_db";
const db = pg(connectionString);

const redis = require('redis');
const client = redis.createClient();

client.on('error', function (err) {
    console.log("Error " + err);
});

const {isURL, isBoolean} = require('validator');

const app = express();

// allow CORS access
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Content-Type", "application/json");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// create POSTGRES tables if none exists
db.tx(function () {
    return this.batch([

        // create a PAGES table
        this.none(`CREATE TABLE IF NOT EXISTS pages (
            page_id SERIAL PRIMARY KEY, 
            url TEXT UNIQUE
        )`),

        // create a VOTES table
        this.none(`CREATE TABLE IF NOT EXISTS votes (
            ip_address INET not null, 
            page_id BIGINT not null REFERENCES pages ON DELETE CASCADE, 
            vote BOOLEAN,
            UNIQUE (ip_address, page_id)
        )`)
    ]);
})
    .then(function () {
        console.log('created PAGES');
        console.log('created VOTES');
    })
    .catch(function (error) {
        console.log(error);
    });

// GET to retrieve vote history from database
app.get('/votes', function (req, res) {

    let page = req.query.url;

    // discard query string
    page = (page.includes("?") ? page.split("?")[0] : page);
    // throw error if not valid url
    if (!isURL(page, {
            require_protocol: true,
            protocols: ['http', 'https'],
            require_valid_protocol: true
        })) {
        res.status(400).send({error: "None shall pass - not a valid url"});
        return;
    }

    // retrieve a count of true and false votes for the current page
    db.any(`SELECT vote, count(*)::INT FROM pages 
        LEFT JOIN votes ON votes.page_id = pages.page_id 
        WHERE url = $1 
        GROUP BY vote
        ORDER BY vote ASC;`, page)
        .then(function (countRetrieved) {

            // count the true and false votes, if any
            console.log('DATA:', countRetrieved);
            let trueCount = countRetrieved[0] ? countRetrieved[0].count : 0;
            let falseCount = countRetrieved[1] ? countRetrieved[1].count : 0;
            let allCount = trueCount + falseCount;

            // return the calculated score of truthfulness
            res.send({
                success: true,
                score: allCount ? trueCount / allCount : null
            });
        })
        .catch(function (error) {
            console.log('ERROR:', error);
            res.status(400).send({
                error: 'None shall pass - No votes counted',
                message: error
            });
        });


});

function rateLimitCheck(ip, callback) {

    // use redis client to rate limit votes to database associated to the ip address from our redis cache
    client.get(ip, function (error, result) {

        // if the ip exists in redis cache, increment the counter and check if rate limit is exceeded
        if (result) {
            client.incr(ip, function (err, reply) {
                if (reply >= 10) {
                    return ({error: "Too many requests"});
                } else {
                    callback();
                }
            });
        } else {
            // store the key-value pair in redis cache with a TTL of 6 minutes (3600s0
            client.setex(ip, 3600, 1);
            callback();
        }
    });
}

// POST to enter vote info into nobs db
app.post('/vote', function (req, res) {

    let page = req.body.url;
    let vote = req.body.vote;
    // let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ip = req.ip;

    // discard query string
    if (page) {
        page = page.includes("?") ? page.split("?")[0] : page;
        // throw error if page is not valid url
        if (!isURL(page, {
                require_protocol: true,
                protocols: ['http', 'https'],
                require_valid_protocol: true
            })) {
            res.status(400).send({error: "None shall pass - not a valid url"});
            return;
        }
    }

    // throw error if vote is not a boolean
    // if (!isBoolean(String(vote))) {
    if (![true, false].includes(vote)) {
        res.status(400).send({error: "None shall pass - not a boolean"});
        return;
    }

    // check requests completed from this ip within the last 6 minutes before posting vote to database
    rateLimitCheck(ip, function () {

        db.one(`INSERT INTO pages (url) 
            VALUES ($1) 
            ON CONFLICT (url) DO UPDATE SET url=EXCLUDED.url 
            RETURNING page_id;`, page)
            .then(function (pageResult) {
                console.log('PAGE DATA:', pageResult);
                db.one(`INSERT INTO votes (ip_address, page_id, vote) 
                    VALUES ($1, $2, $3) 
                    ON CONFLICT (ip_address, page_id) DO UPDATE SET vote=$3 
                    RETURNING ip_address;`, [ip, pageResult.page_id, vote])
                    .then(function (voteResult) {
                        console.log('DATA:', voteResult);
                        res.send({
                            success: true,
                            data: voteResult
                        });
                    })
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
    })
    .catch(function (error) {
        console.log('ERROR:', error);
        res.status(429).send({
            error: 'None shall pass - rate limit exceeded',
            message: error
        });
    });
});

app.listen(process.env.PORT || 4800);
