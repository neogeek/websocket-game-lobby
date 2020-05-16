import { readFileSync } from 'fs';
import assert from 'assert';

import { load as loadYaml } from 'js-yaml';

import { EphemeralDataStore as DataStore } from './ephemeral';

describe('ephemeral', () => {
    describe('game', () => {
        it('create new game', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            assert.ok(game.gameId);

            assert.deepStrictEqual(
                Object.keys(game),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).game
                )
            );

            assert.equal(game.players.length, 0);
            assert.equal(game.spectators.length, 0);
            assert.equal(game.turns.length, 0);
        });
        it('create new game with one player using a specific playerId', async () => {
            const datastore = new DataStore();

            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            assert.ok(await datastore.findPlayer(game.gameId, playerId));
        });
        it('find game with ID', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            assert.equal(
                (await datastore.findGame(game.gameId))?.gameId,
                game.gameId
            );
        });
        it('find game with game code', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            assert.equal(
                (await datastore.findGameWithCode(game.gameCode))?.gameId,
                game.gameId
            );
        });
        it('edit game', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            const gameCode = 'FAKECODE';

            assert.notEqual(game.gameCode, gameCode);

            const edited = await datastore.editGame(game.gameId, data => {
                data.gameCode = gameCode;
                return data;
            });

            assert.equal(edited?.gameCode, gameCode);
        });
        it('join game as player', async () => {
            const datastore = new DataStore();

            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            assert.ok(!(await datastore.findPlayer(game.gameId, playerId)));

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            assert.ok(await datastore.findPlayer(game.gameId, playerId));
        });
        it('join game as spectator', async () => {
            const datastore = new DataStore();

            const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            assert.ok(!(await datastore.findPlayer(game.gameId, spectatorId)));

            assert.ok(
                !(await datastore.findSpectator(game.gameId, spectatorId))
            );

            await datastore.joinGame(
                game.gameId,
                await datastore.createSpectator(spectatorId)
            );

            assert.ok(!(await datastore.findPlayer(game.gameId, spectatorId)));

            assert.ok(await datastore.findSpectator(game.gameId, spectatorId));
        });
        it('leave game as player', async () => {
            const datastore = new DataStore();

            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            assert.ok(await datastore.findPlayer(game.gameId, playerId));

            await datastore.leaveGame(game.gameId, playerId);

            assert.ok(!(await datastore.findPlayer(game.gameId, playerId)));
        });
        it('leave game as spectator', async () => {
            const datastore = new DataStore();

            const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            assert.ok(
                !(await datastore.findSpectator(game.gameId, spectatorId))
            );

            await datastore.joinGame(
                game.gameId,
                await datastore.createSpectator(spectatorId)
            );

            assert.ok(await datastore.findSpectator(game.gameId, spectatorId));

            await datastore.leaveGame(game.gameId, spectatorId);

            assert.ok(
                !(await datastore.findSpectator(game.gameId, spectatorId))
            );
        });
        it('start game', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            assert.notEqual(game.started, true);
            assert.notEqual(game.turns.length, 1);

            await datastore.startGame(game.gameId);

            assert.equal(game.started, true);
            assert.equal(game.turns.length, 1);
        });
        it('end game', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            assert.ok(await datastore.findGame(game.gameId));

            await datastore.endGame(game.gameId);

            assert.ok(!(await datastore.findGame(game.gameId)));
        });
    });

    describe('player', () => {
        it('create new player', async () => {
            const datastore = new DataStore();

            const player = await datastore.createPlayer();

            assert.ok(player.playerId);

            assert.deepStrictEqual(
                Object.keys(player),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).player
                )
            );
        });
        it('create new player with falsy ID', async () => {
            const datastore = new DataStore();

            const player = await datastore.createPlayer('');

            assert.notEqual(player.playerId, '');
        });
        it('find player', async () => {
            const datastore = new DataStore();

            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            assert.ok(!(await datastore.findSpectator(game.gameId, playerId)));

            assert.equal(
                (await datastore.findPlayer(game.gameId, playerId))?.playerId,
                playerId
            );
        });
        it('edit player', async () => {
            const datastore = new DataStore();

            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            const player = await datastore.findPlayer(game.gameId, playerId);

            const name = 'Scott';

            assert.notEqual(player?.name, name);

            const edited = await datastore.editPlayer(
                game.gameId,
                playerId,
                data => {
                    data.name = name;
                    return data;
                }
            );

            assert.equal(edited?.name, name);
        });
    });

    describe('spectator', () => {
        it('create new spectator', async () => {
            const datastore = new DataStore();

            const spectator = await datastore.createSpectator();

            assert.ok(spectator.spectatorId);

            assert.deepStrictEqual(
                Object.keys(spectator),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).spectator
                )
            );
        });
        it('create new spectator with falsy ID', async () => {
            const datastore = new DataStore();

            const spectator = await datastore.createSpectator('');

            assert.notEqual(spectator.spectatorId, '');
        });
        it('find spectator', async () => {
            const datastore = new DataStore();

            const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            await datastore.joinGame(
                game.gameId,
                await datastore.createSpectator(spectatorId)
            );

            assert.ok(!(await datastore.findPlayer(game.gameId, spectatorId)));

            assert.equal(
                (await datastore.findSpectator(game.gameId, spectatorId))
                    ?.spectatorId,
                spectatorId
            );
        });
        it('edit spectator', async () => {
            const datastore = new DataStore();

            const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const spectator = await datastore.createSpectator(spectatorId);

            await datastore.joinGame(game.gameId, spectator);

            const name = 'Scott';

            assert.notEqual(spectator?.name, name);

            const edited = await datastore.editSpectator(
                game.gameId,
                spectatorId,
                data => {
                    data.name = name;
                    return data;
                }
            );

            assert.equal(edited?.name, name);
        });
    });

    describe('turn', () => {
        it('create new turn', async () => {
            const datastore = new DataStore();

            const turn = await datastore.createTurn();

            assert.ok(turn.turnId);

            assert.deepStrictEqual(
                Object.keys(turn),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).turn
                )
            );
        });
        it('find turn', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId = game.turns[0].turnId;

            assert.equal(
                (await datastore.findTurn(game.gameId, turnId))?.turnId,
                turnId
            );
        });
        it('get current turn', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId = game.turns[0].turnId;

            assert.equal(
                (await datastore.currentTurn(game.gameId))?.turnId,
                turnId
            );
        });
        it('edit turn', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId = game.turns[0].turnId;

            const turn = await datastore.findTurn(game.gameId, turnId);

            const tempValue = 'example';

            assert.notEqual((turn as any)?.value, tempValue);

            const edited = await datastore.editTurn(
                game.gameId,
                turnId,
                data => {
                    (data as any).value = tempValue;
                    return data;
                }
            );

            assert.equal((edited as any)?.value, tempValue);
        });
        it('end turn', async () => {
            const datastore = new DataStore();

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId = game.turns[0].turnId;

            assert.equal(
                (await datastore.currentTurn(game.gameId))?.turnId,
                turnId
            );

            await datastore.endTurn(game.gameId);

            assert.notEqual(
                (await datastore.currentTurn(game.gameId))?.turnId,
                turnId
            );
        });
    });
});
