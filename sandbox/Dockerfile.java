FROM openjdk:27-ea-oracle

WORKDIR /usr/src/app

ADD https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar /usr/src/app/libs/gson.jar

CMD ["echo", "Java Sandbox Built"]