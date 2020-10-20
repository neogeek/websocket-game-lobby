import WebSocketEventWrapper from 'websocket-event-wrapper';

import { EphemeralDataStore } from './datastore';

import Listeners from './listeners';

import { Client, IDataStore, Response, ServerEvents } from './types';

export class WebSocketGameLobbyServer extends Listeners<ServerEvents> {
    listeners: any = Object.keys(ServerEvents).reduce((acc, curr) => {
        return {
            [curr]: [],
            ...acc
        };
    }, {});

    wss: any;

    datastore: IDataStore;

    constructor({
        port,
        server,
        datastore
    }: {
        port: number;
        server: any;
        datastore: IDataStore;
    }) {
        super();

        this.wss = new WebSocketEventWrapper({
            port,
            server,
            onConnect: async (client: Client, request: any): Promise<void> => {
                const params = new URLSearchParams(request.url.substring(1));

                client.gameId = params.get('gameId') || '';
                client.gameCode = params.get('gameCode') || '';
                client.playerId = params.get('playerId') || '';

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
                    forceSpectator,
                    ...rest
                }:
                    | {
                          type: ServerEvents;
                          gameId?: string;
                          gameCode?: string;
                          forceSpectator: boolean;
                      }
                    | any,
                client: Client
            ) => {
                if (!this.listeners[type]) {
                    return;
                }

                if (type === 'create' || type === 'join') {
                    const game =
                        (await this.datastore.findGame(gameId)) ||
                        (await this.datastore.findGameWithCode(gameCode)) ||
                        (await this.datastore.createGame());

                    if (!game) {
                        return;
                    }

                    client.gameId = game.gameId;

                    if (!client.playerId) {
                        if (game.started || forceSpectator) {
                            const spectator = await this.datastore.createSpectator(
                                client.gameId
                            );

                            client.playerId = spectator.spectatorId;
                        } else {
                            const player = await this.datastore.createPlayer(
                                client.gameId
                            );

                            client.playerId = player.playerId;
                        }
                    }
                } else if (type === 'start') {
                    await this.datastore.startGame(client.gameId);
                } else if (type === 'leave') {
                    await this.datastore.leaveGame(
                        client.gameId,
                        client.playerId
                    );
                } else if (type === 'end') {
                    await this.datastore.endGame(client.gameId);
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

                await this.broadcastUpdate(client.gameId);
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
