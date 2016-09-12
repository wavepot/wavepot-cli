
example:
	@./node_modules/.bin/watchify \
		--global-transform [ babelify --presets [ latest ] ] \
		--transform ./wav \
		--verbose \
		--standalone build \
		--entry example/drumbeat.js \
		--outfile example/build.js

.PHONY: example
