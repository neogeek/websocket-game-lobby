import { EphemeralDataStore } from './ephemeral';

import shared from './shared.test';

describe('ephemeral', () => {
    const datastore = new EphemeralDataStore();

    beforeEach(() => {
        datastore.setup();
        datastore.removeAllEventListener();
    });

    shared(datastore);
});
