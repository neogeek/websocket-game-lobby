import assert from 'assert';

import {
    createUniqueGameCode,
    generateRandomString,
    removeArrayItem
} from './utils';

describe('utils', () => {
    describe('createUniqueGameCode', () => {
        it('generate a unique game code', () => {
            const gameCodes: string[] = [];

            const generated = createUniqueGameCode(
                gameCode => gameCodes.indexOf(gameCode) !== -1
            );

            assert.ok(generated);
        });
        it('fail to generate a unique game code', () => {
            const gameCodes: string[] = ['A'];

            assert.throws(() => {
                createUniqueGameCode(
                    gameCode => gameCodes.indexOf(gameCode) !== -1,
                    1,
                    'A',
                    1
                );
            }, Error);
        });
    });
    describe('generateRandomString', () => {
        it('generate a random string', () => {
            const generated = generateRandomString();

            assert.equal(generated.length, 4);
        });
        it('generate a random string with custom length', () => {
            const generated = generateRandomString(10);

            assert.equal(generated.length, 10);
        });
    });
    describe('removeArrayItem', () => {
        it('remove item from array with primative', () => {
            const array = [1, 2, 3, 4];
            assert.equal(array.length, 4);

            removeArrayItem(array, 1);

            assert.equal(array.length, 3);
        });
        it('remove item from array with function', () => {
            const array = [
                { value: 1 },
                { value: 2 },
                { value: 3 },
                { value: 4 }
            ];
            assert.equal(array.length, 4);

            removeArrayItem(
                array,
                (item: { value: number }) => item.value === 1
            );

            assert.equal(array.length, 3);
        });
    });
});
