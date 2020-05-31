import { PostgresDataStore, client } from './postgres';

import shared from './shared.test';

describe('postgres', () => {
    const datastore = new PostgresDataStore();

    beforeAll(async () => {
        await datastore.setup();
    });
    beforeEach(async () => {
        await client.query('TRUNCATE game');
        await client.query('TRUNCATE player');
        await client.query('TRUNCATE spectator');
        await client.query('TRUNCATE turn');
        datastore.removeAllEventListeners();
    });
    afterAll(async () => {
        await client.end();
    });

    shared(datastore);
});
