interface DataStore {
    createGame(): Game;
    findGame(gameId: string): Game | undefined;
    findGameWithCode(gameCode: string): Game | undefined;
    editGame(gameId: string, callback: (game: Game) => {}): Game | undefined;
    joinGame(gameId: string, player: Player | Spectator): Game | undefined;
    leaveGame(gameId: string, playerId: string): void;
    startGame(gameId: string): Game | undefined;
    endGame(gameId: string): void;

    createPlayer(playerId?: string): Player;
    findPlayer(gameId: string, playerId: string): Player | undefined;
    editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => {}
    ): Player | undefined;

    createSpectator(spectatorId?: string): Spectator;
    findSpectator(gameId: string, spectatorId: string): Spectator | undefined;
    editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => {}
    ): Spectator | undefined;

    createTurn(): Turn;
    findTurn(gameId: string, turnId: string): Turn | undefined;
    currentTurn(gameId: string): Turn | undefined;
    editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => {}
    ): Turn | undefined;
    endTurn(gameId: string): void;
}

interface Game {
    gameId: string;
    gameCode: string;
    started: boolean;
    players: Player[];
    spectators: Spectator[];
    turns: Turn[];
}

interface Player {
    playerId: string;
    name: string;
}

interface Spectator {
    spectatorId: string;
    name: string;
}

interface Turn {
    turnId: string;
}
