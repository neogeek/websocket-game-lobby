import ReconnectingWebSocket from 'reconnecting-websocket';

import qs from 'qs';

enum ListenerTypes {
    open,
    message,
    close
}

export class WebSocketGameLobbyClient {
    wss: any;

    keepAliveInterval: any;

    constructor({
        port,
        options = {
            maxRetries: 10
        },
        gameId,
        gameCode,
        playerId,
        keepAliveMilliseconds = 30000
    }: {
        port?: number | null;
        options?: any;
        gameId?: string;
        gameCode?: string;
        playerId?: string;
        keepAliveMilliseconds?: number;
    }) {
        this.wss = new ReconnectingWebSocket(
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
                window.location.hostname
            }${port ? `:${port}` : ''}?${qs.stringify(
                {
                    gameId,
                    gameCode,
                    playerId
                },
                { skipNulls: true }
            )}`,
            [],
            options
        );

        this.keepAliveInterval = setInterval(
            () => this.wss.send('ping'),
            keepAliveMilliseconds
        );
    }

    addEventListener(type: string, callback: () => void): void {
        if (type in ListenerTypes) {
            this.wss.addEventListener(type, callback);
        }
    }

    removeEventListener(type: string, callback: () => void): void {
        if (type in ListenerTypes) {
            this.wss.removeEventListener(type, callback);
        }
    }

    send(
        type: string,
        {
            gameId,
            gameCode,
            playerId,
            ...rest
        }: { gameId?: string; gameCode?: string; playerId?: string } = {}
    ): void {
        this.wss.send(
            JSON.stringify({ type, gameId, gameCode, playerId, ...rest })
        );
    }
}
