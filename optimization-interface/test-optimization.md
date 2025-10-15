# 🧪 Testing the Optimization Execution Feature

This guide will help you test the new optimization execution functionality.

## Prerequisites

1. **Node.js** installed and accessible
2. **Julia** installed and accessible from command line
3. **Generated dataset ZIP file** from the interface

## 🚀 Quick Test

### 1. Start the Application
```bash
cd optimization-interface
./start.sh
```

### 2. Test Backend Health
```bash
curl http://localhost:3002/api/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "MCS-CEV Optimization Backend is running"
}
```

### 3. Test Julia Integration
```bash
# Check if Julia is accessible
julia --version

# Test Julia script directly
cd ..
julia mcs_optimization_main.jl sample_simple_dataset
```

## 📋 Step-by-Step Testing

### Test 1: Complete Workflow
1. **Start the application**: `./start.sh`
2. **Open browser**: http://localhost:3001
3. **Configure a simple scenario**:
   - 1 MCS, 1 CEV, 2 nodes
   - Use default parameters
   - Assign EV1 to construction site
   - Use simple time data
   - Generate files
4. **Go to Step 9**: "Run Optimization"
5. **Upload the generated ZIP file**
6. **Monitor progress** in real-time
7. **Download results** when complete

### Test 2: Direct Optimization
1. **Start the application**: `./start.sh`
2. **Click "Run Optimization"** in sidebar
3. **Upload an existing dataset** (e.g., from `1MCS-1CEV-2nodes`)
4. **Monitor job status**
5. **Download results**

### Test 3: Error Handling
1. **Upload invalid file** (not ZIP)
2. **Upload ZIP without csv_files directory**
3. **Test with Julia not installed**
4. **Test with corrupted CSV files**

## 🔍 Monitoring

### Backend Logs
Watch the backend console for:
- File upload processing
- Julia process execution
- WebSocket connections
- Error messages

### Frontend Console
Open browser developer tools to see:
- WebSocket connections
- API calls
- Error messages

### Job Status
Monitor job status in the interface:
- Upload progress
- Extraction status
- Julia execution progress
- Result generation

## 🐛 Debugging

### Common Issues

#### Backend Won't Start
```bash
# Check port availability
lsof -i :3002

# Check Node.js version
node --version

# Check dependencies
cd backend && npm install
```

#### Julia Not Found
```bash
# Check Julia installation
julia --version

# Set custom path
export JULIA_PATH=/path/to/julia
```

#### File Upload Fails
```bash
# Check file size
ls -lh your_file.zip

# Check file format
file your_file.zip

# Check ZIP contents
unzip -l your_file.zip
```

#### Optimization Fails
```bash
# Check Julia dependencies
julia -e "using JuMP, HiGHS, Plots, DataFrames, CSV"

# Test with sample dataset
julia mcs_optimization_main.jl sample_simple_dataset
```

### Debug Mode
```bash
# Backend debug
cd backend && DEBUG=* npm start

# Frontend debug
DEBUG=* npm start
```

## 📊 Expected Results

### Successful Optimization
- Job status: "completed"
- Progress: 100%
- Results available for download
- Files generated:
  - `mcs_optimization_results.png`
  - `mcs_1_power_profile.png`
  - `optimization_log.txt`
  - `optimization_report.txt`

### Job Timeline
- **0-10%**: File upload
- **10-20%**: File extraction
- **20-30%**: Environment preparation
- **30-90%**: Julia optimization
- **90-100%**: Result generation

## 🎯 Test Scenarios

### Scenario 1: Simple Dataset
- **Dataset**: `sample_simple_dataset`
- **Expected time**: 1-2 minutes
- **Expected results**: Basic optimization plots and logs

### Scenario 2: 24-Hour Dataset
- **Dataset**: `1MCS-1CEV-2nodes-24hours`
- **Expected time**: 3-5 minutes
- **Expected results**: Detailed time-series plots

### Scenario 3: Complex Dataset
- **Dataset**: `2MCS-3CEV-2nodes-24hours`
- **Expected time**: 5-10 minutes
- **Expected results**: Multiple MCS and CEV optimization

## 🔧 Configuration Testing

### Environment Variables
```bash
# Test custom Julia path
export JULIA_PATH=/custom/path/to/julia
./start.sh

# Test custom ports
export PORT=3003
cd backend && npm start
```

### File Size Limits
```bash
# Test large file upload
# Create large ZIP file and test upload
```

## 📈 Performance Testing

### Concurrent Jobs
1. Start multiple optimization jobs
2. Monitor system resources
3. Check job queue management

### Large Datasets
1. Test with large CSV files
2. Monitor memory usage
3. Check processing time

## 🛡️ Security Testing

### File Upload Security
- Test with non-ZIP files
- Test with malicious file names
- Test with very large files

### Process Isolation
- Verify Julia processes are isolated
- Check file system access restrictions
- Test process timeouts

## 📝 Test Checklist

- [ ] Backend starts successfully
- [ ] Frontend connects to backend
- [ ] File upload works
- [ ] ZIP extraction works
- [ ] Julia process starts
- [ ] Progress updates in real-time
- [ ] Results are generated
- [ ] Results can be downloaded
- [ ] Error handling works
- [ ] Job cleanup works

## 🎉 Success Criteria

The optimization execution feature is working correctly when:

1. **Complete workflow** works end-to-end
2. **Direct optimization** works independently
3. **Real-time updates** are received
4. **Results are generated** and downloadable
5. **Error handling** provides useful messages
6. **Job management** works properly

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review backend and frontend logs
3. Verify Julia installation and dependencies
4. Test with sample datasets first
5. Check system resources and permissions
