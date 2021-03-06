import { readFileSync } from 'fs';
import assert from 'assert';

import { load as loadYaml } from 'js-yaml';

import { DataStoreEvents, IDataStore } from '../types';

export default (datastore: IDataStore): void => {
    describe('game', () => {
        it('create new game', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.ok(game.gameId);
            assert.ok(game.gameCode);

            assert.deepStrictEqual(
                Object.keys(game),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).game
                )
            );

            assert.strictEqual(game.players.length, 0);
            assert.strictEqual(game.spectators.length, 0);
            assert.strictEqual(game.turns.length, 0);
        });
        it('create new game with custom event listener', async () => {
            datastore.addEventListener(DataStoreEvents.createGame, game => {
                game.custom.test = 'tested';
                return game;
            });

            const game = await datastore.createGame();

            assert.ok(game);
            assert.strictEqual(game.custom.test, 'tested');
        });
        it('create new game with custom game code', async () => {
            const game = await datastore.createGame('BEES');

            assert.ok(game);
            assert.strictEqual(game.gameCode, 'BEES');
        });
        it('find game with ID', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.strictEqual(
                (await datastore.findGame(game.gameId))?.gameId,
                game.gameId
            );
        });
        it('find game with game code', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.strictEqual(
                (await datastore.findGameWithCode(game.gameCode))?.gameId,
                game.gameId
            );
        });
        it('edit game', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const tempCustom = { value: 'example' };

            assert.notDeepStrictEqual(game.custom, tempCustom);

            const editedGame = await datastore.editGame(
                game.gameId,
                async data => {
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.ok(editedGame);
            assert.deepStrictEqual(editedGame.custom, tempCustom);
        });
        it('join game as player (admin)', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const player1 = await datastore.createPlayer(game.gameId);
            const player2 = await datastore.createPlayer(game.gameId);

            assert.ok(player1);
            assert.ok(player2);

            assert.strictEqual(player1.isAdmin, true);
            assert.strictEqual(player2.isAdmin, false);
        });
        it('join game as player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId } = await datastore.createPlayer(game.gameId);

            assert.ok(!(await datastore.findSpectator(game.gameId, playerId)));
            assert.ok(await datastore.findPlayer(game.gameId, playerId));
        });
        it('join game as player with name and avatar', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId, name, avatar } = await datastore.createPlayer(
                game.gameId,
                'guest',
                'default'
            );

            assert.ok(!(await datastore.findSpectator(game.gameId, playerId)));
            assert.ok(await datastore.findPlayer(game.gameId, playerId));
            assert.strictEqual(name, 'guest');
            assert.strictEqual(avatar, 'default');
        });
        it('join game as spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const { spectatorId } = await datastore.createSpectator(
                game.gameId
            );

            assert.ok(!(await datastore.findPlayer(game.gameId, spectatorId)));
            assert.ok(await datastore.findSpectator(game.gameId, spectatorId));
        });
        it('leave game as player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId } = await datastore.createPlayer(game.gameId);

            assert.ok(await datastore.findPlayer(game.gameId, playerId));

            await datastore.leaveGame(game.gameId, playerId);

            assert.ok(!(await datastore.findPlayer(game.gameId, playerId)));
        });
        it('leave game as spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { spectatorId } = await datastore.createSpectator(
                game.gameId
            );

            assert.ok(await datastore.findSpectator(game.gameId, spectatorId));

            await datastore.leaveGame(game.gameId, spectatorId);

            assert.ok(
                !(await datastore.findSpectator(game.gameId, spectatorId))
            );
        });
        it('leave game with custom event listener', async () => {
            datastore.addEventListener(DataStoreEvents.leaveGame, game => {
                game.custom.test = 'tested';
                return game;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            const player = await datastore.createPlayer(game.gameId);

            assert.notStrictEqual(game.custom.test, 'tested');

            await datastore.leaveGame(game.gameId, player.playerId);

            const editedGame = await datastore.findGame(game.gameId);

            assert.ok(editedGame);
            assert.strictEqual(editedGame.custom.test, 'tested');
        });
        it('start game', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.notStrictEqual(game.started, true);
            assert.notStrictEqual(game.turns.length, 1);

            const editedGame = await datastore.startGame(game.gameId);

            assert.ok(editedGame);
            assert.strictEqual(editedGame.started, true);
            assert.strictEqual(editedGame.turns.length, 1);
        });
        it('start game with custom event listener', async () => {
            datastore.addEventListener(DataStoreEvents.startGame, game => {
                game.custom.test = 'tested';
                return game;
            });

            const game = await datastore.createGame();

            assert.ok(game);
            assert.notStrictEqual(game.custom.test, 'tested');

            const editedGame = await datastore.startGame(game.gameId);

            assert.ok(editedGame);
            assert.strictEqual(editedGame.custom.test, 'tested');
        });
        it('end game', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.ok(await datastore.findGame(game.gameId));

            await datastore.endGame(game.gameId);

            assert.ok(!(await datastore.findGame(game.gameId)));
        });
    });

    describe('player', () => {
        it('create new player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const player = await datastore.createPlayer(game.gameId);

            assert.ok(player.playerId);

            assert.deepStrictEqual(
                Object.keys(player),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).player
                )
            );
        });
        it('create player with custom event listener', async () => {
            datastore.addEventListener(DataStoreEvents.createPlayer, player => {
                player.custom.test = 'tested';
                return player;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            const player = await datastore.createPlayer(game.gameId);

            assert.ok(player);
            assert.strictEqual(player.custom.test, 'tested');
        });
        it('find player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId } = await datastore.createPlayer(game.gameId);

            const player = await datastore.findPlayer(game.gameId, playerId);

            assert.ok(!(await datastore.findSpectator(game.gameId, playerId)));
            assert.ok(player);
            assert.strictEqual(player.playerId, playerId);
        });
        it('edit player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const player = await datastore.createPlayer(game.gameId);

            const name = 'Scott';
            const tempCustom = { value: 'example' };

            assert.ok(player);
            assert.notStrictEqual(player.name, name);
            assert.notDeepStrictEqual(player.custom, tempCustom);

            const editedPlayer = await datastore.editPlayer(
                game.gameId,
                player.playerId,
                async data => {
                    data.name = name;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.ok(editedPlayer);
            assert.strictEqual(editedPlayer.name, name);
            assert.deepStrictEqual(editedPlayer.custom, tempCustom);
        });
    });

    describe('spectator', () => {
        it('create new spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const spectator = await datastore.createSpectator(game.gameId);

            assert.ok(spectator.spectatorId);

            assert.deepStrictEqual(
                Object.keys(spectator),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).spectator
                )
            );
        });
        it('create spectator with custom event listener', async () => {
            datastore.addEventListener(
                DataStoreEvents.createSpectator,
                spectator => {
                    spectator.custom.test = 'tested';
                    return spectator;
                }
            );

            const game = await datastore.createGame();

            assert.ok(game);

            const spectator = await datastore.createSpectator(game.gameId);

            assert.ok(spectator);
            assert.strictEqual(spectator.custom.test, 'tested');
        });
        it('find spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { spectatorId } = await datastore.createSpectator(
                game.gameId
            );

            const spectator = await datastore.findSpectator(
                game.gameId,
                spectatorId
            );

            assert.ok(!(await datastore.findPlayer(game.gameId, spectatorId)));
            assert.ok(spectator);
            assert.strictEqual(spectator.spectatorId, spectatorId);
        });
        it('edit spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const spectator = await datastore.createSpectator(game.gameId);

            const name = 'Scott';
            const tempCustom = { value: 'example' };

            assert.ok(spectator);
            assert.notStrictEqual(spectator.name, name);
            assert.notDeepStrictEqual(spectator.custom, tempCustom);

            const editedSpectator = await datastore.editSpectator(
                game.gameId,
                spectator.spectatorId,
                async data => {
                    data.name = name;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.ok(editedSpectator);
            assert.strictEqual(editedSpectator.name, name);
            assert.deepStrictEqual(editedSpectator.custom, tempCustom);
        });
    });

    describe('turn', () => {
        it('create new turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            assert.ok(turn);
            assert.ok(turn.turnId);

            assert.deepStrictEqual(
                Object.keys(turn),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).turn
                )
            );
        });
        it('create turn with custom event listener', async () => {
            datastore.addEventListener(
                DataStoreEvents.createTurn,
                spectator => {
                    spectator.custom.test = 'tested';
                    return spectator;
                }
            );

            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            assert.ok(turn);
            assert.strictEqual(turn.custom.test, 'tested');
        });
        it('find turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const startedGame = await datastore.findGame(game.gameId);

            assert.ok(startedGame);

            const turnId = startedGame.turns[0].turnId;

            const turn = await datastore.findTurn(game.gameId, turnId);

            assert.ok(turn);
            assert.strictEqual(turn.turnId, turnId);
        });
        it('get current turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const startedGame = await datastore.findGame(game.gameId);
            const currentTurn = await datastore.currentTurn(game.gameId);

            assert.ok(startedGame);
            assert.ok(currentTurn);

            const turnId = startedGame.turns[0].turnId;

            assert.strictEqual(currentTurn.turnId, turnId);
        });
        it('edit turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            const tempCustom = { value: 'example' };

            assert.ok(turn);
            assert.notDeepStrictEqual(turn.custom, tempCustom);

            const editedTurn = await datastore.editTurn(
                game.gameId,
                turn.turnId,
                async data => {
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.ok(editedTurn);
            assert.deepStrictEqual(editedTurn.custom, tempCustom);
        });
        it('edit current turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            const tempCustom = { value: 'example' };

            assert.ok(turn);
            assert.notDeepStrictEqual(turn.custom, tempCustom);

            const editedTurn = await datastore.editCurrentTurn(
                game.gameId,
                async data => {
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.ok(editedTurn);
            assert.deepStrictEqual(editedTurn.custom, tempCustom);
        });
        it('end current turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const currentTurn = await datastore.currentTurn(game.gameId);

            assert.ok(currentTurn);

            await datastore.endCurrentTurn(game.gameId);

            const nextTurn = await datastore.currentTurn(game.gameId);

            assert.ok(nextTurn);
            assert.notStrictEqual(nextTurn.turnId, currentTurn.turnId);
        });
        it('end current turn with custom event listener', async () => {
            datastore.addEventListener(DataStoreEvents.endCurrentTurn, turn => {
                turn.custom.test = 'tested';
                return turn;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            assert.ok(turn);
            assert.notStrictEqual(turn.custom.test, 'tested');

            await datastore.endCurrentTurn(game.gameId);

            const endedTurn = await datastore.findTurn(
                game.gameId,
                turn.turnId
            );

            assert.ok(endedTurn);
            assert.strictEqual(endedTurn.custom.test, 'tested');
        });
        it('auto-increment index after each turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            await datastore.endCurrentTurn(game.gameId);
            await datastore.endCurrentTurn(game.gameId);

            const currentTurn = await datastore.currentTurn(game.gameId);

            assert.ok(currentTurn);
            assert.strictEqual(currentTurn.index, 3);
        });
    });
};
