# websocket-game-lobby

> 🔧 Simple API for building games using WebSockets.

[![NPM Version](http://img.shields.io/npm/v/websocket-game-lobby.svg?style=flat)](https://www.npmjs.org/package/websocket-game-lobby)
[![Build Status](https://travis-ci.com/neogeek/websocket-game-lobby.svg?branch=master)](https://travis-ci.com/neogeek/websocket-game-lobby)
[![codecov](https://img.shields.io/codecov/c/github/neogeek/websocket-game-lobby/master.svg)](https://codecov.io/gh/neogeek/websocket-game-lobby)

## Install

```bash
$ npm install websocket-game-lobby
```

## Setup

### Server

The `WebSocketGameLobbyServer` class uses an ephemeral service as it's default datastore. You can replace it with your own by extending the datastore interface found in [src/types.ts](src/types.ts).

```javascript
const { WebSocketGameLobbyServer } = require('websocket-game-lobby');

const gameLobby = new WebSocketGameLobbyServer({ port: 5000 });

gameLobby.addEventListener(
    'create',
    async ({ gameId, playerId }, datastore) => {
        await datastore.editGame(gameId, data => {
            data.test = 'test';
        });
    }
);
```

### Client

```javascript
import { WebSocketGameLobbyClient } from 'websocket-game-lobby';

const gameLobby = new WebSocketGameLobbyClient({ port: 5000 });

gameLobby.addEventListener('message', ({ data }) => {
    console.log(JSON.parse(data));
});

buttonElem.addEventListener('click', () => gameLobby.send('create'));
```

## API

### WebSocketGameLobbyServer

#### Constructor

WebSocket server is powered by <https://github.com/neogeek/websocket-event-wrapper> and <https://github.com/websockets/ws>.

**NOTE:** Either a `port` or `server` is required for the `WebSocketGameLobbyClient` to start.

```javascript
const gameLobby = new WebSocketGameLobbyServer({ port: 5000 });
```

| Name        | Description                                    | Default Value         |
| ----------- | ---------------------------------------------- | --------------------- |
| `port`      | Port to run WebSocket.                         | `null`                |
| `server`    | The server to along with the WebSocket server. | Node.js HTTP/S Server |
| `datastore` | When a websocket connection is lost.           | EphemeralDataStore    |

#### Listeners

```javascript
gameLobby.addEventListener(
    'create',
    ({ gameId, playerId, ...rest }, datastore) => {}
);
```

| Name     | Description                                                                  | Parameters                                   |
| -------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `create` | Event fired when a game is created.                                          | `({ gameId, playerId, ...rest }, datastore)` |
| `join`   | Event fired when a player joins a game or refreshes with the same game code. | `({ gameId, playerId, ...rest }, datastore)` |
| `leave`  | Event fired when a player leaves a game.                                     | `({ gameId, playerId, ...rest }, datastore)` |
| `start`  | Event fired when a game is started.                                          | `({ gameId, playerId, ...rest }, datastore)` |
| `end`    | Event fired when a game is ended.                                            | `({ gameId, playerId, ...rest }, datastore)` |

#### Custom Listeners

The server supports adding your own custom event listeners.

```javascript
gameLobby.addEventListener(
    'card-played',
    ({ gameId, playerId }, datastore) => {}
);
```

### WebSocketGameLobbyClient

WebSocket client is powered by <https://github.com/pladaria/reconnecting-websocket>.

#### Constructor

```javascript
const gameLobby = new WebSocketGameLobbyClient({ port: 5000 });
```

#### Listeners

```javascript
gameLobby.addEventListener('message', ({ data }) => {
    console.log(JSON.parse(data));
});
```

| Name      | Description                                  | Parameters |
| --------- | -------------------------------------------- | ---------- |
| `open`    | When a websocket connections is established. | `({data})` |
| `message` | When a message is received.                  | `({data})` |
| `close`   | When a websocket connection is lost.         | `({data})` |
