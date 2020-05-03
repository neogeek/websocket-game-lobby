import ReconnectingWebSocket from 'reconnecting-websocket';

import qs from 'qs';

import { removeArrayItem } from '../utils';

export class WebSocketGameLobbyClient {
    wss: any;

    listeners: any;

    constructor({
        port,
        gameId,
        playerId,
        options = {
            maxRetries: 10
        }
    }: {
        port: number;
        gameId: string;
        playerId: string;
        options: any;
    }) {
        this.wss = new ReconnectingWebSocket(
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
                window.location.hostname
            }${port ? `:${port}` : ''}?${qs.stringify({
                gameId,
                playerId
            })}`,
            [],
            options
        );

        this.listeners = Object.freeze({
            open: [],
            message: [],
            close: []
        });

        Object.keys(this.listeners).map(type => {
            this.wss.addEventListener(type, (message: any) => {
                if (type in this.listeners) {
                    this.listeners[type].map((callback: (message: any) => {}) =>
                        callback(message)
                    );
                }
            });
        });
    }

    addEventListener(type: string, callback: () => {}): void {
        if (type in this.listeners) {
            this.listeners[type].push(callback);
        }
    }

    removeEventListener(type: string, callback: () => {}): void {
        if (type in this.listeners) {
            removeArrayItem(
                this.listeners[type],
                (item: any) => item === callback
            );
        }
    }

    send(
        type: string,
        {
            gameId,
            playerId,
            ...rest
        }: { gameId?: string; playerId?: string } = {}
    ): void {
        this.wss.send(JSON.stringify({ type, gameId, playerId, ...rest }));
    }
}
