build: clean
	npm run build

changelog:
	github_changelog_generator --user neogeek --project websocket-game-lobby --future-release $(future-release)

postgres-setup:
	psql -c 'drop database if exists travis_ci_test;' -U postgres || true
	psql -c 'create database travis_ci_test;' -U postgres || true
	psql travis_ci_test -f src/datastore/postgres.sql -U postgres

clean:
	rm -rf dist/
	node_modules/.bin/jest --clearCache
