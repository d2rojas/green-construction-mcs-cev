#!/bin/bash

echo "🚀 Starting MCS-CEV Optimization Interface..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Julia is installed
if ! command -v julia &> /dev/null; then
    echo "⚠️  Warning: Julia is not found in PATH. Make sure Julia is installed and accessible."
    echo "   You can set the JULIA_PATH environment variable to specify the Julia executable path."
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server on port 3002..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:3002/api/health > /dev/null; then
    echo "❌ Error: Backend server failed to start. Please check the logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend server is running on http://localhost:3002"

# Start frontend server
echo "🌐 Starting frontend server on port 3001..."
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Error: Frontend server failed to start. Please check the logs above."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend server is running on http://localhost:3001"
echo ""
echo "🎉 MCS-CEV Optimization Interface is ready!"
echo "📱 Open your browser and go to: http://localhost:3001"
echo ""
echo "📊 Backend API: http://localhost:3002"
echo "🔗 WebSocket: ws://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
