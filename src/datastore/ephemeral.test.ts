import { EphemeralDataStore } from './ephemeral';

import shared from './shared.test';

describe('ephemeral', () => {
    const datastore = new EphemeralDataStore();

    beforeEach(() => datastore.setup());

    shared(datastore);
});
