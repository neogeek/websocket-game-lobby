import { v4 as uuidv4 } from 'uuid';

import {
    createUniqueGameCode,
    removeArrayItemWithFilter,
    isPlayer,
    isSpectator
} from '../utils';

import Listeners from '../listeners';

import { DataStore, Game, Player, Spectator, Turn } from '../types';

let data: Game[] = [];

export class EphemeralDataStore extends Listeners implements DataStore {
    constructor() {
        super({
            createGame: [],
            joinGame: [],
            leaveGame: [],
            startGame: [],
            createPlayer: [],
            createSpectator: [],
            createTurn: [],
            endTurn: []
        });
    }

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

        await this.runEventListener('createGame', game, this);

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
    ): Promise<Game | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(game);
        }

        return game;
    }
    async joinGame(
        gameId: string,
        player: Player | Spectator
    ): Promise<Game | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        } else if (
            isPlayer(player) &&
            !(await this.findPlayer(gameId, (player as Player).playerId))
        ) {
            game.players.push(player as Player);

            await this.editPlayer(gameId, player.playerId, async player => {
                player.gameId = gameId;
                player.isAdmin = game.players.length === 1;
                return player;
            });
        } else if (
            isSpectator(player) &&
            !(await this.findSpectator(
                gameId,
                (player as Spectator).spectatorId
            ))
        ) {
            game.spectators.push(player as Spectator);

            await this.editSpectator(
                gameId,
                player.spectatorId,
                async spectator => {
                    spectator.gameId = gameId;
                    return spectator;
                }
            );
        }

        await this.runEventListener('joinGame', game, this);

        return game;
    }
    async leaveGame(gameId: string, playerId: string): Promise<void> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        }

        removeArrayItemWithFilter(
            game.players,
            (player: Player) => player.playerId === playerId
        );
        removeArrayItemWithFilter(
            game.spectators,
            (spectator: Spectator) => spectator.spectatorId === playerId
        );

        await this.runEventListener('leaveGame', game, this);

        return;
    }
    async startGame(gameId: string): Promise<Game | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        }

        game.turns.push(await this.createTurn(gameId));

        game.started = true;

        await this.runEventListener('startGame', game, this);

        return game;
    }
    async endGame(gameId: string): Promise<void> {
        removeArrayItemWithFilter(data, (game: Game) => game.gameId === gameId);
        return;
    }

    async createPlayer(playerId?: string): Promise<Player> {
        const player = {
            playerId: playerId || uuidv4(),
            gameId: null,
            name: '',
            isAdmin: false,
            custom: {}
        };

        await this.runEventListener('createPlayer', player, this);

        return player;
    }
    async findPlayer(
        gameId: string,
        playerId: string
    ): Promise<Player | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        }

        return game.players.find(
            (player: Player) => player.playerId === playerId
        );
    }
    async editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Promise<Player>
    ): Promise<Player | undefined> {
        const player = await this.findPlayer(gameId, playerId);

        if (!player) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(player);
        }

        return player;
    }

    async createSpectator(spectatorId?: string): Promise<Spectator> {
        const spectator = {
            spectatorId: spectatorId || uuidv4(),
            gameId: null,
            name: '',
            custom: {}
        };

        await this.runEventListener('createSpectator', spectator, this);

        return spectator;
    }
    async findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        }

        return game.spectators.find(
            (spectator: Spectator) => spectator.spectatorId === spectatorId
        );
    }
    async editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Promise<Spectator>
    ): Promise<Spectator | undefined> {
        const spectator = await this.findSpectator(gameId, spectatorId);

        if (!spectator) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(spectator);
        }

        return spectator;
    }

    async createTurn(gameId: string): Promise<Turn> {
        const turn = {
            turnId: uuidv4(),
            gameId,
            index: 1,
            custom: {}
        };

        await this.runEventListener('createTurn', turn, this);

        return turn;
    }
    async findTurn(gameId: string, turnId: string): Promise<Turn | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        }

        return game.turns.find((turn: Turn) => turn.turnId === turnId);
    }
    async currentTurn(gameId: string): Promise<Turn | undefined> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        } else if (game.turns.length > 0) {
            return game.turns[game.turns.length - 1];
        }

        return;
    }
    async editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn | undefined> {
        const turn = await this.findTurn(gameId, turnId);

        if (!turn) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(turn);
        }

        return turn;
    }
    async editCurrentTurn(
        gameId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn | undefined> {
        const turn = await this.currentTurn(gameId);

        if (!turn) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(turn);
        }

        return turn;
    }
    async endTurn(gameId: string): Promise<void> {
        const game = await this.findGame(gameId);

        if (!game) {
            return;
        }

        this.editCurrentTurn(gameId, async (turn: Turn) => {
            await this.runEventListener('endTurn', turn, this);
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
