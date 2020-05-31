import { readFileSync } from 'fs';
import assert from 'assert';

import { load as loadYaml } from 'js-yaml';

import { DataStore } from '../types';

export default (datastore: DataStore): void => {
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

            assert.equal(game.players.length, 0);
            assert.equal(game.spectators.length, 0);
            assert.equal(game.turns.length, 0);
        });
        it('create new game with custom event listener', async () => {
            datastore.addEventListener('createGame', game => {
                game.custom.test = 'tested';
                return game;
            });

            const game = await datastore.createGame();

            assert.ok(game);
            assert.equal(game.custom.test, 'tested');
        });
        it('find game with ID', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.equal(
                (await datastore.findGame(game.gameId))?.gameId,
                game.gameId
            );
        });
        it('find game with game code', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.equal(
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

            const editedPlayer1 = await datastore.findPlayer(
                game.gameId,
                player1.playerId
            );
            const editedPlayer2 = await datastore.findPlayer(
                game.gameId,
                player2.playerId
            );

            assert.ok(editedPlayer1);
            assert.ok(editedPlayer2);
            assert.equal(editedPlayer1.isAdmin, true);
            assert.equal(editedPlayer2.isAdmin, false);
        });
        it('join game as player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId } = await datastore.createPlayer(game.gameId);

            assert.ok(await datastore.findPlayer(game.gameId, playerId));
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

            await datastore.startGame(game.gameId);

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
            datastore.addEventListener('leaveGame', game => {
                game.custom.test = 'tested';
                return game;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            const player = await datastore.createPlayer(game.gameId);

            assert.notEqual(game.custom.test, 'tested');

            await datastore.leaveGame(game.gameId, player.playerId);

            const editedGame = await datastore.findGame(game.gameId);

            assert.ok(editedGame);
            assert.equal(editedGame.custom.test, 'tested');
        });
        it('start game', async () => {
            const game = await datastore.createGame();

            assert.ok(game);
            assert.notEqual(game.started, true);
            assert.notEqual(game.turns.length, 1);

            const editedGame = await datastore.startGame(game.gameId);

            assert.ok(editedGame);
            assert.equal(editedGame.started, true);
            assert.equal(editedGame.turns.length, 1);
        });
        it('start game with custom event listener', async () => {
            datastore.addEventListener('startGame', game => {
                game.custom.test = 'tested';
                return game;
            });

            const game = await datastore.createGame();

            assert.ok(game);
            assert.notEqual(game.custom.test, 'tested');

            const editedGame = await datastore.startGame(game.gameId);

            assert.ok(editedGame);
            assert.equal(editedGame.custom.test, 'tested');
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
            datastore.addEventListener('createPlayer', player => {
                player.custom.test = 'tested';
                return player;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            const player = await datastore.createPlayer(game.gameId);

            assert.ok(player);
            assert.equal(player.custom.test, 'tested');
        });
        it('find player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId } = await datastore.createPlayer(game.gameId);

            const editedPlayer = await datastore.findPlayer(
                game.gameId,
                playerId
            );

            assert.ok(!(await datastore.findSpectator(game.gameId, playerId)));
            assert.ok(editedPlayer);
            assert.equal(editedPlayer.playerId, playerId);
        });
        it('edit player', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const { playerId } = await datastore.createPlayer(game.gameId);

            const player = await datastore.findPlayer(game.gameId, playerId);

            const name = 'Scott';
            const tempCustom = { value: 'example' };

            assert.ok(player);
            assert.notEqual(player.name, name);
            assert.notDeepStrictEqual(player.custom, tempCustom);

            const editedPlayer = await datastore.editPlayer(
                game.gameId,
                playerId,
                async data => {
                    data.name = name;
                    data.custom = tempCustom;
                    return data;
                }
            );

            assert.ok(editedPlayer);
            assert.equal(editedPlayer.name, name);
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
            datastore.addEventListener('createSpectator', spectator => {
                spectator.custom.test = 'tested';
                return spectator;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            const spectator = await datastore.createSpectator(game.gameId);

            assert.ok(spectator);
            assert.equal(spectator.custom.test, 'tested');
        });
        it('find spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const { spectatorId } = await datastore.createSpectator(
                game.gameId
            );

            const spectator = await datastore.findSpectator(
                game.gameId,
                spectatorId
            );

            assert.ok(!(await datastore.findPlayer(game.gameId, spectatorId)));
            assert.ok(spectator);
            assert.equal(spectator.spectatorId, spectatorId);
        });
        it('edit spectator', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const spectator = await datastore.createSpectator(game.gameId);

            const name = 'Scott';
            const tempCustom = { value: 'example' };

            assert.ok(spectator);
            assert.notEqual(spectator.name, name);
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
            assert.equal(editedSpectator.name, name);
            assert.deepStrictEqual(editedSpectator.custom, tempCustom);
        });
    });

    describe('turn', () => {
        it('create new turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            const turn = await datastore.createTurn(game.gameId);

            assert.ok(turn.turnId);

            assert.deepStrictEqual(
                Object.keys(turn),
                Object.keys(
                    loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).turn
                )
            );
        });
        it('create turn with custom event listener', async () => {
            datastore.addEventListener('createTurn', spectator => {
                spectator.custom.test = 'tested';
                return spectator;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            assert.ok(turn);
            assert.equal(turn.custom.test, 'tested');
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
            assert.equal(turn.turnId, turnId);
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

            assert.equal(currentTurn.turnId, turnId);
        });
        it('edit turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const startedGame = await datastore.findGame(game.gameId);

            assert.ok(startedGame);

            const turnId = startedGame.turns[0].turnId;

            const turn = await datastore.findTurn(game.gameId, turnId);

            const tempCustom = { value: 'example' };

            assert.ok(turn);
            assert.notDeepStrictEqual(turn.custom, tempCustom);

            const editedTurn = await datastore.editTurn(
                game.gameId,
                turnId,
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

            const startedGame = await datastore.findGame(game.gameId);

            assert.ok(startedGame);

            const turnId = startedGame.turns[0].turnId || '';

            const turn = await datastore.findTurn(game.gameId, turnId);

            const tempCustom = { value: 'example' };

            assert.ok(turn);
            assert.notEqual(turn.index, 2);
            assert.notDeepStrictEqual(turn.custom, tempCustom);

            const editedTurn = await datastore.editCurrentTurn(
                game.gameId,
                async data => {
                    data.index = 2;
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

            const startedGame = await datastore.findGame(game.gameId);
            const currentTurn = await datastore.currentTurn(game.gameId);

            assert.ok(startedGame);
            assert.ok(currentTurn);

            const turnId = startedGame.turns[0].turnId;

            assert.equal(currentTurn.turnId, turnId);

            await datastore.endCurrentTurn(game.gameId);

            const nextTurn = await datastore.currentTurn(game.gameId);

            assert.ok(nextTurn);
            assert.notEqual(nextTurn.turnId, turnId);
        });
        it('end current turn with custom event listener', async () => {
            datastore.addEventListener('endCurrentTurn', turn => {
                turn.custom.test = 'tested';
                return turn;
            });

            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            const turn = await datastore.currentTurn(game.gameId);

            assert.ok(turn);
            assert.notEqual(turn.custom.test, 'tested');

            await datastore.endCurrentTurn(game.gameId);

            const endedTurn = await datastore.findTurn(
                game.gameId,
                turn.turnId
            );

            assert.ok(endedTurn);
            assert.equal(endedTurn.custom.test, 'tested');
        });
        it('set index after each turn', async () => {
            const game = await datastore.createGame();

            assert.ok(game);

            await datastore.startGame(game.gameId);

            await datastore.endCurrentTurn(game.gameId);
            await datastore.endCurrentTurn(game.gameId);

            const currentTurn = await datastore.currentTurn(game.gameId);

            assert.ok(currentTurn);
            assert.equal(currentTurn.index, 3);
        });
    });
};
