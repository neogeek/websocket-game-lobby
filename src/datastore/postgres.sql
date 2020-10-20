CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS "game";
CREATE TABLE "game" (
    "id" SERIAL PRIMARY KEY,
    "gameId" UUID DEFAULT uuid_generate_v4() UNIQUE,
    "gameCode" VARCHAR(4) NOT NULL UNIQUE,
    "started" BOOLEAN DEFAULT false,
    "custom" JSONB NOT NULL DEFAULT '{}'::jsonb
);

DROP TABLE IF EXISTS "player";
CREATE TABLE "player" (
    "id" SERIAL PRIMARY KEY,
    "playerId" UUID DEFAULT uuid_generate_v4() UNIQUE,
    "gameId" UUID NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "isAdmin" BOOLEAN DEFAULT false,
    "custom" JSONB NOT NULL DEFAULT '{}'::jsonb
);

DROP TABLE IF EXISTS "spectator";
CREATE TABLE "spectator" (
    "id" SERIAL PRIMARY KEY,
    "spectatorId" UUID DEFAULT uuid_generate_v4() UNIQUE,
    "gameId" UUID NOT NULL,
    "name" TEXT,
    "custom" JSONB NOT NULL DEFAULT '{}'::jsonb
);

DROP TABLE IF EXISTS "turn";
CREATE TABLE "turn" (
    "id" SERIAL PRIMARY KEY,
    "turnId" UUID DEFAULT uuid_generate_v4() UNIQUE,
    "gameId" UUID NOT NULL,
    "index" INT DEFAULT 1,
    "custom" JSONB NOT NULL DEFAULT '{}'::jsonb
);

DROP FUNCTION IF EXISTS createGame (_gameCode VARCHAR(4));
CREATE FUNCTION createGame (_gameCode VARCHAR(4))
    RETURNS TABLE (
        "gameId" UUID,
        "gameCode" VARCHAR(4),
        "started" BOOLEAN,
        "players" JSON,
        "spectators" JSON,
        "turns" JSON,
        "custom" JSONB
)
AS $$
BEGIN
    INSERT INTO "game" ("gameCode") VALUES (_gameCode);
    RETURN QUERY
    SELECT * FROM findGame((SELECT "game"."gameId" FROM "game" WHERE "game"."id" = LASTVAL()));
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS findGame (_gameId UUID);
CREATE FUNCTION findGame (_gameId UUID)
    RETURNS TABLE (
        "gameId" UUID,
        "gameCode" VARCHAR(4),
        "started" BOOLEAN,
        "players" JSON,
        "spectators" JSON,
        "turns" JSON,
        "custom" JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT "game"."gameId", "game"."gameCode", "game"."started",
        (SELECT COALESCE(array_to_json(array_agg(row_to_json(t))), '[]'::JSON) FROM (SELECT "playerId", "name", COALESCE("player"."custom", '{}'::JSONB) as "custom" FROM "player" WHERE "player"."gameId" = "game"."gameId" ORDER BY "player"."id" ASC) t) AS "players",
        (SELECT COALESCE(array_to_json(array_agg(row_to_json(t))), '[]'::JSON) FROM (SELECT "spectatorId", "name", COALESCE("spectator"."custom", '{}'::JSONB) as "custom" FROM "spectator" WHERE "spectator"."gameId" = "game"."gameId" ORDER BY "spectator"."id" ASC) t) AS "spectators",
        (SELECT COALESCE(array_to_json(array_agg(row_to_json(t))), '[]'::JSON) FROM (SELECT "turnId", "index", COALESCE("turn"."custom", '{}'::JSONB) as "custom" FROM "turn" WHERE "turn"."gameId" = "game"."gameId" ORDER BY "index") t) AS "turns",
        COALESCE("game"."custom", '{}'::JSONB) as "custom"
    FROM "game"
    WHERE "game"."gameId" = _gameId;
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS findGameWithCode (_gameCode VARCHAR(4));
CREATE FUNCTION findGameWithCode (_gameCode VARCHAR(4))
    RETURNS TABLE (
        "gameId" UUID,
        "gameCode" VARCHAR(4),
        "started" BOOLEAN,
        "players" JSON,
        "spectators" JSON,
        "turns" JSON,
        "custom" JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM findGame((SELECT "game"."gameId" FROM "game" WHERE "game"."gameCode" = _gameCode));
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS startGame (_gameId UUID);
CREATE FUNCTION startGame (_gameId UUID)
    RETURNS TABLE (
        "gameId" UUID,
        "gameCode" VARCHAR(4),
        "started" BOOLEAN,
        "players" JSON,
        "spectators" JSON,
        "turns" JSON,
        "custom" JSONB
)
AS $$
BEGIN
    UPDATE "game" SET "started" = true WHERE "game"."gameId" = _gameId;
    RETURN QUERY
    SELECT * FROM findGame(_gameId);
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS endGame (_gameId UUID);
CREATE FUNCTION endGame (_gameId UUID)
    RETURNS void
AS $$
BEGIN
    DELETE FROM "game" WHERE "game"."gameId" = _gameId;
    DELETE FROM "player" WHERE "player"."gameId" = _gameId;
    DELETE FROM "spectator" WHERE "spectator"."gameId" = _gameId;
    DELETE FROM "turn" WHERE "turn"."gameId" = _gameId;
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS createPlayer (_gameId UUID, _name TEXT, _avatar TEXT);
CREATE FUNCTION createPlayer (_gameId UUID, _name TEXT, _avatar TEXT)
    RETURNS TABLE (
        "playerId" UUID,
        "gameId" UUID,
        "name" TEXT,
        "avatar" TEXT,
        "isAdmin" BOOLEAN,
        "custom" JSONB
)
AS $$
BEGIN
    INSERT INTO "player" ("gameId", "name", "avatar", "isAdmin") VALUES (_gameId, _name, _avatar, (SELECT COUNT("id") = 0 FROM "player" WHERE "player"."gameId" = _gameId));
    RETURN QUERY
    SELECT * FROM findPlayer(_gameId, (SELECT "player"."playerId" FROM "player" WHERE "player"."id" = LASTVAL()));
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS findPlayer (_gameId UUID, _playerId UUID);
CREATE FUNCTION findPlayer (_gameId UUID, _playerId UUID)
    RETURNS TABLE (
        "playerId" UUID,
        "gameId" UUID,
        "name" TEXT,
        "avatar" TEXT,
        "isAdmin" BOOLEAN,
        "custom" JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT "player"."playerId", "player"."gameId", "player"."name", "player"."avatar", "player"."isAdmin", COALESCE("player"."custom", '{}'::JSONB) as "custom"
    FROM "player"
    WHERE "player"."playerId" = _playerId AND "player"."gameId" = _gameId;
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS createSpectator (_gameId UUID);
CREATE FUNCTION createSpectator (_gameId UUID)
    RETURNS TABLE (
        "spectatorId" UUID,
        "gameId" UUID,
        "name" TEXT,
        "custom" JSONB
)
AS $$
BEGIN
    INSERT INTO "spectator" ("gameId") VALUES (_gameId);
    RETURN QUERY
    SELECT * FROM findSpectator(_gameId, (SELECT "spectator"."spectatorId" FROM "spectator" WHERE "spectator"."id" = LASTVAL()));
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS findSpectator (_gameId UUID, _spectatorId UUID);
CREATE FUNCTION findSpectator (_gameId UUID, _spectatorId UUID)
    RETURNS TABLE (
        "spectatorId" UUID,
        "gameId" UUID,
        "name" TEXT,
        "custom" JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT "spectator"."spectatorId", "spectator"."gameId", "spectator"."name", COALESCE("spectator"."custom", '{}'::JSONB) as "custom"
    FROM "spectator"
    WHERE "spectator"."spectatorId" = _spectatorId AND "spectator"."gameId" = _gameId;
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS createTurn (_gameId UUID);
CREATE FUNCTION createTurn (_gameId UUID)
    RETURNS TABLE (
        "turnId" UUID,
        "gameId" UUID,
        "index" INT,
        "custom" JSONB
)
AS $$
BEGIN
    INSERT INTO "turn" ("gameId", "index") VALUES (_gameId, COALESCE((SELECT "turn"."index" FROM "turn" WHERE "turn"."gameId" = _gameId ORDER BY "turn"."index" DESC LIMIT 1), 0) + 1);
    RETURN QUERY
    SELECT * FROM findTurn(_gameId, (SELECT "turn"."turnId" FROM "turn" WHERE "turn"."id" = LASTVAL()));
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS findTurn (_gameId UUID, _turnId UUID);
CREATE FUNCTION findTurn (_gameId UUID, _turnId UUID)
    RETURNS TABLE (
        "turnId" UUID,
        "gameId" UUID,
        "index" INT,
        "custom" JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT "turn"."turnId", "turn"."gameId", "turn"."index", COALESCE("turn"."custom", '{}'::JSONB) as "custom"
    FROM "turn"
    WHERE "turn"."turnId" = _turnId AND "turn"."gameId" = _gameId;
END; $$ LANGUAGE 'plpgsql';

DROP FUNCTION IF EXISTS currentTurn (_gameId UUID);
CREATE FUNCTION currentTurn (_gameId UUID)
    RETURNS TABLE (
        "turnId" UUID,
        "gameId" UUID,
        "index" INT,
        "custom" JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT "turn"."turnId", "turn"."gameId", "turn"."index", COALESCE("turn"."custom", '{}'::JSONB) as "custom"
    FROM "turn"
    WHERE "turn"."gameId" = _gameId
    ORDER BY "index" DESC
    LIMIT 1;
END; $$ LANGUAGE 'plpgsql';
