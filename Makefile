build: clean
	npm run build

changelog:
	github_changelog_generator --user neogeek --project websocket-game-lobby --future-release $(future-release)

clean:
	rm -rf dist/
