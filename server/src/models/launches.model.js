const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launches = new Map();

// let latestFlightNumber = 100;

const launch = {
    flightNumber: 100, //this is a natural id
    mission: 'Kepler Exploration x',
    rocket: 'Explore IS1',
    launchDate: new Date('Decembar 27, 2030'),
    target: 'kepler-442 b',
    customers: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
};

//saveLaunch(launch);

// launches.set(launch.flightNumber, launch);

async function existLaunchWithId(launchId) {
    // return launches.has(launchId);
    return await launchesDatabase.findOne({ //no usamos el método findById ya que en ese método el Id es el ObjectId de mongoose y no usamos ese Id sino nuestro propio Id que es el flightNumber
        flightNumber: launchId,
    });
}

async function getLatesFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne() //no le paso objeto de query porque hago el ordenamiento en el paso de abajo
        .sort('-flightNumber'); //el argumento es el campo usado para ordenar y el simbolo negativo indica que se desea un ordenamiento descendente
    
    if(!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;

}

async function getAllLaunches() {
    // return Array.from(launches.values());
    return await launchesDatabase.find({}, {
        '_id': 0, '__v': 0
    });
}

async function saveLaunch(launch) {

    const planet = await planets.findOne({
        keplerName: launch.target,
    });
    console.log('planet en saveLaunch: ', planet);

    if (!planet) {
        throw new Error('No matching planet found');
    }
    
    await launchesDatabase.findOneAndUpdate({ //updateOne retornaba elemementos que no queríamos mostrar en la respuesta, por eso se cambio el método por findOneAndUpdate que solo retorna las propiedades del objeto del segundo parámetro
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
}

async function scheduleNewLaunch(launch) {

    const newFlightNumber = await getLatesFlightNumber() + 1

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

/* function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(latestFlightNumber, Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: latestFlightNumber,
    }));
} */

async function abortLaunchById(launchId) {
    /* const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted; */
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false
    }); //en esta ocasión no le pasamos el parámetro upsert: true porque no queremos insertar el documento en la colección launch en caso de que no existe. De hecho como en el código antes de llamar este método yo ya verifique que el documento existe

    // return aborted.ok === 1 && aborted.nModified esto no lo use porque en mi versión de mongoose no se retornan estos valores: https://mongoosejs.com/docs/api.html#model_Model.updateOne
    return aborted.acknowledged === true && aborted.modifiedCount === 1;

}

module.exports = {
    existLaunchWithId,
    getAllLaunches,
    // addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById
}