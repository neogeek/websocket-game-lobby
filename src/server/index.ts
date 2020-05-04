import WebSocketEventWrapper from 'websocket-event-wrapper';

import qs from 'qs';

import { EphemeralDataStore } from './datastore';

import { removeArrayItem } from '../utils';

import { DataStore } from '../types';

export class WebSocketGameLobbyServer {
    wss: any;

    datastore: DataStore;

    listeners: any;

    constructor({
        port,
        server,
        datastore
    }: {
        port: number;
        server: object;
        datastore: DataStore;
    }) {
        this.wss = new WebSocketEventWrapper({
            port,
            server,
            onConnect: (client: any, request: any): void => {
                const { gameId, playerId } = qs.parse(
                    request.url.replace(/^\//, ''),
                    {
                        ignoreQueryPrefix: true
                    }
                );

                client.gameId = gameId;
                client.playerId = playerId;

                this.sendUpdate(client);
            }
        });

        if (datastore) {
            this.datastore = datastore;
        } else {
            this.datastore = new EphemeralDataStore();
        }

        this.listeners = Object.freeze({
            create: [],
            join: [],
            start: [],
            leave: [],
            end: []
        });

        this.wss.addEventListener(
            (
                {
                    type,
                    gameId,
                    playerId,
                    ...rest
                }: { type: string; gameId: string; playerId: string },
                client: any
            ) => {
                if (!(type in this.listeners)) {
                    return;
                }

                let game =
                    this.datastore.findGame(gameId) ||
                    this.datastore.findGameWithCode(gameId);

                if (!game) {
                    try {
                        game = this.datastore.createGame();
                    } catch (e) {
                        this.wss.send({ error: e.message }, client);

                        return;
                    }
                }

                client.gameId = game.gameId;

                let player = this.datastore.findPlayer(client.gameId, playerId);
                let spectator = this.datastore.findSpectator(
                    client.gameId,
                    client.playerId
                );

                if (player) {
                    client.playerId = player.playerId;
                } else if (spectator) {
                    client.playerId = spectator.spectatorId;
                } else if (!game.started) {
                    player = this.datastore.createPlayer(playerId);

                    client.playerId = player.playerId;

                    this.datastore.joinGame(client.gameId, player);
                } else {
                    spectator = this.datastore.createSpectator(playerId);

                    client.playerId = spectator.spectatorId;

                    this.datastore.joinGame(client.gameId, spectator);
                }

                if (type === 'start') {
                    this.datastore.startGame(client.gameId);
                } else if (type === 'leave') {
                    this.datastore.leaveGame(client.gameId, client.playerId);

                    client.gameId = '';
                    client.playerId = '';

                    this.wss.send({}, client);
                } else if (type === 'end') {
                    this.datastore.endGame(client.gameId);

                    client.gameId = '';
                    client.playerId = '';

                    this.wss.send({}, client);
                }

                this.listeners[type].forEach(
                    (callback: (client: any, datastore: DataStore) => {}) =>
                        callback(
                            {
                                type,
                                gameId: client.gameId,
                                playerId: client.playerId,
                                ...rest
                            },
                            this.datastore
                        )
                );

                this.broadcastUpdate(game.gameId);
            }
        );
    }

    addEventListener(type: string, callback: () => void): void {
        if (!(type in this.listeners)) {
            this.listeners = Object.freeze({ ...this.listeners, [type]: [] });
        }
        this.listeners[type].push(callback);
    }

    removeEventListener(type: string, callback: () => void): void {
        if (type in this.listeners) {
            removeArrayItem(
                this.listeners[type],
                (item: any) => item === callback
            );
        }
    }

    sendUpdate(client: any): void {
        const game =
            this.datastore.findGame(client.gameId) ||
            this.datastore.findGameWithCode(client.gameId);
        const player = this.datastore.findPlayer(
            client.gameId,
            client.playerId
        );
        const spectator = this.datastore.findSpectator(
            client.gameId,
            client.playerId
        );
        const turn = this.datastore.currentTurn(client.gameId);

        if (game && (player || spectator)) {
            this.wss.send({ game, player, spectator, turn }, client);
        } else {
            client.gameId = '';
            client.playerId = '';

            this.wss.send({}, client);
        }
    }

    broadcastUpdate(gameId: string): void {
        this.wss.broadcast(
            (client: any) => this.sendUpdate(client),
            (client: any) => client.gameId === gameId
        );
    }
}
