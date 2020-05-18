# Changelog

## [v2.2.1](https://github.com/neogeek/websocket-game-lobby/tree/v2.2.1)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.2.0...v2.2.1)

**Fixed bugs:**

- Empty packet returning before correct packet with data [\#27](https://github.com/neogeek/websocket-game-lobby/issues/27)

**Merged pull requests:**

- \[hotfix\] Fixed issue with broadcasting data to players [\#28](https://github.com/neogeek/websocket-game-lobby/pull/28) ([neogeek](https://github.com/neogeek))

## [v2.2.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.2.0) (2020-05-17)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.1.0...v2.2.0)

**Merged pull requests:**

- \[hotfix\] Loss of connection on refresh [\#26](https://github.com/neogeek/websocket-game-lobby/pull/26) ([neogeek](https://github.com/neogeek))
- \[feat\] Added keep alive feature. [\#25](https://github.com/neogeek/websocket-game-lobby/pull/25) ([neogeek](https://github.com/neogeek))
- \[feat\] Added setup method to datastore. [\#24](https://github.com/neogeek/websocket-game-lobby/pull/24) ([neogeek](https://github.com/neogeek))
- \[feat\] Added forceSpectator flag. [\#22](https://github.com/neogeek/websocket-game-lobby/pull/22) ([neogeek](https://github.com/neogeek))
- \[feat\] Updated create game code logic to run asynchronously. [\#21](https://github.com/neogeek/websocket-game-lobby/pull/21) ([neogeek](https://github.com/neogeek))

## [v2.1.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.1.0) (2020-05-08)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.3...v2.1.0)

**Merged pull requests:**

- \[hotfix\] Simplified client listener handling. [\#20](https://github.com/neogeek/websocket-game-lobby/pull/20) ([neogeek](https://github.com/neogeek))
- \[feat\] Converted datastore methods to run asynchronously. [\#19](https://github.com/neogeek/websocket-game-lobby/pull/19) ([neogeek](https://github.com/neogeek))

## [v2.0.3](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.3) (2020-05-05)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.2...v2.0.3)

**Merged pull requests:**

- \[hotfix\] Accept both gameId and gameCode from connection and messages. [\#18](https://github.com/neogeek/websocket-game-lobby/pull/18) ([neogeek](https://github.com/neogeek))

## [v2.0.2](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.2) (2020-05-05)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.1...v2.0.2)

**Merged pull requests:**

- \[hotfix\] Set gameId and playerId as optional. [\#17](https://github.com/neogeek/websocket-game-lobby/pull/17) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Set port as optional and to accept a number or null as a value. [\#16](https://github.com/neogeek/websocket-game-lobby/pull/16) ([neogeek](https://github.com/neogeek))

## [v2.0.1](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.1) (2020-05-05)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v2.0.0...v2.0.1)

**Merged pull requests:**

- \[hotfix\] Set options as optional. [\#15](https://github.com/neogeek/websocket-game-lobby/pull/15) ([neogeek](https://github.com/neogeek))

## [v2.0.0](https://github.com/neogeek/websocket-game-lobby/tree/v2.0.0) (2020-05-04)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v1.2.0...v2.0.0)

**Merged pull requests:**

- \[hotfix\] Export types with package distribution [\#14](https://github.com/neogeek/websocket-game-lobby/pull/14) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Prevent empty playerId or spectatorId in create methods. [\#13](https://github.com/neogeek/websocket-game-lobby/pull/13) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Remove default player from createGame method. [\#12](https://github.com/neogeek/websocket-game-lobby/pull/12) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Changed gameId and playerId to optional properties in client send method. [\#11](https://github.com/neogeek/websocket-game-lobby/pull/11) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Fixed broadcast issue with leave and end events. [\#10](https://github.com/neogeek/websocket-game-lobby/pull/10) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Fixed issue removing event listener callback. [\#9](https://github.com/neogeek/websocket-game-lobby/pull/9) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Moved createUniqueGameCode into utilities file. [\#8](https://github.com/neogeek/websocket-game-lobby/pull/8) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Export ephemeral datastore. [\#7](https://github.com/neogeek/websocket-game-lobby/pull/7) ([neogeek](https://github.com/neogeek))
- \[feat\] Added new Spectator type. [\#6](https://github.com/neogeek/websocket-game-lobby/pull/6) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Return value from callback in edit methods. [\#5](https://github.com/neogeek/websocket-game-lobby/pull/5) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Return player and spectator separately. [\#4](https://github.com/neogeek/websocket-game-lobby/pull/4) ([neogeek](https://github.com/neogeek))

## [v1.2.0](https://github.com/neogeek/websocket-game-lobby/tree/v1.2.0) (2020-05-01)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v1.1.0...v1.2.0)

**Merged pull requests:**

- \[feat\] Updated removeArrayItem to take a primative or a method. [\#3](https://github.com/neogeek/websocket-game-lobby/pull/3) ([neogeek](https://github.com/neogeek))
- \[hotfix\] Ignore port if missing. [\#2](https://github.com/neogeek/websocket-game-lobby/pull/2) ([neogeek](https://github.com/neogeek))

## [v1.1.0](https://github.com/neogeek/websocket-game-lobby/tree/v1.1.0) (2020-05-01)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/v1.0.0...v1.1.0)

**Merged pull requests:**

- \[feat\] Added options with maxRetries of 10 to client. [\#1](https://github.com/neogeek/websocket-game-lobby/pull/1) ([neogeek](https://github.com/neogeek))

## [v1.0.0](https://github.com/neogeek/websocket-game-lobby/tree/v1.0.0) (2020-04-30)

[Full Changelog](https://github.com/neogeek/websocket-game-lobby/compare/f73e9de74596f6b104070518118af3ba30ccba42...v1.0.0)



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
