all:
	@git checkout -b build
	@gulp
	@git add build/* build.html
	@git commit -m 'build'
	@git push origin :build
	@git push origin build
	@git checkout master
	@git branch -D build
