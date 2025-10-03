# PowerShell script to start Cantaloupe
Write-Host "Starting Cantaloupe Image Server..."
Write-Host "Configuration: cantaloupe.properties"
Write-Host "Images directory: ./images/"
Write-Host "Port: 8182"
Write-Host ""

# Use cmd to run the Java command to avoid PowerShell parsing issues
cmd /c "java -Dcantaloupe.config=cantaloupe.properties -Xmx2g -jar cantaloupe-5.0.7.jar"
