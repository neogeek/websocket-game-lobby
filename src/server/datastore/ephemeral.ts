import { v4 as uuidv4 } from 'uuid';

import { createUniqueGameCode, removeArrayItem } from '../../utils';

import { DataStore, Game, Player, Spectator, Turn } from '../../types';

const data: Game[] = [];

export class EphemeralDataStore implements DataStore {
    createGame(): Game {
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
    findGame(gameId: string): Game | undefined {
        return data.find((game: Game) => game.gameId === gameId);
    }
    findGameWithCode(gameCode: string): Game | undefined {
        return data.find((game: Game) => game.gameCode === gameCode);
    }
    editGame(gameId: string, callback: (game: Game) => Game): Game | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        } else if (typeof callback === 'function') {
            return callback(game);
        }

        return game;
    }
    joinGame(gameId: string, player: Player | Spectator): Game | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        if (
            !game.started &&
            !this.findPlayer(gameId, (player as Player).playerId)
        ) {
            game.players.push(player as Player);
        } else if (
            game.started &&
            !this.findSpectator(gameId, (player as Spectator).spectatorId)
        ) {
            game.spectators.push(player as Spectator);
        }

        return game;
    }
    leaveGame(gameId: string, playerId: string): void {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

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
    startGame(gameId: string): Game | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        const turn = this.createTurn();

        game.turns.push(turn);

        game.started = true;

        return game;
    }
    endGame(gameId: string): void {
        removeArrayItem(data, (game: Game) => game.gameId === gameId);
        return;
    }

    createPlayer(playerId?: string): Player {
        const player = {
            playerId: playerId || uuidv4(),
            name: ''
        };

        return player;
    }
    findPlayer(gameId: string, playerId: string): Player | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        return game.players.find(
            (player: Player) => player.playerId === playerId
        );
    }
    editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Player
    ): Player | undefined {
        const player = this.findPlayer(gameId, playerId);

        if (!player) {
            return;
        } else if (typeof callback === 'function') {
            return callback(player);
        }

        return player;
    }

    createSpectator(spectatorId?: string): Spectator {
        const spectator = {
            spectatorId: spectatorId || uuidv4(),
            name: ''
        };

        return spectator;
    }
    findSpectator(gameId: string, spectatorId: string): Spectator | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        return game.spectators.find(
            (spectator: Spectator) => spectator.spectatorId === spectatorId
        );
    }
    editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Spectator
    ): Spectator | undefined {
        const spectator = this.findSpectator(gameId, spectatorId);

        if (!spectator) {
            return;
        } else if (typeof callback === 'function') {
            return callback(spectator);
        }

        return spectator;
    }

    createTurn(): Turn {
        const turn = {
            turnId: uuidv4()
        };

        return turn;
    }
    findTurn(gameId: string, turnId: string): Turn | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        return game.turns.find((turn: Turn) => turn.turnId === turnId);
    }
    currentTurn(gameId: string): Turn | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        } else if (game.turns.length > 0) {
            return game.turns[game.turns.length - 1];
        }

        return;
    }
    editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Turn
    ): Turn | undefined {
        const turn = this.findTurn(gameId, turnId);

        if (!turn) {
            return;
        } else if (typeof callback === 'function') {
            return callback(turn);
        }

        return turn;
    }
    endTurn(gameId: string): void {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        if (game && game.turns) {
            game.turns.push(this.createTurn());
        }

        return;
    }
}
