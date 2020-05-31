export interface Listeners {
    /** Add a new event callback method for an existing or new event type.
     * @param type - An event type.
     * @param callback - An asynchronous callback method used to make edits directly to a data source.
     */
    addEventListener(
        type: string,
        callback: (data: any, datastore: DataStore) => Promise<void>
    ): void;
    /** Remove an existing event callback method.
     * @param type - An event type.
     * @param callback - Reference to an asynchronous callback method used to make edits directly to a data source.
     */
    removeEventListener(
        type: string,
        callback: (data: any, datastore: DataStore) => Promise<void>
    ): void;
    /** Remove all existing event callback methods. */
    removeAllEventListeners(): void;
    /** Run all existing event callback methods for a specific event type.
     * @param type - An event type.
     * @param data - Data specific to the event type.
     * @param datastore - Reference to the current datastore.
     * @private
     */
    runEventListeners(
        type: string,
        data: any,
        datastore: DataStore
    ): Promise<void>;
}

export interface DataStore extends Listeners {
    /** Run setup on datastore.
     * @private
     */
    setup(): Promise<void>;
    /** Creates a game.
     * > **NOTE:** Calling this function will also run any events with the type createGame.
     * @private
     */
    createGame(): Promise<Game>;
    /**
     * Find a game using a UUID.
     * @param gameId - A UUID representing the game to look up.
     */
    findGame(gameId: string | undefined): Promise<Game | undefined>;
    /** Find a game using a game code.
     * @param gameCode - A unique four letter game code representing the game to look up.
     */
    findGameWithCode(gameCode: string | undefined): Promise<Game | undefined>;
    /** Edit game data.
     * @param gameId - A UUID representing the game to edit.
     * @param callback - An asynchronous callback method used to make edits directly to the game and other data sources.
     */
    editGame(
        gameId: string,
        callback: (game: Game) => Promise<Game>
    ): Promise<Game>;
    /** Leave game.
     * > **NOTE:** Calling this function will also run any events with the type leaveGame.
     * @param gameId - A UUID representing the game to leave.
     * @param playerId - A UUID representing the player or spectator to leave.
     * @private
     */
    leaveGame(gameId: string, playerId: string): Promise<void>;
    /** Start game.
     * > **NOTE:** Calling this function will also run any events with the type startGame.
     * @param gameId - A UUID representing the game to start.
     * @private
     */
    startGame(gameId: string): Promise<Game>;
    /** End game.
     * @param gameId - A UUID representing the game to end.
     * @private
     */
    endGame(gameId: string): Promise<void>;

    /** Creates a player in a game. Player will be assigned as admin if they are the first in the game.
     * > **NOTE:** Calling this function will also run any events with the type createPlayer.
     * @param gameId - A UUID representing the game to create a player for.
     * @private
     */
    createPlayer(gameId: string): Promise<Player>;
    /**
     * Find player in a game using a UUID.
     * @param gameId - A UUID representing the game to look up.
     * @param playerId - A UUID representing the player to look up.
     */
    findPlayer(gameId: string, playerId: string): Promise<Player | undefined>;
    /** Edit player data.
     * @param gameId - A UUID representing the game to look up.
     * @param playerId - A UUID representing the player to edit.
     * @param callback - An asynchronous callback method used to make edits directly to the player and other data sources.
     */
    editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Promise<Player>
    ): Promise<Player>;

    /** Creates a spectator in a game.
     * > **NOTE:** Calling this function will also run any events with the type createSpectator.
     * @param gameId - A UUID representing the game to create a spectator for.
     * @private
     */
    createSpectator(gameId: string): Promise<Spectator>;
    /**
     * Find spectator in a game using a UUID.
     * @param gameId - A UUID representing the game to look up.
     * @param spectatorId - A UUID representing the spectator to look up.
     */
    findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined>;
    /** Edit player data.
     * @param gameId - A UUID representing the game to look up.
     * @param spectatorId - A UUID representing the spectator to edit.
     * @param callback - An asynchronous callback method used to make edits directly to the spectator and other data sources.
     */
    editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Promise<Spectator>
    ): Promise<Spectator>;

    /** Creates a new turn in a game.
     * > **NOTE:** Calling this function will also run any events with the type createTurn.
     * @param gameId - A UUID representing the game in which to create a turn.
     * @private
     */
    createTurn(gameId: string): Promise<Turn>;
    /**
     * Find turn in a game using a UUID.
     * @param gameId - A UUID representing the game to look up.
     * @param turnId - A UUID representing the turn to look up.
     */
    findTurn(gameId: string, turnId: string): Promise<Turn | undefined>;
    /**
     * Find the current turn in a game using a UUID.
     * @param gameId - A UUID representing the game to look up.
     */
    currentTurn(gameId: string): Promise<Turn | undefined>;
    /** Edit turn data.
     * @param gameId - A UUID representing the game to look up.
     * @param turnId - A UUID representing the turn to edit.
     * @param callback - An asynchronous callback method used to make edits directly to the turn and other data sources.
     */
    editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn>;
    /** Edit current turn data.
     * @param gameId - A UUID representing the game to look up.
     * @param callback - An asynchronous callback method used to make edits directly to the current turn and other data sources.
     */
    editCurrentTurn(
        gameId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn>;
    /** Ends current turn and creates a new turn in a game.
     * > **NOTE:** Calling this function will also run any events with the type endCurrentTurn.
     * @param gameId - A UUID representing the game in which to end the current turn.
     */
    endCurrentTurn(gameId: string): Promise<void>;
}

/** Types to be used with event listeners attached to {@link DataStore} objects. */
export enum DataStoreEvents {
    /** Event fired when game is created. */
    createGame = 'createGame',
    /** Event fired when player or spectator leaves game. */
    leaveGame = 'leaveGame',
    /** Event fired when game is started. */
    startGame = 'startGame',
    /** Event fired when player is created. */
    createPlayer = 'createPlayer',
    /** Event fired when spectator is created. */
    createSpectator = 'createSpectator',
    /** Event fired when turn is created. */
    createTurn = 'createTurn',
    /** Event fired when current turn is ended. */
    endCurrentTurn = 'endCurrentTurn'
}

/** Types to be used with event listeners attached to the {@link WebSocketGameLobbyServer}. */
export enum ServerEvents {
    /** Event fired when game is created. */
    create = 'create',
    /** Event fired when game is joined. */
    join = 'join',
    /** Event fired when game is left. */
    leave = 'leave',
    /** Event fired when game is started. */
    start = 'start',
    /** Event fired when game is ended. */
    end = 'end'
}

export interface Game {
    /** A UUID representing a game. */
    gameId: string;
    /** A unique four letter game code representing a game. */
    gameCode: string;
    /** A flag indicating if the game has started. */
    started: boolean;
    /** An array of active players. */
    players: Player[];
    /** An array of active spectators. */
    spectators: Spectator[];
    /** An array of all of turns taken in the game. */
    turns: Turn[];
    /** A custom object for storing application specific data. */
    custom: any;
}

export interface Player {
    /** A UUID representing a player. */
    playerId: string;
    /** A UUID representing a game. */
    gameId: string | null;
    /** Name of the player. */
    name: string;
    /** A flag indicating if the player is the admin.
     * This is true if they are the first player to join the game.
     */
    isAdmin: boolean;
    /** A custom object for storing application specific data. */
    custom: any;
}

export interface Spectator {
    /** A UUID representing a spectator. */
    spectatorId: string;
    /** A UUID representing a game. */
    gameId: string | null;
    /** Name of the spectator. */
    name: string;
    /** A custom object for storing application specific data. */
    custom: any;
}

export interface Turn {
    /** A UUID representing a turn. */
    turnId: string;
    /** A UUID representing a game. */
    gameId: string | null;
    /** Turn number. This value auto-increments. */
    index: number;
    /** A custom object for storing application specific data. */
    custom: any;
}

export interface Client {
    /** A UUID representing a game. */
    gameId: string;
    /** A unique four letter game code representing a game. */
    gameCode: string;
    /** A UUID representing a player or spectator. */
    playerId: string;
}

export interface Response {
    /** Reference to the active game. */
    game: Game;
    /** Reference to the active player. */
    player: Player | undefined;
    /** Reference to the active spectator. */
    spectator: Spectator | undefined;
    /** Reference to the active turn. */
    turn: Turn | undefined;
}
