const http = require('http');
// const mongoose = require('mongoose');

const app = require('./app');

const {mongoConnect} = require('./services/mongo');

const { loadPlanetsData } = require('./models/planets.model');

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

    server.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
    });
}

startServer();
