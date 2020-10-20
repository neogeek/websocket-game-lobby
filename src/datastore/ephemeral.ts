import { v4 as uuidv4 } from 'uuid';

import { createUniqueGameCode, removeArrayItemWithFilter } from '../utils';

import Listeners from '../listeners';

import {
    IDataStore,
    DataStoreEvents,
    Game,
    Player,
    Spectator,
    Turn
} from '../types';

let data: Game[] = [];

export class EphemeralDataStore
    extends Listeners<DataStoreEvents>
    implements IDataStore {
    listeners = Object.keys(DataStoreEvents).reduce((acc, curr) => {
        return {
            [curr]: [],
            ...acc
        };
    }, {});

    async setup(): Promise<void> {
        data = [];
        return;
    }
    async createGame(): Promise<Game> {
        const game: Game = {
            gameId: uuidv4(),
            gameCode: await createUniqueGameCode(async gameCode =>
                Boolean(data.find((game: Game) => game.gameCode === gameCode))
            ),
            started: false,
            players: [],
            spectators: [],
            turns: [],
            custom: {}
        };

        data.push(game);

        await this.runEventListeners(DataStoreEvents.createGame, game, this);

        return game;
    }
    async findGame(gameId: string): Promise<Game | undefined> {
        return data.find((game: Game) => game.gameId === gameId);
    }
    async findGameWithCode(gameCode: string): Promise<Game | undefined> {
        return data.find((game: Game) => game.gameCode === gameCode);
    }
    async editGame(
        gameId: string,
        callback: (game: Game) => Promise<Game>
    ): Promise<Game> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        if (typeof callback === 'function') {
            return await callback(game);
        }

        return game;
    }
    async leaveGame(gameId: string, playerId: string): Promise<void> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        removeArrayItemWithFilter(
            game.players,
            (player: Player) => player.playerId === playerId
        );
        removeArrayItemWithFilter(
            game.spectators,
            (spectator: Spectator) => spectator.spectatorId === playerId
        );

        await this.runEventListeners(DataStoreEvents.leaveGame, game, this);

        return;
    }
    async startGame(gameId: string): Promise<Game> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        game.started = true;

        game.turns.push(await this.createTurn(gameId));

        await this.runEventListeners(DataStoreEvents.startGame, game, this);

        return game;
    }
    async endGame(gameId: string): Promise<void> {
        removeArrayItemWithFilter(data, (game: Game) => game.gameId === gameId);
        return;
    }

    async createPlayer(
        gameId: string,
        name?: string,
        avatar?: string
    ): Promise<Player> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        const player = {
            playerId: uuidv4(),
            gameId,
            name,
            avatar,
            isAdmin: game.players.length === 0,
            custom: {}
        };

        game.players.push(player);

        await this.runEventListeners(
            DataStoreEvents.createPlayer,
            player,
            this
        );

        return player;
    }
    async findPlayer(
        gameId: string,
        playerId: string
    ): Promise<Player | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        return game.players.find(
            (player: Player) => player.playerId === playerId
        );
    }
    async editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Promise<Player>
    ): Promise<Player> {
        const player = await this.findPlayer(gameId, playerId);

        if (!player) {
            throw new Error(`Player not found with id ${playerId}`);
        }

        if (typeof callback === 'function') {
            return await callback(player);
        }

        return player;
    }

    async createSpectator(gameId: string): Promise<Spectator> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        const spectator = {
            spectatorId: uuidv4(),
            gameId,
            name: '',
            custom: {}
        };

        game.spectators.push(spectator);

        await this.runEventListeners(
            DataStoreEvents.createSpectator,
            spectator,
            this
        );

        return spectator;
    }
    async findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        return game.spectators.find(
            (spectator: Spectator) => spectator.spectatorId === spectatorId
        );
    }
    async editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Promise<Spectator>
    ): Promise<Spectator> {
        const spectator = await this.findSpectator(gameId, spectatorId);

        if (!spectator) {
            throw new Error(`Spectator not found with id ${spectatorId}`);
        }

        if (typeof callback === 'function') {
            return await callback(spectator);
        }

        return spectator;
    }

    async createTurn(gameId: string): Promise<Turn> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        const turn = {
            turnId: uuidv4(),
            gameId,
            index: game.turns.length + 1,
            custom: {}
        };

        await this.runEventListeners(DataStoreEvents.createTurn, turn, this);

        return turn;
    }
    async findTurn(gameId: string, turnId: string): Promise<Turn | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        const turn = game.turns.find((turn: Turn) => turn.turnId === turnId);

        if (!turn) {
            throw new Error(`Turn with id ${turnId} not found!`);
        }

        return turn;
    }
    async currentTurn(gameId: string): Promise<Turn | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        if (game.turns.length > 0) {
            return game.turns[game.turns.length - 1];
        }

        return;
    }
    async editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn> {
        const turn = await this.findTurn(gameId, turnId);

        if (!turn) {
            throw new Error(`Turn not found with id ${turnId}`);
        }

        if (typeof callback === 'function') {
            return await callback(turn);
        }

        return turn;
    }
    async editCurrentTurn(
        gameId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn> {
        const turn = await this.currentTurn(gameId);

        if (!turn) {
            throw new Error(
                `Current turn not found for game with id ${gameId}`
            );
        }

        return await this.editTurn(gameId, turn.turnId, callback);
    }
    async endCurrentTurn(gameId: string): Promise<void> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        await this.editCurrentTurn(gameId, async (turn: Turn) => {
            await this.runEventListeners(
                DataStoreEvents.endCurrentTurn,
                turn,
                this
            );
            return turn;
        });

        if (game && game.turns) {
            const turn = await this.createTurn(gameId);

            turn.index = game.turns.length + 1;

            game.turns.push(turn);
        }

        return;
    }
}
