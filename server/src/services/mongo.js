const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

//once es un evento que se dispara solo una vez, lo usamos en lugar de on porque la BD solo se abre una vez al iniciarse
mongoose.connection.once('open', () => {
    console.log('Conecction open');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
}