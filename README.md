# websocket-game-lobby

> 🔧 Simple API for building games using WebSockets.

[![NPM Version](http://img.shields.io/npm/v/websocket-game-lobby.svg?style=flat)](https://www.npmjs.org/package/websocket-game-lobby)

## Install

```bash
$ npm install websocket-game-lobby
```

## Quick Start

The following example starts a WebSocket server and a single page HTTP server using [http-single-serve](https://www.npmjs.org/package/http-single-serve).

Without any additional code, this server can be connected to, and then a game can be `created`, `joined`, `started`, `left`, and `ended`. This can be done using either the [websocket-game-lobby-client](https://github.com/neogeek/websocket-game-lobby-client) package or the React hook [websocket-game-lobby-client-hooks](https://github.com/neogeek/websocket-game-lobby-client-hooks) package.

```javascript
const http = require('http-single-serve');

const { WebSocketGameLobbyServer } = require('websocket-game-lobby');

const gameLobby = new WebSocketGameLobbyServer({
    server: http({
        port: 5000
    })
});
```

Custom events can be added by using event listeners on either the server or the datastore.

For example, a custom event can be added to the server to set a property when a game is created. In the following example, a custom property with the key of `color` will be added with a value of `purple` when a game is created.

```javascript
const http = require('http-single-serve');

const { WebSocketGameLobbyServer } = require('websocket-game-lobby');

const gameLobby = new WebSocketGameLobbyServer({
    server: http({
        port: 5000
    })
});

gameLobby.addEventListener(
    'create',
    async ({ gameId, playerId }, datastore) => {
        await datastore.editGame(gameId, async game => {
            game.custom.color = 'purple';
            return game;
        });
    }
);
```

You can also create custom events, in addition to the built-in events, that can be called in the same way from the client.

```javascript
const http = require('http-single-serve');

const { WebSocketGameLobbyServer } = require('websocket-game-lobby');

const gameLobby = new WebSocketGameLobbyServer({
    server: http({
        port: 5000
    })
});

gameLobby.addEventListener(
    'card-played',
    async ({ gameId, playerId, turnId, playedCard }, datastore) => {
        await datastore.editTurn(gameId, turnId, async turn => {
            if (!turn.custom.playedCards) {
                turn.custom.playedCards = [];
            }
            turn.custom.playedCards.push({
                playerId,
                playedCard
            });
            return turn;
        });
    }
);
```

You can even set custom events directly on the datastore. In this example, we are manually creating a datastore and attaching an event. When a game is created, a custom property with the key of `createdDate` will be added with a value of `Date.now()`.

```javascript
const http = require('http-single-serve');

const {
    WebSocketGameLobbyServer,
    EphemeralDataStore
} = require('websocket-game-lobby');

const datastore = new EphemeralDataStore();

datastore.addEventListener('createGame', async (game, datastore) => {
    game.custom.createdDate = Date.now();
    return game;
});

const gameLobby = new WebSocketGameLobbyServer({
    server: http({
        port: 5000
    }),
    datastore
});
```

## API

### WebSocketGameLobbyServer

Event types for use with the WebSocketGameLobbyServer are as follows:

| Name     | Description                         |
| -------- | ----------------------------------- |
| `create` | Event fired when a game is created. |
| `join`   | Event fired when a game is joined.  |
| `leave`  | Event fired when a game is left.    |
| `start`  | Event fired when a game is started. |
| `end`    | Event fired when a game is ended.   |

Each event uses the same callback signature of `({gameId, playerId, ...rest}, datastore)`. The `rest` refers to all other key-value pairs recieved from client, including custom ones.

#### addEventListener

Add a new event callback method for an existing or new event type.

```javascript
const createHandler = async ({ gameId, playerId }, datastore) => {};

gameLobby.addEventListener('create', createHandler);
```

#### removeEventListener

Remove an existing event callback method. Callback must be a reference to the original added method.

```javascript
const createHandler = async ({ gameId, playerId }, datastore) => {};

gameLobby.removeEventListener('create', createHandler);
```

#### removeAllEventListeners

Remove all existing event callback methods.

```javascript
gameLobby.removeAllEventListeners();
```

### DataStore

There are two kinds of DataStore objects you can use; the default is `EphemeralDataStore`, which stores data in a temporary JavaScript object, and the other is `PostgresDataStore`.

#### EphemeralDataStore

```javascript
const { EphemeralDataStore } = require('websocket-game-lobby');

const datastore = new EphemeralDataStore();
```

#### PostgresDataStore

To connect to your database, add the following into an `.env` file in your project and setup the ENV variables on your server.

> WARNING: Make sure an add `.env` to your `.gitignore` file to prevent committing passwords to your git repository.

```
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=travis_ci_test
```

Then install [dotenv](https://www.npmjs.com/package/dotenv) and import it into your project. This will parse the variables in your `.env` file and expose them to your project for reading via the `process.env` object.

```javascript
require('dotenv').config();

const { PostgresDataStore } = require('websocket-game-lobby');

const datastore = new PostgresDataStore();
```

#### Event types

Event types for use with the DataStore are as follows:

| Name              | Description                              |
| ----------------- | ---------------------------------------- |
| `createGame`      | Event fired when a game is created.      |
| `leaveGame`       | Event fired when a game is left.         |
| `startGame`       | Event fired when a game is started.      |
| `createPlayer`    | Event fired when a player is created.    |
| `createSpectator` | Event fired when a spectator is created. |
| `createTurn`      | Event fired when a turn is created.      |
| `endCurrentTurn`  | Event fired when a turn is ended.        |

Each event uses the same callback signature of `(data, datastore)`. The `data` refers to the type of object is being modified, as referenced in the event name.

#### addEventListener

Add a new event callback method for an existing or new event type.

```javascript
const gameCreatedHandler = async (game, datastore) => {};

datastore.addEventListener('gameCreated', gameCreatedHandler);
```

#### removeEventListener

Remove an existing event callback method. Callback must be a reference to the original added method.

```javascript
const gameCreatedHandler = async (game, datastore) => {};

datastore.removeEventListener('gameCreated', gameCreatedHandler);
```

#### removeAllEventListeners

Remove all existing event callback methods.

```javascript
datastore.removeAllEventListeners();
```

#### findGame

Find a game using a UUID.

```javascript
const game = await datastore.findGame('8ca2ad81-093d-4352-8b96-780899e09d69');
```

#### findGameWithCode

Find a game using a game code.

```javascript
const game = await datastore.findGameWithCode('ABCD');
```

#### editGame

Edit game data.

```javascript
const editedGame = await datastore.editGame(gameId, async game => {
    return game;
});
```

#### findPlayer

Find player in a game using a UUID.

```javascript
const player = await datastore.findPlayer(gameId, playerId);
```

#### editPlayer

Edit player data.

```javascript
const editedPlayer = await datastore.editPlayer(
    gameId,
    playerId,
    async player => {
        return player;
    }
);
```

#### findSpectator

Find spectator in a game using a UUID.

```javascript
const spectator = await datastore.findSpectator(gameId, spectatorId);
```

#### editSpectator

Edit spectator data.

```javascript
const editedSpectator = await datastore.editSpectator(
    gameId,
    spectatorId,
    async spectator => {
        return spectator;
    }
);
```

#### findTurn

Find turn in a game using a UUID.

```javascript
const turn = await datastore.findTurn(gameId, turnId);
```

#### findCurrentTurn

Find the current turn in a game using a UUID.

```javascript
const turn = await datastore.findCurrentTurn(gameId);
```

#### editTurn

Edit turn data.

```javascript
const editedTurn = await datastore.editTurn(gameId, turnId, async turn => {
    return turn;
});
```

#### editCurrentTurn

Edit current turn data.

```javascript
const editedTurn = await datastore.editCurrentTurn(gameId, async turn => {
    return turn;
});
```

#### endCurrentTurn

Ends current turn and then creates a new turn in a game.

```javascript
await datastore.endCurrentTurn(gameId);
```

## Packages

| Package                                                                                           | Description                                     | Version                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [websocket-game-lobby-client](https://github.com/neogeek/websocket-game-lobby-client)             | Simple API for building games using WebSockets. | [![NPM Version](http://img.shields.io/npm/v/websocket-game-lobby-client.svg?style=flat)](https://www.npmjs.org/package/websocket-game-lobby-client)             |
| [websocket-game-lobby-client-hooks](https://github.com/neogeek/websocket-game-lobby-client-hooks) | React hooks for use with `websocket-game-lobby` | [![NPM Version](http://img.shields.io/npm/v/websocket-game-lobby-client-hooks.svg?style=flat)](https://www.npmjs.org/package/websocket-game-lobby-client-hooks) |
| [websocket-game-lobby-template](https://github.com/neogeek/websocket-game-lobby-template)         | Template built with `websocket-game-lobby`      |                                                                                                                                                                 |
