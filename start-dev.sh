#!/bin/bash

echo "Starting Cosmoscope Development Environment..."
echo

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is in use"
        return 1
    else
        echo "Port $port is available"
        return 0
    fi
}

# Start Client
echo "Starting Client (React + Vite)..."
cd client && npm run dev &
CLIENT_PID=$!

# Start Server
echo "Starting Server (Node.js + Express)..."
cd ../server && npm run dev &
SERVER_PID=$!

# Start Cantaloupe
echo "Starting Cantaloupe (Java Image Server)..."
java -Dcantaloupe.config=../cantaloupe.properties -Xmx2g -jar /d/Softwares/cantaloupe-5.0.7_1/cantaloupe-5.0.7/cantaloupe-5.0.7.jar &
CANTALOUPE_PID=$!

# Start IIIF Server
echo "Starting IIIF Server..."
cd ../server && node iiif-server.js &
IIIF_PID=$!

echo
echo "All services starting..."
echo "- Client: http://localhost:5173 (or next available port)"
echo "- Server: http://localhost:5174 (or next available port)"
echo "- Cantaloupe: http://localhost:8182"
echo "- IIIF Server: http://localhost:8080"
echo
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping all services..."; kill $CLIENT_PID $SERVER_PID $CANTALOUPE_PID $IIIF_PID; exit' INT
wait
