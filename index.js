const axios = require('axios');
const express = require('express');
const isDocker = require('is-docker');
const session = require('express-session');

const { api } = require('./config.json');

const app = express();

// configure consola
const { consola } = require('consola');
consola.wrapAll();

// configure express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/assets', express.static(__dirname + '/public'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

// configure functions to be executed on each request
app.use((req, res, next) => {
    if (!global.apiStatus.status) return res.render('misc/apiOffline', { apiStatus: global.apiStatus });
    next();
});

// global functions
global.apiStatus = {
    status: false,
    lastCheck: null,
    url: api.url
};
global.checkApiStatus = (log = !global.apiStatus.status) => {
    axios({
        method: 'GET',
        url: api.url + '/status'
    }).then((response) => {
        if (response.data.status === 'OK') {
            if (log) console.success('API is online.');
            global.apiStatus = {
                status: true,
                lastCheck: new Date(),
                url: api.url
            };
        } else {
            console.error('API is offline. Please check the API status.');
            global.apiStatus = {
                status: false,
                lastCheck: new Date(),
                url: api.url
            };
        }
    }).catch((error) => {
        console.error('API is offline. Please check the API status.');
        global.apiStatus = {
            status: false,
            lastCheck: new Date(),
            url: api.url
        };
    }).finally(() => {
        setTimeout(() => global.checkApiStatus(), 1000 * 5);
    });
}

// configure routes
app.use(require(__dirname + '/routes/index'));

// start the server
app.listen(3000, async () => {
    console.success('Server is running on port 3000');
    console.info('Waiting for API reply...');

    await global.checkApiStatus();
});

// check if the server is running in a docker container
if (process.env.VERCEL) {
    console.info('Running in a Vercel environment');
} else if (isDocker()) {
    console.info('Running in a docker container');
} else {
    console.warn('Non-containerized environment detected. This is not recommended for production environments.');
}