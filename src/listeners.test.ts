import assert from 'assert';

import Listeners from './listeners';

import { EphemeralDataStore } from './datastore';

import { DataStore } from './types';

describe('listeners', () => {
    it('add/remove method', async () => {
        const example = new Listeners();

        const method = async (data: any, datastore: DataStore) => {
            console.log(data);
        };

        assert.ok(!example.listeners['test']);

        example.addEventListener('test', method);

        assert.equal(example.listeners['test'].length, 1);

        example.removeEventListener('test', method);

        assert.equal(example.listeners['test'].length, 0);
    });
    it('create class with default listeners', async () => {
        const example = new Listeners({
            test: []
        });

        assert.ok(example.listeners['test']);
    });
    it('run method', async done => {
        const example = new Listeners();

        const datastore = new EphemeralDataStore();

        example.addEventListener(
            'test',
            async (data: any, datastore: DataStore) => {
                done();
            }
        );

        example.runEventListener('test', {}, datastore);
    });
    it('remove all methods', async () => {
        const example = new Listeners();

        example.addEventListener(
            'test',
            async (data: any, datastore: DataStore) => {
                console.log(data);
            }
        );

        example.addEventListener(
            'test',
            async (data: any, datastore: DataStore) => {
                console.log(data);
            }
        );

        assert.equal(example.listeners['test'].length, 2);

        example.removeAllEventListener();

        assert.equal(example.listeners['test'].length, 0);
    });
});
