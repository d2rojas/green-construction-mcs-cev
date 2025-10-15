# 🚀 MCS-CEV Optimization Execution

This document describes the new optimization execution functionality that allows you to run Julia optimizations directly from the web interface.

## ✨ New Features

### 🔄 Complete Workflow Integration
- **Step 9: Run Optimization** - New step in the configuration wizard
- **Standalone Optimization Section** - Accessible from the left sidebar menu
- **Real-time Progress Monitoring** - Live updates via WebSocket
- **Automatic Result Download** - Get optimization results as ZIP files

### 📊 Job Management
- **Job History** - View all optimization jobs
- **Status Tracking** - Real-time status updates (uploading, extracting, preparing, running, completed, error)
- **Progress Monitoring** - Visual progress bars and detailed logs
- **Result Management** - Download results and view job details

## 🏗️ Architecture

### Frontend (React)
- **Port**: 3001
- **Components**: 
  - `OptimizationRunner.js` - Main optimization interface
  - WebSocket integration for real-time updates
  - File upload and job management

### Backend (Node.js/Express)
- **Port**: 3002
- **Features**:
  - File upload handling
  - Julia process execution
  - WebSocket server for real-time communication
  - Job management and result storage

### Julia Integration
- **Script**: `mcs_optimization_main.jl`
- **Execution**: Spawned as child process from Node.js
- **Results**: Parsed and returned to frontend

## 🚀 Quick Start

### 1. Start the Application
```bash
# Navigate to the optimization interface directory
cd optimization-interface

# Start both frontend and backend servers
./start.sh
```

### 2. Access the Interface
- Open your browser and go to: http://localhost:3001
- The interface will be available with both configuration and optimization sections

### 3. Run an Optimization

#### Option A: Complete Workflow (Recommended)
1. Go through the 8-step configuration wizard
2. Generate your CSV files
3. Proceed to Step 9: "Run Optimization"
4. Upload your generated ZIP file
5. Monitor progress in real-time
6. Download results when complete

#### Option B: Direct Optimization
1. Click "Run Optimization" in the left sidebar
2. Upload a ZIP file containing CSV files
3. Monitor and download results

## 📁 File Structure

```
optimization-interface/
├── src/
│   ├── components/
│   │   └── OptimizationRunner.js    # New optimization component
│   └── App.js                       # Updated with new navigation
├── backend/
│   ├── server.js                    # Express server with WebSocket
│   ├── package.json                 # Backend dependencies
│   ├── uploads/                     # Temporary file uploads
│   ├── datasets/                    # Extracted datasets
│   └── results/                     # Optimization results
├── start.sh                         # Startup script
└── package.json                     # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Set custom Julia path
export JULIA_PATH=/path/to/julia

# Optional: Set custom ports
export PORT=3002  # Backend port
```

### Backend Configuration
The backend server automatically:
- Creates necessary directories (`uploads/`, `datasets/`, `results/`)
- Manages file cleanup (removes old jobs after 24 hours)
- Handles WebSocket connections for real-time updates

## 📊 API Endpoints

### Backend API (http://localhost:3002)

#### Health Check
```
GET /api/health
```
Returns server status and health information.

#### Start Optimization
```
POST /api/optimize
Content-Type: multipart/form-data
Body: dataset (ZIP file)
```
Uploads a dataset ZIP file and starts optimization.

#### Get Job Status
```
GET /api/job/:jobId
```
Returns detailed information about a specific job.

#### Get All Jobs
```
GET /api/jobs
```
Returns list of all optimization jobs.

#### Download Results
```
GET /api/job/:jobId/download
```
Downloads optimization results as a ZIP file.

#### Cleanup Old Jobs
```
DELETE /api/jobs/cleanup
```
Removes completed jobs older than 24 hours.

### WebSocket Events

#### Client to Server
- `join-job`: Join a specific job room for updates
- `disconnect`: Client disconnection

#### Server to Client
- `job-status`: Real-time job status updates

## 🔄 Job Lifecycle

### 1. Upload Phase
- File validation (ZIP format)
- File storage in `uploads/` directory
- Job creation with unique ID

### 2. Extraction Phase
- ZIP file extraction
- CSV files validation
- Dataset preparation

### 3. Preparation Phase
- Directory structure creation
- Julia environment setup
- Dataset copying

### 4. Execution Phase
- Julia process spawning
- Real-time output monitoring
- Progress tracking

### 5. Completion Phase
- Result parsing and storage
- File cleanup
- Status update

## 📈 Progress Tracking

The system tracks progress through several stages:

| Stage | Progress | Description |
|-------|----------|-------------|
| Uploading | 0-10% | File upload and validation |
| Extracting | 10-20% | ZIP extraction and validation |
| Preparing | 20-30% | Environment setup |
| Running | 30-90% | Julia optimization execution |
| Completed | 100% | Results ready for download |

## 🎯 Usage Examples

### Example 1: Complete Workflow
```bash
# 1. Start the application
./start.sh

# 2. Open browser to http://localhost:3001

# 3. Configure scenario (Steps 1-8)
# - Set MCS, CEV, and node counts
# - Configure parameters
# - Define locations and assignments
# - Set time data and work requirements

# 4. Generate files (Step 8)
# - Download ZIP file with CSV data

# 5. Run optimization (Step 9)
# - Upload the ZIP file
# - Monitor progress
# - Download results
```

### Example 2: Direct Optimization
```bash
# 1. Start the application
./start.sh

# 2. Click "Run Optimization" in sidebar

# 3. Upload existing dataset ZIP file

# 4. Monitor and download results
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port 3002 is available
lsof -i :3002

# Check Node.js installation
node --version

# Check backend dependencies
cd backend && npm install
```

#### Julia Not Found
```bash
# Check Julia installation
julia --version

# Set custom Julia path
export JULIA_PATH=/path/to/julia
```

#### File Upload Issues
- Ensure file is valid ZIP format
- Check file size (should be reasonable)
- Verify ZIP contains `csv_files/` directory

#### Optimization Fails
- Check Julia dependencies are installed
- Verify CSV files are valid
- Check backend logs for detailed error messages

### Debug Mode
```bash
# Start backend in debug mode
cd backend && DEBUG=* npm start

# Start frontend in debug mode
DEBUG=* npm start
```

## 🔒 Security Considerations

### File Upload Security
- Only ZIP files are accepted
- Files are validated before processing
- Temporary files are cleaned up automatically

### Process Isolation
- Julia processes run in isolated environment
- File system access is restricted to necessary directories
- Process timeouts prevent hanging jobs

### Data Privacy
- Job data is stored locally
- No external data transmission
- Results are available only to the user

## 🚀 Performance Optimization

### Backend Optimizations
- File streaming for large uploads
- Asynchronous job processing
- Automatic cleanup of old files

### Frontend Optimizations
- Real-time updates via WebSocket
- Efficient job list rendering
- Progressive file upload

## 📚 Integration with Existing Workflow

The new optimization execution functionality integrates seamlessly with the existing 8-step configuration process:

1. **Steps 1-8**: Configuration and file generation (unchanged)
2. **Step 9**: New optimization execution step
3. **Sidebar Menu**: Direct access to optimization section

This provides users with two workflows:
- **Complete Workflow**: Configure → Generate → Execute
- **Direct Execution**: Upload existing datasets and run optimization

## 🔮 Future Enhancements

### Planned Features
- **Batch Processing**: Run multiple optimizations simultaneously
- **Result Visualization**: Interactive charts and graphs
- **Parameter Sweeping**: Automated parameter optimization
- **Cloud Integration**: Run optimizations on cloud infrastructure
- **Result Comparison**: Compare multiple optimization runs

### Technical Improvements
- **Docker Support**: Containerized deployment
- **Database Integration**: Persistent job storage
- **Authentication**: Multi-user support
- **API Documentation**: OpenAPI/Swagger documentation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for error details
3. Verify Julia installation and dependencies
4. Ensure all required directories exist and are writable

---

**Note**: This functionality requires Julia to be installed and accessible from the command line. The backend will automatically detect Julia and provide appropriate error messages if it's not available.
