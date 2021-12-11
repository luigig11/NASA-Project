const fs = require('fs');
const path = require('path');

const parse = require('csv-parse');

const planets = require('./planets.mongo');

// const habitablePlanets = [];

const isHabitablePlanet = (planet) => {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36
        && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', 'data',  'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on(('data'), async (data) => {
                if (isHabitablePlanet(data)) {
                    // habitablePlanets.push(data);
                    savePlanet(data);
                 }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async () => {
                /* console.log(habitablePlanets.map((planet) => {
                    return planet['kepler_name']
                })); */
                // console.log(`${habitablePlanets.length} habitable planets!`);
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`${countPlanetsFound} habitable planets!`);
                resolve();
            });
    });
}

async function getAllPlanets() {
    return await planets.find({}, {
        '_id': 0, '__v': 0,
    });
    // return habitablePlanets. En el segundo objeto que se le pasa a find, el parametro es llamado projection y se usa para eliminar datos de la respuesta de la BD que no me interesan en mi app;
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name,
        }, {
            upsert: true,
        }); //crearemos un nuevo documento en MongDB para almacenar la data de planetas habitables que aun no haya sido almacenada. Si el planeta ya existe solo se actualiza. La información debe tener la misma estructura que la esperada en nuestro esquema
    
    } catch (err) {
        console.error(`Could not save planet ${err}`);
    }
    
}


module.exports = {
    loadPlanetsData,
    getAllPlanets
}

