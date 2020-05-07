import { v4 as uuidv4 } from 'uuid';

import { createUniqueGameCode, removeArrayItem } from '../../utils';

import { DataStore, Game, Player, Spectator, Turn } from '../../types';

const data: Game[] = [];

export class EphemeralDataStore implements DataStore {
    async createGame(): Promise<Game> {
        const game: Game = {
            gameId: uuidv4(),
            gameCode: createUniqueGameCode(gameCode =>
                Boolean(data.find((game: Game) => game.gameCode === gameCode))
            ),
            started: false,
            players: [],
            spectators: [],
            turns: []
        };

        data.push(game);

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
        callback: (game: Game) => Game
    ): Promise<Game | undefined> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

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
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

        if (!game) {
            return;
        }

        if (
            !game.started &&
            !(await this.findPlayer(gameId, (player as Player).playerId))
        ) {
            game.players.push(player as Player);
        } else if (
            game.started &&
            !(await this.findSpectator(
                gameId,
                (player as Spectator).spectatorId
            ))
        ) {
            game.spectators.push(player as Spectator);
        }

        return game;
    }
    async leaveGame(gameId: string, playerId: string): Promise<void> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

        if (!game) {
            return;
        }

        removeArrayItem(
            game.players,
            (player: Player) => player.playerId === playerId
        );
        removeArrayItem(
            game.spectators,
            (spectator: Spectator) => spectator.spectatorId === playerId
        );

        return;
    }
    async startGame(gameId: string): Promise<Game | undefined> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

        if (!game) {
            return;
        }

        const turn = await this.createTurn();

        game.turns.push(turn);

        game.started = true;

        return game;
    }
    async endGame(gameId: string): Promise<void> {
        removeArrayItem(data, (game: Game) => game.gameId === gameId);
        return;
    }

    async createPlayer(playerId?: string): Promise<Player> {
        const player = {
            playerId: playerId || uuidv4(),
            name: ''
        };

        return player;
    }
    async findPlayer(
        gameId: string,
        playerId: string
    ): Promise<Player | undefined> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

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
        callback: (player: Player) => Player
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
            name: ''
        };

        return spectator;
    }
    async findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

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
        callback: (spectator: Spectator) => Spectator
    ): Promise<Spectator | undefined> {
        const spectator = await this.findSpectator(gameId, spectatorId);

        if (!spectator) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(spectator);
        }

        return spectator;
    }

    async createTurn(): Promise<Turn> {
        const turn = {
            turnId: uuidv4()
        };

        return turn;
    }
    async findTurn(gameId: string, turnId: string): Promise<Turn | undefined> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

        if (!game) {
            return;
        }

        return game.turns.find((turn: Turn) => turn.turnId === turnId);
    }
    async currentTurn(gameId: string): Promise<Turn | undefined> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

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
        callback: (turn: Turn) => Turn
    ): Promise<Turn | undefined> {
        const turn = await this.findTurn(gameId, turnId);

        if (!turn) {
            return;
        } else if (typeof callback === 'function') {
            return await callback(turn);
        }

        return turn;
    }
    async endTurn(gameId: string): Promise<void> {
        const game =
            (await this.findGame(gameId)) ||
            (await this.findGameWithCode(gameId));

        if (!game) {
            return;
        }

        if (game && game.turns) {
            game.turns.push(await this.createTurn());
        }

        return;
    }
}
