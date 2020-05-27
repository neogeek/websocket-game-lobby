export interface DataStore {
    setup(): Promise<void>;
    createGame(): Promise<Game>;
    findGame(gameId: string | undefined): Promise<Game | undefined>;
    findGameWithCode(gameCode: string | undefined): Promise<Game | undefined>;
    editGame(
        gameId: string,
        callback: (game: Game) => Promise<Game>
    ): Promise<Game | undefined>;
    joinGame(
        gameId: string,
        player: Player | Spectator
    ): Promise<Game | undefined>;
    leaveGame(gameId: string, playerId: string): Promise<void>;
    startGame(gameId: string): Promise<Game | undefined>;
    endGame(gameId: string): Promise<void>;

    createPlayer(playerId?: string): Promise<Player>;
    findPlayer(gameId: string, playerId: string): Promise<Player | undefined>;
    editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Promise<Player>
    ): Promise<Player | undefined>;

    createSpectator(spectatorId?: string): Promise<Spectator>;
    findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined>;
    editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Promise<Spectator>
    ): Promise<Spectator | undefined>;

    createTurn(gameId: string): Promise<Turn>;
    findTurn(gameId: string, turnId: string): Promise<Turn | undefined>;
    currentTurn(gameId: string): Promise<Turn | undefined>;
    editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn | undefined>;
    endTurn(gameId: string): Promise<void>;
}

export interface Game {
    gameId: string;
    gameCode: string;
    started: boolean;
    players: Player[];
    spectators: Spectator[];
    turns: Turn[];
    custom: any;
}

export interface Player {
    playerId: string;
    gameId: string | null;
    name: string;
    isAdmin: boolean;
    custom: any;
}

export interface Spectator {
    spectatorId: string;
    gameId: string | null;
    name: string;
    custom: any;
}

export interface Turn {
    turnId: string;
    gameId: string | null;
    index: number;
    custom: any;
}
