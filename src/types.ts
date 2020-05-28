export interface Listeners {
    addEventListener(
        type: string,
        callback: (data: any, datastore: DataStore) => Promise<void>
    ): void;
    removeEventListener(
        type: string,
        callback: (data: any, datastore: DataStore) => Promise<void>
    ): void;
    runEventListener(
        type: string,
        data: any,
        datastore: DataStore
    ): Promise<void>;
}

export interface DataStore extends Listeners {
    setup(): Promise<void>;
    createGame(): Promise<Game>;
    findGame(gameId: string | undefined): Promise<Game | undefined>;
    findGameWithCode(gameCode: string | undefined): Promise<Game | undefined>;
    editGame(
        gameId: string,
        callback: (game: Game) => Promise<Game>
    ): Promise<Game>;
    leaveGame(gameId: string, playerId: string): Promise<void>;
    startGame(gameId: string): Promise<Game>;
    endGame(gameId: string): Promise<void>;

    createPlayer(gameId: string, playerId?: string): Promise<Player>;
    findPlayer(gameId: string, playerId: string): Promise<Player | undefined>;
    editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Promise<Player>
    ): Promise<Player>;

    createSpectator(gameId: string, spectatorId?: string): Promise<Spectator>;
    findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined>;
    editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Promise<Spectator>
    ): Promise<Spectator>;

    createTurn(gameId: string): Promise<Turn>;
    findTurn(gameId: string, turnId: string): Promise<Turn | undefined>;
    currentTurn(gameId: string): Promise<Turn | undefined>;
    editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn>;
    editCurrentTurn(
        gameId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn>;
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
