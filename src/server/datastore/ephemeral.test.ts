import { readFileSync } from 'fs';
import assert from 'assert';

import { load as loadYaml } from 'js-yaml';

import { EphemeralDataStore } from './ephemeral';

describe('game', () => {
    it('create new game', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        assert.ok(game.gameId);

        assert.deepStrictEqual(
            Object.keys(game),
            Object.keys(loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).game)
        );

        assert.equal(game.players.length, 0);
        assert.equal(game.spectators.length, 0);
        assert.equal(game.turns.length, 0);
    });
    it('create new game with one player using a specific playerId', () => {
        const datastore = new EphemeralDataStore();

        const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        assert.ok(game.gameId);

        datastore.joinGame(game.gameId, datastore.createPlayer(playerId));

        assert.ok(datastore.findPlayer(game.gameId, playerId));
    });
    it('find game with ID', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        assert.equal(datastore.findGame(game.gameId)?.gameId, game.gameId);
    });
    it('find game with game code', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        assert.equal(
            datastore.findGameWithCode(game.gameCode)?.gameId,
            game.gameId
        );
    });
    it('edit game', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        const gameCode = 'FAKECODE';

        assert.notEqual(game.gameCode, gameCode);

        const edited = datastore.editGame(game.gameId, data => {
            data.gameCode = gameCode;
            return data;
        });

        assert.equal(game.gameCode, gameCode);
        assert.equal(edited?.gameCode, gameCode);
    });
    it('join game as player', () => {
        const datastore = new EphemeralDataStore();

        const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        assert.ok(!datastore.findPlayer(game.gameId, playerId));

        datastore.joinGame(game.gameId, datastore.createPlayer(playerId));

        assert.ok(datastore.findPlayer(game.gameId, playerId));
    });
    it('join game as spectator', () => {
        const datastore = new EphemeralDataStore();

        const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        assert.ok(!datastore.findPlayer(game.gameId, spectatorId));

        assert.ok(!datastore.findSpectator(game.gameId, spectatorId));

        datastore.joinGame(game.gameId, datastore.createSpectator(spectatorId));

        assert.ok(!datastore.findPlayer(game.gameId, spectatorId));

        assert.ok(datastore.findSpectator(game.gameId, spectatorId));
    });
    it('leave game as player', () => {
        const datastore = new EphemeralDataStore();

        const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.joinGame(game.gameId, datastore.createPlayer(playerId));

        assert.ok(datastore.findPlayer(game.gameId, playerId));

        datastore.leaveGame(game.gameId, playerId);

        assert.ok(!datastore.findPlayer(game.gameId, playerId));
    });
    it('leave game as spectator', () => {
        const datastore = new EphemeralDataStore();

        const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        assert.ok(!datastore.findSpectator(game.gameId, spectatorId));

        datastore.joinGame(game.gameId, datastore.createSpectator(spectatorId));

        assert.ok(datastore.findSpectator(game.gameId, spectatorId));

        datastore.leaveGame(game.gameId, spectatorId);

        assert.ok(!datastore.findSpectator(game.gameId, spectatorId));
    });
    it('start game', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        assert.notEqual(game.started, true);
        assert.notEqual(game.turns.length, 1);

        datastore.startGame(game.gameId);

        assert.equal(game.started, true);
        assert.equal(game.turns.length, 1);
    });
    it('end game', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        assert.ok(datastore.findGame(game.gameId));

        datastore.endGame(game.gameId);

        assert.ok(!datastore.findGame(game.gameId));
    });
});

describe('player', () => {
    it('create new player', () => {
        const datastore = new EphemeralDataStore();

        const player = datastore.createPlayer();

        assert.ok(player.playerId);

        assert.deepStrictEqual(
            Object.keys(player),
            Object.keys(
                loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).player
            )
        );
    });
    it('create new player with falsy ID', () => {
        const datastore = new EphemeralDataStore();

        const player = datastore.createPlayer('');

        assert.notEqual(player.playerId, '');
    });
    it('find player', () => {
        const datastore = new EphemeralDataStore();

        const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.joinGame(game.gameId, datastore.createPlayer(playerId));

        assert.ok(!datastore.findSpectator(game.gameId, playerId));

        assert.equal(
            datastore.findPlayer(game.gameId, playerId)?.playerId,
            playerId
        );
    });
    it('edit player', () => {
        const datastore = new EphemeralDataStore();

        const playerId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.joinGame(game.gameId, datastore.createPlayer(playerId));

        const player = datastore.findPlayer(game.gameId, playerId);

        const name = 'Scott';

        assert.notEqual(player?.name, name);

        const edited = datastore.editPlayer(game.gameId, playerId, data => {
            data.name = name;
            return data;
        });

        assert.equal(player?.name, name);
        assert.equal(edited?.name, name);
    });
});

describe('spectator', () => {
    it('create new spectator', () => {
        const datastore = new EphemeralDataStore();

        const spectator = datastore.createSpectator();

        assert.ok(spectator.spectatorId);

        assert.deepStrictEqual(
            Object.keys(spectator),
            Object.keys(
                loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).spectator
            )
        );
    });
    it('create new spectator with falsy ID', () => {
        const datastore = new EphemeralDataStore();

        const spectator = datastore.createSpectator('');

        assert.notEqual(spectator.spectatorId, '');
    });
    it('find spectator', () => {
        const datastore = new EphemeralDataStore();

        const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        datastore.joinGame(game.gameId, datastore.createSpectator(spectatorId));

        assert.ok(!datastore.findPlayer(game.gameId, spectatorId));

        assert.equal(
            datastore.findSpectator(game.gameId, spectatorId)?.spectatorId,
            spectatorId
        );
    });
    it('edit spectator', () => {
        const datastore = new EphemeralDataStore();

        const spectatorId = '8ca2ad81-093d-4352-8b96-780899e09d69';

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        const spectator = datastore.createSpectator(spectatorId);

        datastore.joinGame(game.gameId, spectator);

        const name = 'Scott';

        assert.notEqual(spectator?.name, name);

        const edited = datastore.editSpectator(
            game.gameId,
            spectatorId,
            data => {
                data.name = name;
                return data;
            }
        );

        assert.equal(spectator?.name, name);
        assert.equal(edited?.name, name);
    });
});

describe('turn', () => {
    it('create new turn', () => {
        const datastore = new EphemeralDataStore();

        const turn = datastore.createTurn();

        assert.ok(turn.turnId);

        assert.deepStrictEqual(
            Object.keys(turn),
            Object.keys(loadYaml(readFileSync(`${__dirname}/scheme.yaml`)).turn)
        );
    });
    it('find turn', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        const turnId = game.turns[0].turnId;

        assert.equal(datastore.findTurn(game.gameId, turnId)?.turnId, turnId);
    });
    it('get current turn', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        const turnId = game.turns[0].turnId;

        assert.equal(datastore.currentTurn(game.gameId)?.turnId, turnId);
    });
    it('edit turn', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        const turnId = game.turns[0].turnId;

        const turn = datastore.findTurn(game.gameId, turnId);

        const tempValue = 'example';

        assert.notEqual((turn as any)?.value, tempValue);

        const edited = datastore.editTurn(game.gameId, turnId, data => {
            (data as any).value = tempValue;
            return data;
        });

        assert.equal((turn as any)?.value, tempValue);
        assert.equal((edited as any)?.value, tempValue);
    });
    it('end turn', () => {
        const datastore = new EphemeralDataStore();

        const game = datastore.createGame();

        datastore.startGame(game.gameId);

        const turnId = game.turns[0].turnId;

        assert.equal(datastore.currentTurn(game.gameId)?.turnId, turnId);

        datastore.endTurn(game.gameId);

        assert.notEqual(datastore.currentTurn(game.gameId)?.turnId, turnId);
    });
});
