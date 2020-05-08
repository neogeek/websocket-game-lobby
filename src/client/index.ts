import ReconnectingWebSocket from 'reconnecting-websocket';

import qs from 'qs';

enum ListenerTypes {
    open,
    message,
    close
}

export class WebSocketGameLobbyClient {
    wss: any;

    constructor({
        port,
        options = {
            maxRetries: 10
        },
        gameId,
        gameCode,
        playerId
    }: {
        port?: number | null;
        options?: any;
        gameId?: string;
        gameCode?: string;
        playerId?: string;
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
