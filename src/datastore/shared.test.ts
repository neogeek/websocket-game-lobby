import { readFileSync } from 'fs';
import assert from 'assert';

import { load as loadYaml } from 'js-yaml';

import { DataStore } from '../types';

export default (datastore: DataStore): void => {
    describe('game', () => {
        it('create new game', async () => {
            const game = await datastore.createGame();

            assert.ok(game.gameId);
            assert.ok(game.gameCode);

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
            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            assert.ok(await datastore.findPlayer(game.gameId, playerId));
        });
        it('find game with ID', async () => {
            const game = await datastore.createGame();

            assert.equal(
                (await datastore.findGame(game.gameId))?.gameId,
                game.gameId
            );
        });
        it('find game with game code', async () => {
            const game = await datastore.createGame();

            assert.equal(
                (await datastore.findGameWithCode(game.gameCode))?.gameId,
                game.gameId
            );
        });
        it('edit game', async () => {
            const game = await datastore.createGame();

            const tempCustom = { value: 'example' };

            assert.notDeepEqual(game?.custom, tempCustom);

            const edited = await datastore.editGame(game.gameId, async data => {
                data.custom = tempCustom;
                return data;
            });

            assert.deepEqual(edited?.custom, tempCustom);
        });
        it('join game as player (admin)', async () => {
            const game = await datastore.createGame();

            const player1 = await datastore.createPlayer();
            const player2 = await datastore.createPlayer();

            await datastore.joinGame(game.gameId, player1);
            await datastore.joinGame(game.gameId, player2);

            assert.equal(
                (await datastore.findPlayer(game.gameId, player1.playerId))
                    ?.isAdmin,
                true
            );
            assert.equal(
                (await datastore.findPlayer(game.gameId, player2.playerId))
                    ?.isAdmin,
                false
            );
        });
        it('join game as player', async () => {
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
            const game = await datastore.createGame();

            assert.notEqual(game.started, true);
            assert.notEqual(game.turns.length, 1);

            const edited = await datastore.startGame(game.gameId);

            assert.equal(edited?.started, true);
            assert.equal(edited?.turns.length, 1);
        });
        it('end game', async () => {
            const game = await datastore.createGame();

            assert.ok(await datastore.findGame(game.gameId));

            await datastore.endGame(game.gameId);

            assert.ok(!(await datastore.findGame(game.gameId)));
        });
    });

    describe('player', () => {
        it('create new player', async () => {
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
            const player = await datastore.createPlayer('');

            assert.notEqual(player.playerId, '');
        });
        it('find player', async () => {
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
            const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.joinGame(
                game.gameId,
                await datastore.createPlayer(playerId)
            );

            const player = await datastore.findPlayer(game.gameId, playerId);

            const name = 'Scott';
            const tempCustom = { value: 'example' };

            assert.notEqual(player?.name, name);
            assert.notDeepEqual(player?.custom, tempCustom);

            const edited = await datastore.editPlayer(
                game.gameId,
                playerId,
                async data => {
                    data.name = name;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.equal(edited?.name, name);
            assert.deepEqual(edited?.custom, tempCustom);
        });
    });

    describe('spectator', () => {
        it('create new spectator', async () => {
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
            const spectator = await datastore.createSpectator('');

            assert.notEqual(spectator.spectatorId, '');
        });
        it('find spectator', async () => {
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
            const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const spectator = await datastore.createSpectator(spectatorId);

            await datastore.joinGame(game.gameId, spectator);

            const name = 'Scott';
            const tempCustom = { value: 'example' };

            assert.notEqual(spectator?.name, name);
            assert.notDeepEqual(spectator?.custom, tempCustom);

            const edited = await datastore.editSpectator(
                game.gameId,
                spectatorId,
                async data => {
                    data.name = name;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.equal(edited?.name, name);
            assert.deepEqual(edited?.custom, tempCustom);
        });
    });

    describe('turn', () => {
        it('create new turn', async () => {
            const { gameId } = await datastore.createGame();

            const turn = await datastore.createTurn(gameId);

            assert.ok(turn.turnId);

            assert.deepStrictEqual(
                Object.keys(turn),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).turn
                )
            );
        });
        it('find turn', async () => {
            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId =
                (await datastore.findGame(game.gameId))?.turns[0].turnId || '';

            assert.equal(
                (await datastore.findTurn(game.gameId, turnId))?.turnId,
                turnId
            );
        });
        it('get current turn', async () => {
            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId =
                (await datastore.findGame(game.gameId))?.turns[0].turnId || '';

            assert.equal(
                (await datastore.currentTurn(game.gameId))?.turnId,
                turnId
            );
        });
        it('edit turn', async () => {
            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId =
                (await datastore.findGame(game.gameId))?.turns[0].turnId || '';

            const turn = await datastore.findTurn(game.gameId, turnId);

            const tempCustom = { value: 'example' };

            assert.notEqual(turn?.index, 2);
            assert.notDeepEqual(turn?.custom, tempCustom);

            const edited = await datastore.editTurn(
                game.gameId,
                turnId,
                async data => {
                    data.index = 2;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.equal(edited?.index, 2);
            assert.deepEqual(edited?.custom, tempCustom);
        });
        it('edit current turn', async () => {
            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId =
                (await datastore.findGame(game.gameId))?.turns[0].turnId || '';

            const turn = await datastore.findTurn(game.gameId, turnId);

            const tempCustom = { value: 'example' };

            assert.notEqual(turn?.index, 2);
            assert.notDeepEqual(turn?.custom, tempCustom);

            const edited = await datastore.editCurrentTurn(
                game.gameId,
                async data => {
                    data.index = 2;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.equal(edited?.index, 2);
            assert.deepEqual(edited?.custom, tempCustom);
        });
        it('end turn', async () => {
            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            const turnId =
                (await datastore.findGame(game.gameId))?.turns[0].turnId || '';

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
        it('set index after each turn', async () => {
            const game = await datastore.createGame();

            await datastore.startGame(game.gameId);

            await datastore.endTurn(game.gameId);
            await datastore.endTurn(game.gameId);

            assert.equal((await datastore.currentTurn(game.gameId))?.index, 3);
        });
    });
};
