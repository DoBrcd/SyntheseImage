.PHONY:	run
run:	build
	java -cp bin:libs/ini4j-0.5.4.jar Main scenes/scene10.ini

.PHONY:	tests
tests:	build
	java -cp bin:/usr/share/java/junit4.jar:libs/ini4j-0.5.4.jar org.junit.runner.JUnitCore Tests

.PHONY:	build
build:	$(addprefix bin/, $(addsuffix .class, $(notdir $(basename $(wildcard src/*.java)))))

bin/%.class:	src/%.java
	mkdir -p bin
	javac -cp /usr/share/java/junit4.jar:libs/ini4j-0.5.4.jar -d bin src/*.java

.PHONY:	clean
clean:
	rm -fr bin
