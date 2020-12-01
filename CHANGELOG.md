# Changelog

## [v4.1.1](https://github.com/neogeek/websocket-game-lobby/tree/v4.1.1) - (2020-12-01)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v4.1.0...v4.1.1)

- [hotfix] Pass game code to createGame call. [#50](https://github.com/neogeek/websocket-game-lobby/pull/50)

## [v4.1.0](https://github.com/neogeek/websocket-game-lobby/tree/v4.1.0) - (2020-12-01)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v4.0.0...v4.1.0)

- [feat] Added optional gameCode property to createGame method call. [#49](https://github.com/neogeek/websocket-game-lobby/pull/49)
- [feat] Setup create player to take name & avatar [#47](https://github.com/neogeek/websocket-game-lobby/pull/47)
- [feat] Create player with name and avatar. [#44](https://github.com/neogeek/websocket-game-lobby/pull/44)
- [hotfix] Replaced deprecated assert methods. [#45](https://github.com/neogeek/websocket-game-lobby/pull/45)
- [hofix] Removed qs as a dependency. [#46](https://github.com/neogeek/websocket-game-lobby/pull/46)

## [v4.0.0](https://github.com/neogeek/websocket-game-lobby/tree/v4.0.0) - (2020-06-04)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v3.0.0...v4.0.0)

- [hotfix] Reference interface when creating Listeners class. [#41](https://github.com/neogeek/websocket-game-lobby/pull/41)
- [hotfix] Add prefix to interfaces. [#40](https://github.com/neogeek/websocket-game-lobby/pull/40)
- [hotfix] Fixed spelling mistake of type. [#39](https://github.com/neogeek/websocket-game-lobby/pull/39)
- [hotifx] Removed custom player and spectator UUID. [#38](https://github.com/neogeek/websocket-game-lobby/pull/38)
- [feat] Postgres Datastore [#23](https://github.com/neogeek/websocket-game-lobby/pull/23)
- [hotfix] Fixed issue where game can be started multiple times with an invalid turn index. [#37](https://github.com/neogeek/websocket-game-lobby/pull/37)
- [hotfix] Fixed issue where game can be joined multiple times by the same player. [#36](https://github.com/neogeek/websocket-game-lobby/pull/36)
- [feat] Documentation [#35](https://github.com/neogeek/websocket-game-lobby/pull/35)
- [feat] Extracted listener logic into extendable class. [#34](https://github.com/neogeek/websocket-game-lobby/pull/34)
- [feat] Added gameId to structs [#33](https://github.com/neogeek/websocket-game-lobby/pull/33)
- [feat] Moved datastore tests to a shared file. [#32](https://github.com/neogeek/websocket-game-lobby/pull/32)
- [hotfix] Added missing turn index [#31](https://github.com/neogeek/websocket-game-lobby/pull/31)

## [v3.0.0](https://github.com/neogeek/websocket-game-lobby/tree/v3.0.0) - (2020-05-22)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.3.0...v3.0.0)

- [feat] Remove client [#30](https://github.com/neogeek/websocket-game-lobby/pull/30)

## [v2.3.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.3.0) - (2020-05-20)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.2.1...v2.3.0)

- [feat] Player isAdmin flag [#29](https://github.com/neogeek/websocket-game-lobby/pull/29)

## [v2.2.1](https://github.com/neogeek/websocket-game-lobby/tree/v2.2.1) - (2020-05-18)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.2.0...v2.2.1)

- [hotfix] Fixed issue with broadcasting data to players [#28](https://github.com/neogeek/websocket-game-lobby/pull/28)

## [v2.2.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.2.0) - (2020-05-17)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.1.0...v2.2.0)

- [hotfix] Loss of connection on refresh [#26](https://github.com/neogeek/websocket-game-lobby/pull/26)
- [feat] Added keep alive feature. [#25](https://github.com/neogeek/websocket-game-lobby/pull/25)
- [feat] Added setup method to datastore. [#24](https://github.com/neogeek/websocket-game-lobby/pull/24)
- [feat] Added forceSpectator flag. [#22](https://github.com/neogeek/websocket-game-lobby/pull/22)
- [feat] Updated create game code logic to run asynchronously. [#21](https://github.com/neogeek/websocket-game-lobby/pull/21)

## [v2.1.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.1.0) - (2020-05-08)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.3...v2.1.0)

- [hotfix] Simplified client listener handling. [#20](https://github.com/neogeek/websocket-game-lobby/pull/20)
- [feat] Converted datastore methods to run asynchronously. [#19](https://github.com/neogeek/websocket-game-lobby/pull/19)

## [v2.0.3](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.3) - (2020-05-04)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.2...v2.0.3)

- [hotfix] Accept both gameId and gameCode from connection and messages. [#18](https://github.com/neogeek/websocket-game-lobby/pull/18)

## [v2.0.2](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.2) - (2020-05-04)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.1...v2.0.2)

- [hotfix] Set gameId and playerId as optional. [#17](https://github.com/neogeek/websocket-game-lobby/pull/17)
- [hotfix] Set port as optional and to accept a number or null as a value. [#16](https://github.com/neogeek/websocket-game-lobby/pull/16)

## [v2.0.1](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.1) - (2020-05-04)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.0...v2.0.1)

- [hotfix] Set options as optional. [#15](https://github.com/neogeek/websocket-game-lobby/pull/15)

## [v2.0.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.0) - (2020-05-04)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v1.2.0...v2.0.0)

- [hotfix] Export types with package distribution [#14](https://github.com/neogeek/websocket-game-lobby/pull/14)
- [hotfix] Prevent empty playerId or spectatorId in create methods. [#13](https://github.com/neogeek/websocket-game-lobby/pull/13)
- [hotfix] Remove default player from createGame method. [#12](https://github.com/neogeek/websocket-game-lobby/pull/12)
- [hotfix] Changed gameId and playerId to optional properties in client send method. [#11](https://github.com/neogeek/websocket-game-lobby/pull/11)
- [hotfix] Fixed broadcast issue with leave and end events. [#10](https://github.com/neogeek/websocket-game-lobby/pull/10)
- [hotfix] Fixed issue removing event listener callback. [#9](https://github.com/neogeek/websocket-game-lobby/pull/9)
- [hotfix] Moved createUniqueGameCode into utilities file. [#8](https://github.com/neogeek/websocket-game-lobby/pull/8)
- [hotfix] Export ephemeral datastore. [#7](https://github.com/neogeek/websocket-game-lobby/pull/7)
- [feat] Added new Spectator type. [#6](https://github.com/neogeek/websocket-game-lobby/pull/6)
- [hotfix] Return value from callback in edit methods. [#5](https://github.com/neogeek/websocket-game-lobby/pull/5)
- [hotfix] Return player and spectator separately. [#4](https://github.com/neogeek/websocket-game-lobby/pull/4)

## [v1.2.0](https://github.com/neogeek/websocket-game-lobby/tree/v1.2.0) - (2020-05-01)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v1.1.0...v1.2.0)

- [feat] Updated removeArrayItem to take a primative or a method. [#3](https://github.com/neogeek/websocket-game-lobby/pull/3)
- [hotfix] Ignore port if missing. [#2](https://github.com/neogeek/websocket-game-lobby/pull/2)

## [v1.1.0](https://github.com/neogeek/websocket-game-lobby/tree/v1.1.0) - (2020-05-01)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v1.0.0...v1.1.0)

- [feat] Added options with maxRetries of 10 to client. [#1](https://github.com/neogeek/websocket-game-lobby/pull/1)

## [v1.0.0](https://github.com/neogeek/websocket-game-lobby/tree/v1.0.0) - (2020-04-30)

- Initial release! 🎉

_This changelog was generated with **[generate-local-changelog](https://github.com/neogeek/generate-local-changelog)**_
