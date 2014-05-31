all:
	echo "Building synaesthetic..."
	@git branch -D build
	@git checkout -b build
	@gulp
	@git commit -am "build"
	@git push origin :build
	@git push origin build
	@git checkout master
	@git branch -D build
