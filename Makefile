.POSIX:

all: help

.PHONY: init
init: ## initialize and fetch dependencies
	yarn install --pure-lockfile

.PHONY: run-dev
run-dev: ## setup development watches and server to run on dev
	rm -rf www/
	mkdir -p www/models/
	cp ./node_modules/aframe/dist/aframe-master.* www/
	cp ./node_modules/aframe-physics-system/dist/aframe-physics-system.js www/
	cp ./node_modules/papaparse/papaparse.min.js www/
	cp -r src/* www/
	cp -r models/* www/models/
	./node_modules/.bin/chokidar src/ -c 'cp -r src/* www/; cp -r models/* www/models/' & \
	./node_modules/.bin/live-server www/ --no-browser

.PHONY: lint
lint: ## run linter on source
	./node_modules/.bin/eslint_d --fix src/

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
