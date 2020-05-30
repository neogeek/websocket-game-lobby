import WebSocketEventWrapper from 'websocket-event-wrapper';

import qs from 'qs';

import { EphemeralDataStore } from './datastore';

import Listeners from './listeners';

import { Client, DataStore, Response } from './types';

export class WebSocketGameLobbyServer extends Listeners {
    wss: any;

    datastore: DataStore;

    constructor({
        port,
        server,
        datastore
    }: {
        port: number;
        server: any;
        datastore: DataStore;
    }) {
        super({
            create: [],
            join: [],
            start: [],
            leave: [],
            end: []
        });

        this.wss = new WebSocketEventWrapper({
            port,
            server,
            onConnect: async (client: Client, request: any): Promise<void> => {
                const { gameId, gameCode, playerId } = qs.parse(
                    request.url.replace(/^\//, ''),
                    {
                        ignoreQueryPrefix: true
                    }
                );

                client.gameId = gameId;
                client.gameCode = gameCode;
                client.playerId = playerId;

                this.wss.send(await this.sendUpdate(client), client);
            }
        });

        if (datastore) {
            this.datastore = datastore;
        } else {
            this.datastore = new EphemeralDataStore();
        }

        this.datastore.setup();

        this.wss.addEventListener(
            async (
                {
                    type,
                    gameId,
                    gameCode,
                    playerId,
                    forceSpectator,
                    ...rest
                }: {
                    type: string;
                    gameId?: string;
                    gameCode?: string;
                    playerId: string;
                    forceSpectator: boolean;
                },
                client: Client
            ) => {
                if (!(type in this.listeners)) {
                    return;
                }

                const game =
                    (await this.datastore.findGame(gameId)) ||
                    (await this.datastore.findGameWithCode(gameCode)) ||
                    (await this.datastore
                        .createGame()
                        .catch(e =>
                            this.wss.send({ error: e.message }, client)
                        ));

                if (!game) {
                    return;
                }

                client.gameId = game.gameId;

                let player = await this.datastore.findPlayer(
                    client.gameId,
                    playerId
                );
                let spectator = await this.datastore.findSpectator(
                    client.gameId,
                    playerId
                );

                if (player) {
                    client.playerId = player.playerId;
                } else if (spectator) {
                    client.playerId = spectator.spectatorId;
                } else if (game.started || forceSpectator) {
                    spectator = await this.datastore.createSpectator(
                        client.gameId,
                        playerId
                    );

                    client.playerId = spectator.spectatorId;
                } else {
                    player = await this.datastore.createPlayer(
                        client.gameId,
                        playerId
                    );

                    client.playerId = player.playerId;
                }

                if (type === 'start') {
                    await this.datastore
                        .startGame(client.gameId)
                        .catch(e =>
                            this.wss.send({ error: e.message }, client)
                        );
                } else if (type === 'leave') {
                    await this.datastore
                        .leaveGame(client.gameId, client.playerId)
                        .catch(e =>
                            this.wss.send({ error: e.message }, client)
                        );

                    client.gameId = '';
                    client.playerId = '';

                    this.wss.send({}, client);
                } else if (type === 'end') {
                    await this.datastore.endGame(client.gameId);

                    client.gameId = '';
                    client.playerId = '';

                    this.wss.send({}, client);
                }

                await this.runEventListeners(
                    type,
                    {
                        type,
                        gameId: client.gameId,
                        playerId: client.playerId,
                        ...rest
                    },
                    this.datastore
                );

                await this.broadcastUpdate(game.gameId);
            }
        );
    }

    async sendUpdate(client: Client): Promise<Partial<Response>> {
        const game =
            (await this.datastore.findGame(client.gameId)) ||
            (await this.datastore.findGameWithCode(client.gameCode));

        if (game) {
            const player = await this.datastore.findPlayer(
                game.gameId,
                client.playerId
            );
            const spectator = await this.datastore.findSpectator(
                game.gameId,
                client.playerId
            );
            const turn = await this.datastore.currentTurn(game.gameId);

            if (game && (player || spectator)) {
                return { game, player, spectator, turn };
            }
        }

        client.gameId = '';
        client.playerId = '';

        return {};
    }

    async broadcastUpdate(gameId: string): Promise<void> {
        this.wss.broadcast(
            async (client: Client) => await this.sendUpdate(client),
            (client: Client) => client.gameId === gameId
        );
    }
}
