/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import assert from 'assert';

import Listeners from './listeners';

import { EphemeralDataStore } from './datastore';

import { DataStore } from './types';

describe('listeners', () => {
    it('add/remove method', async () => {
        const example = new Listeners();

        const method = async (data: any, datastore: DataStore) => {};

        assert.ok(!example.listeners['test']);

        example.addEventListener('test', method);

        assert.equal(example.listeners['test'].length, 1);

        example.removeEventListener('test', method);

        assert.equal(example.listeners['test'].length, 0);
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

        example.runEventListeners('test', {}, datastore);
    });
    it('remove all methods', async () => {
        const example = new Listeners();

        example.addEventListener(
            'test',
            async (data: any, datastore: DataStore) => {}
        );

        example.addEventListener(
            'test',
            async (data: any, datastore: DataStore) => {}
        );

        assert.equal(example.listeners['test'].length, 2);

        example.removeAllEventListeners();

        assert.equal(example.listeners['test'].length, 0);
    });
});
