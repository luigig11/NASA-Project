const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


/* const planetsRouter = require('./routes/planets/planets.router');
const launchesRouter = require('./routes/launches/launches.router'); */
const api = require('./routes/api');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
}));
/* Loggin Request with morgan */
//app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

/* se moveran dentro del modulo api.js para mantener centralizada la versión del api
app.use('/planets', planetsRouter);
app.use('/launches', launchesRouter); */
app.use('/v1', api); //aquí poongo el versionamienot del api. Si se necesitan otras versiones se crea otro router y se le montan las rutas y controladores

//in case the routes become unaccesible in production, uncomment this section
/* app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
}); */

module.exports = app;