const http = require('http');
// const mongoose = require('mongoose');

//la funcion que necesito para que el paquete dotenv llene el modulo process.env con los valores seteados en el archivo .env
//se pone arriba de los demas modulos porque queremos que se llene el modulo process.env y luego los otros puedan usarlo
require('dotenv').config(); 

const app = require('./app');

const {mongoConnect} = require('./services/mongo');

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

// const MONGO_URL = 'mongodb+srv://nasa-api:XVOaUdnhh5or0cfQ@nasacluster.zsfer.mongodb.net/nasa?retryWrites=true&w=majority'

const server = http.createServer(app);

//once es un evento que se dispara solo una vez, lo usamos en lugar de on porque la BD solo se abre una vez al iniciarse
// mongoose.connection.once('open', () => {
//     console.log('Conecction open');
// });

// mongoose.connection.on('error', (err) => {
//     console.error(err);
// });

async function startServer() {
    // await mongoose.connect(MONGO_URL);
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => {
        console.log(`prueba de Listening on port: ${PORT}`);
    });
}

startServer();
