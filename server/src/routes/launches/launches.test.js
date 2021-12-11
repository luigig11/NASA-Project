const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => { //ubicamos todas las pruebas dentro de una misma suite para poder crear una sola conexión a BD que funcione para todas las pruebas

    beforeAll(async () => { //para ejecutar el callback antes que todas las demas sentencias
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('It should respond with 200 sucess', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });


    describe('Test POST /launch', () => {

        const completeLaunchData = {
            mission: 'USS Enterpraise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-1652 b',
            launchDate: 'September 11, 2026'
        };

        const launchDateWithoutDate = {
            mission: 'USS Enterpraise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-1652 b',
        };

        const launchDateWithInvalidDate = {
            mission: 'USS Enterpraise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-1652 b',
            launchDate: 'wrong date'
        };

        test('it should respond with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);

            expect(response.body).toMatchObject(launchDateWithoutDate);
        });

        test('It should catch missing required properties', async () => {

            const response = await request(app)
                .post('/v1/launches')
                .send(launchDateWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);


            expect(response.body).toStrictEqual({
                error: 'Missing required launch property',
            });

        });

        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDateWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);


            expect(response.body).toStrictEqual({
                error: 'Invalid launch date',
            });
        });

    });
});

