const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launches = new Map();

// let latestFlightNumber = 100;

/* const launch = {
    flightNumber: 100, //this is a natural id. In the launch api response  this is equal to "flight_number"
    mission: 'Kepler Exploration x', //this is "name" in the launche api reponse 
    rocket: 'Explore IS1', //this is "rocket.name" in the launche api reponse 
    launchDate: new Date('Decembar 27, 2030'), //this is "date_local" in the launche api reponse 
    target: 'kepler-442 b', //not applicable because there is nothing equivalent in the spacex api
    customers: ['NASA', 'ZTM'], //payload.cusotmers for each payload
    upcoming: true, //this is "upcoming" in the launche api reponse 
    success: true, //this is "success" in the launche api reponse 
}; */

//saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false, //para no hacer paginación de los datos
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs; //data is where axios alocate the api response
    for(const launchDoc of launchDocs) {

        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });


        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function loadLaunchesData() {

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });

    if (firstLaunch) {
        console.log('Launch data already loaded!');
        return;
    } else {
        await populateLaunches();
    }    
}

//funcion para encontrar launches
async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

// launches.set(launch.flightNumber, launch);

async function existLaunchWithId(launchId) {
    // return launches.has(launchId);
    /* return await launchesDatabase.findOne({ //no usamos el método findById ya que en ese método el Id es el ObjectId de mongoose y no usamos ese Id sino nuestro propio Id que es el flightNumber
        flightNumber: launchId,
    }); */
    return await findLaunch({
        flightNumber: launchId,
    })
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

async function getAllLaunches(skip, limit) {
    // return Array.from(launches.values());
    return await launchesDatabase.find({}, {
        '_id': 0, '__v': 0
    })
    .sort({flightNumber: 1}) //para ordenar los documentos segun el parámetro pasado
    .skip(skip) //para saltarse la cantidad de datos indicada. Sirve para la paginacion
    .limit(limit); //limit es para limitar la cantidad de documentos (datos) que recibo
}

async function saveLaunch(launch) {

    /* vamos a mover este bloque que valida si ya existe el planeta 
    en la BD porque no me interesa hacer esa validación al guardar 
    el lanzamiento sino al agendarlo en el metodo scheduleNewLaunch
    const planet = await planets.findOne({
        keplerName: launch.target,
    });
    console.log('planet en saveLaunch: ', planet);

    if (!planet) {
        throw new Error('No matching planet found');
    } */
    
    await launchesDatabase.findOneAndUpdate({ //updateOne retornaba elemementos que no queríamos mostrar en la respuesta, por eso se cambio el método por findOneAndUpdate que solo retorna las propiedades del objeto del segundo parámetro
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
}

async function scheduleNewLaunch(launch) {

    const planet = await planets.findOne({
        keplerName: launch.target,
    });
    console.log('planet en saveLaunch: ', planet);

    if (!planet) {
        throw new Error('No matching planet found');
    }

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
    loadLaunchesData,
    existLaunchWithId,
    getAllLaunches,
    // addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById
}