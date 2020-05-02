import { v4 as uuidv4 } from 'uuid';

import { generateRandomString, removeArrayItem } from '../../utils';

const data: Game[] = [];

const createUniqueGameCode = (): string => {
    let gameCode = generateRandomString();

    while (data.find((game: Game) => game.gameCode === gameCode)) {
        gameCode = generateRandomString();
    }

    return gameCode;
};

export class EphemeralDataStore implements DataStore {
    createGame(playerId?: string): Game {
        const game: Game = {
            gameId: uuidv4(),
            gameCode: createUniqueGameCode(),
            started: false,
            players: [this.createPlayer(playerId)],
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

        if (game && typeof callback === 'function') {
            return callback(game);
        }
        return game;
    }
    joinGame(gameId: string, player: Player): Game | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }

        if (!game.started && !this.findPlayer(gameId, player.playerId)) {
            game.players.push(player);
        } else if (
            game.started &&
            !this.findSpectator(gameId, player.playerId)
        ) {
            game.spectators.push(player);
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
            (player: any) => player.playerId === playerId
        );
        removeArrayItem(
            game.spectators,
            (player: any) => player.playerId === playerId
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
        removeArrayItem(data, (game: any) => game.gameId === gameId);
        return;
    }

    createPlayer(playerId = uuidv4()): Player {
        const player = {
            playerId,
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

        if (player && typeof callback === 'function') {
            return callback(player);
        }

        return player;
    }

    createSpectator(playerId = uuidv4()): Player {
        const player = {
            playerId,
            name: ''
        };

        return player;
    }
    findSpectator(gameId: string, playerId: string): Player | undefined {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);

        if (!game) {
            return;
        }
        return game.spectators.find(
            (player: Player) => player.playerId === playerId
        );
    }
    editSpectator(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Player
    ): Player | undefined {
        const player = this.findSpectator(gameId, playerId);

        if (player && typeof callback === 'function') {
            return callback(player);
        }

        return player;
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

        if (game && game.turns.length > 0) {
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

        if (turn && typeof callback === 'function') {
            return callback(turn);
        }

        return turn;
    }
    endTurn(gameId: string): void {
        const game = this.findGame(gameId) || this.findGameWithCode(gameId);
        const turn = this.createTurn();

        if (game && game.turns) {
            game.turns.push(turn);
        }

        return;
    }
}
