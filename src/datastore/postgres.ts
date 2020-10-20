import { Client } from 'pg';

import { createUniqueGameCode } from '../utils';

import Listeners from '../listeners';

import {
    IDataStore,
    DataStoreEvents,
    Game,
    Player,
    Spectator,
    Turn
} from '../types';

export const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'travis_ci_test'
});

const formatValue = (value: any): any => {
    if (!value) return null;
    else if (typeof value === 'object') value = JSON.stringify(value);

    return `'${String(value).replace(/'/g, '&#39;')}'`;
};

export class PostgresDataStore
    extends Listeners<DataStoreEvents>
    implements IDataStore {
    listeners = Object.keys(DataStoreEvents).reduce((acc, curr) => {
        return {
            [curr]: [],
            ...acc
        };
    }, {});

    async setup(): Promise<void> {
        await client.connect();
        return;
    }
    async createGame(): Promise<Game> {
        const code = await createUniqueGameCode(async gameCode =>
            Boolean(
                (
                    await client.query(
                        'SELECT COUNT("gameCode") FROM "game" WHERE "gameCode" = $1 LIMIT 1',
                        [gameCode]
                    )
                ).rows.find((row: any) => row).count > 0
            )
        );

        const game = (
            await client.query('SELECT * FROM createGame($1)', [code])
        ).rows.find((row: Game | undefined) => row);

        return await this.editGame(game.gameId, async game => {
            await this.runEventListeners(
                DataStoreEvents.createGame,
                game,
                this
            );
            return game;
        });
    }
    async findGame(gameId: string | undefined): Promise<Game | undefined> {
        return (
            await client.query('SELECT * FROM findGame($1)', [gameId])
        ).rows.find((row: Game | undefined) => row);
    }
    async findGameWithCode(
        gameCode: string | undefined
    ): Promise<Game | undefined> {
        return (
            await client.query('SELECT * FROM findGameWithCode($1)', [gameCode])
        ).rows.find((row: Game | undefined) => row);
    }
    async editGame(
        gameId: string,
        callback: (game: Game) => Promise<Game>
    ): Promise<Game> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        if (typeof callback === 'function') {
            const edited = await callback(game);

            await client.query(
                `UPDATE "game" SET ${Object.keys(edited)
                    .filter(key => ['custom'].indexOf(key) !== -1)
                    .map(
                        key => `"${key}" = ${formatValue((edited as any)[key])}`
                    )
                    .join(', ')} WHERE "gameId" = $1`,
                [gameId]
            );

            return (
                await client.query(`SELECT * FROM findGame($1)`, [gameId])
            ).rows.find((row: Game | undefined) => row);
        }

        return game;
    }
    async leaveGame(gameId: string, playerId: string): Promise<void> {
        const game = await this.findGame(gameId);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        await client.query(
            'DELETE FROM "player" WHERE "gameId" = $1 and "playerId" = $2',
            [gameId, playerId]
        );

        await client.query(
            'DELETE FROM "spectator" WHERE "gameId" = $1 and "spectatorId" = $2',
            [gameId, playerId]
        );

        await this.editGame(game.gameId, async game => {
            await this.runEventListeners(DataStoreEvents.leaveGame, game, this);
            return game;
        });

        return;
    }
    async startGame(gameId: string): Promise<Game> {
        const game = (
            await client.query(`SELECT * FROM startGame($1)`, [gameId])
        ).rows.find((row: Game | undefined) => row);

        if (!game) {
            throw new Error(`Game not found with id ${gameId}`);
        }

        await this.createTurn(gameId);

        return await this.editGame(game.gameId, async game => {
            await this.runEventListeners(DataStoreEvents.startGame, game, this);
            return game;
        });
    }
    async endGame(gameId: string): Promise<void> {
        await client.query('SELECT * FROM endGame($1)', [gameId]);
        return;
    }

    async createPlayer(
        gameId: string,
        name?: string,
        avatar?: string
    ): Promise<Player> {
        const player = (
            await client.query('SELECT * FROM createPlayer($1, $2, $3)', [
                gameId,
                name,
                avatar
            ])
        ).rows.find((row: Player | undefined) => row);

        return await this.editPlayer(gameId, player.playerId, async player => {
            await this.runEventListeners(
                DataStoreEvents.createPlayer,
                player,
                this
            );
            return player;
        });
    }
    async findPlayer(
        gameId: string,
        playerId: string
    ): Promise<Player | undefined> {
        return (
            await client.query('SELECT * FROM findPlayer($1, $2)', [
                gameId,
                playerId
            ])
        ).rows.find((row: Player | undefined) => row);
    }
    async editPlayer(
        gameId: string,
        playerId: string,
        callback: (player: Player) => Promise<Player>
    ): Promise<Player> {
        const player = await this.findPlayer(gameId, playerId);

        if (!player) {
            throw new Error(`Player not found with id ${playerId}`);
        }

        if (typeof callback === 'function') {
            const edited = await callback(player);

            return (
                await client.query(
                    `UPDATE "player" SET ${Object.keys(edited)
                        .filter(
                            key =>
                                ['name', 'avatar', 'custom'].indexOf(key) !== -1
                        )
                        .map(
                            key =>
                                `"${key}" = ${formatValue(
                                    (edited as any)[key]
                                )}`
                        )
                        .join(
                            ', '
                        )} WHERE "gameId" = $1 and "playerId" = $2 RETURNING "playerId", "gameId", "name", "avatar", "isAdmin", "custom"`,
                    [gameId, playerId]
                )
            ).rows.find((row: Player | undefined) => row);
        }

        return player;
    }

    async createSpectator(gameId: string): Promise<Spectator> {
        const spectator = (
            await client.query('SELECT * FROM createSpectator($1)', [gameId])
        ).rows.find((row: Spectator | undefined) => row);

        return await this.editSpectator(
            gameId,
            spectator.spectatorId,
            async spectator => {
                await this.runEventListeners(
                    DataStoreEvents.createSpectator,
                    spectator,
                    this
                );
                return spectator;
            }
        );
    }
    async findSpectator(
        gameId: string,
        spectatorId: string
    ): Promise<Spectator | undefined> {
        return (
            await client.query('SELECT * FROM findSpectator($1, $2)', [
                gameId,
                spectatorId
            ])
        ).rows.find((row: Spectator | undefined) => row);
    }
    async editSpectator(
        gameId: string,
        spectatorId: string,
        callback: (spectator: Spectator) => Promise<Spectator>
    ): Promise<Spectator> {
        const spectator = await this.findSpectator(gameId, spectatorId);

        if (!spectator) {
            throw new Error(`Spectator not found with id ${spectatorId}`);
        }

        if (typeof callback === 'function') {
            const edited = await callback(spectator);

            return (
                await client.query(
                    `UPDATE "spectator" SET ${Object.keys(edited)
                        .filter(key => ['name', 'custom'].indexOf(key) !== -1)
                        .map(
                            key =>
                                `"${key}" = ${formatValue(
                                    (edited as any)[key]
                                )}`
                        )
                        .join(
                            ', '
                        )} WHERE "gameId" = $1 and "spectatorId" = $2 RETURNING "spectatorId", "gameId", "name", "custom"`,
                    [gameId, spectatorId]
                )
            ).rows.find((row: Spectator | undefined) => row);
        }

        return spectator;
    }

    async createTurn(gameId: string): Promise<Turn> {
        const turn = (
            await client.query('SELECT * FROM createTurn($1)', [gameId])
        ).rows.find((row: Turn | undefined) => row);

        return await this.editTurn(gameId, turn.turnId, async turn => {
            await this.runEventListeners(
                DataStoreEvents.createTurn,
                turn,
                this
            );
            return turn;
        });
    }
    async findTurn(gameId: string, turnId: string): Promise<Turn | undefined> {
        return (
            await client.query('SELECT * FROM findTurn($1, $2)', [
                gameId,
                turnId
            ])
        ).rows.find((row: Turn | undefined) => row);
    }
    async currentTurn(gameId: string): Promise<Turn | undefined> {
        return (
            await client.query('SELECT * FROM currentTurn($1)', [gameId])
        ).rows.find((row: Turn | undefined) => row);
    }
    async editTurn(
        gameId: string,
        turnId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn> {
        const turn = await this.findTurn(gameId, turnId);

        if (!turn) {
            throw new Error(`Turn not found for game with id ${turnId}`);
        }

        if (typeof callback === 'function') {
            const edited = await callback(turn);

            return (
                await client.query(
                    `UPDATE "turn" SET ${Object.keys(edited)
                        .filter(key => ['custom'].indexOf(key) !== -1)
                        .map(
                            key =>
                                `"${key}" = ${formatValue(
                                    (edited as any)[key]
                                )}`
                        )
                        .join(
                            ', '
                        )} WHERE "gameId" = $1 and "turnId" = $2 RETURNING "turnId", "gameId", "index", "custom"`,
                    [gameId, turnId]
                )
            ).rows.find((row: Turn | undefined) => row);
        }

        return turn;
    }
    async editCurrentTurn(
        gameId: string,
        callback: (turn: Turn) => Promise<Turn>
    ): Promise<Turn> {
        const turn = await this.currentTurn(gameId);

        if (!turn) {
            throw new Error(
                `Current turn not found for game with id ${gameId}`
            );
        }

        return await this.editTurn(gameId, turn.turnId, callback);
    }
    async endCurrentTurn(gameId: string): Promise<void> {
        await this.editCurrentTurn(gameId, async (turn: Turn) => {
            await this.runEventListeners(
                DataStoreEvents.endCurrentTurn,
                turn,
                this
            );
            return turn;
        });

        await this.createTurn(gameId);
    }
}
