@echo off
echo Starting Cantaloupe Image Server...
echo Configuration: cantaloupe.properties
echo Images directory: ./images/
echo Port: 8182
echo.

java -Dcantaloupe.config=cantaloupe.properties -Xmx2g -jar cantaloupe-5.0.7.jar

pause