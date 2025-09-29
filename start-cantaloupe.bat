@echo off
echo Starting Cantaloupe Image Server...

set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "D:\Work\Cosmoscope app\CosmoScope_v2"

java -Dcantaloupe.config=cantaloupe.properties -Xmx2g -jar "D:\Softwares\cantaloupe-5.0.7_1\cantaloupe-5.0.7\cantaloupe-5.0.7.jar"

pause
