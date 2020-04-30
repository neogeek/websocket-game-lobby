interface DataStore {
    createGame(playerId?: string): Game;
    findGame(gameId: string): Game | undefined;
    findGameWithCode(gameCode: string): Game | undefined;
    editGame(gameId: string, callback: (game: Game) => {}): Game | undefined;
    joinGame(gameId: string, player: Player): Game | undefined;
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

    createSpectator(playerId?: string): Player;
    findSpectator(gameId: string, playerId: string): Player | undefined;
    editSpectator(
        gameId: string,
        playerId: string,
        callback: (player: Player) => {}
    ): Player | undefined;

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
    spectators: Player[];
    turns: Turn[];
}

interface Player {
    playerId: string;
    name: string;
}

interface Turn {
    turnId: string;
}
