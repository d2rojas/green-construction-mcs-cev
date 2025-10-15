import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const OptimizationLoading = ({ onOptimizationComplete, onError, scenarioName, zipFile }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Starting optimization...');
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [jobId, setJobId] = useState(null);

  const steps = [
    'Starting optimization...',
    'Loading CSV data...',
    'Configuring optimization model...',
    'Running HiGHS solver...',
    'Processing results...',
    'Generating visualizations...',
    'Saving result files...',
    'Optimization completed!'
  ];

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);

    // Listen for job status updates
    newSocket.on('job-status', (data) => {
      console.log('Job status update:', data);
      if (data.jobId === jobId) {
        setCurrentStep(data.status);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${data.status}`]);
        
        if (data.progress !== undefined) {
          setProgress(data.progress);
        }
        
        if (data.status === 'completed') {
          setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Optimization completed successfully!`]);
          setTimeout(() => {
            if (onOptimizationComplete) {
              onOptimizationComplete(data.jobId);
            }
          }, 1000);
        } else if (data.status === 'failed') {
          setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Optimization failed: ${data.error || 'Unknown error'}`]);
          if (onError) {
            onError(data.error || 'Optimization failed');
          }
        }
      }
    });

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [jobId, onOptimizationComplete, onError]);

  // Start optimization when both socket and zipFile are ready
  useEffect(() => {
    // Prevent multiple executions
    if (jobId) {
      console.log('Optimization already started, skipping...');
      return;
    }

    // Wait for both socket and zipFile to be ready
    if (!socket || !zipFile) {
      console.log('Socket or zipFile not ready yet, waiting...', { socket: !!socket, zipFile: !!zipFile });
      return;
    }

    const startOptimization = async () => {
      try {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Starting automatic optimization...`]);
        
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Using optimization files: ${zipFile.name}`]);
        
        // Upload the ZIP file to start Julia optimization
        const formData = new FormData();
        formData.append('dataset', zipFile);
        
        setCurrentStep('Uploading files to Julia backend...');
        setProgress(10);
        
        const response = await fetch('http://localhost:3002/api/optimize', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to start optimization');
        }
        
        const result = await response.json();
        const realJobId = result.jobId;
        setJobId(realJobId);
        
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Optimization job started with ID: ${realJobId}`]);
        setCurrentStep('Julia optimization in progress...');
        setProgress(20);
        
        // Join the job room for real-time updates (socket is guaranteed to be ready)
        console.log('Joining job room:', realJobId);
        socket.emit('join-job', realJobId);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Joined job room for updates`]);
        
        // Fallback: Check job status periodically in case WebSocket fails
        const statusCheckInterval = setInterval(async () => {
          try {
            const response = await fetch('http://localhost:3002/api/jobs');
            if (response.ok) {
              const jobsData = await response.json();
              const currentJob = jobsData.find(job => job.id === realJobId);
              console.log('Job status check:', currentJob);
              
              if (currentJob) {
                if (currentJob.status === 'completed') {
                  clearInterval(statusCheckInterval);
                  setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Job completed (via status check)`]);
                  setCurrentStep('Optimization completed!');
                  setProgress(100);
                  setTimeout(() => {
                    if (onOptimizationComplete) {
                      onOptimizationComplete(currentJob.id);
                    }
                  }, 1000);
                } else if (currentJob.status === 'failed') {
                  clearInterval(statusCheckInterval);
                  setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Job failed (via status check)`]);
                  if (onError) {
                    onError('Optimization failed');
                  }
                } else if (currentJob.progress) {
                  setProgress(currentJob.progress);
                  setCurrentStep(currentJob.status || 'Processing...');
                }
              }
            }
          } catch (error) {
            console.error('Error checking job status:', error);
          }
        }, 5000); // Check every 5 seconds
        
        // Clean up interval when component unmounts
        return () => clearInterval(statusCheckInterval);
        
      } catch (error) {
        console.error('Error starting optimization:', error);
        if (onError) {
          onError('Failed to start optimization: ' + error.message);
        }
      }
    };

    startOptimization();
  }, [zipFile, socket, jobId]); // Depend on zipFile, socket, and jobId


  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="mb-0">
                <i className="fas fa-cogs me-2"></i>
                Optimization in Progress
              </h3>
            </div>
            <div className="card-body text-center">
              {/* Spinner de carga */}
              <div className="mb-4">
                <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="progress" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>

              {/* Paso actual */}
              <div className="mb-4">
                <h5 className="text-primary">{currentStep}</h5>
                <p className="text-muted">
                  Please wait while Julia executes the optimization...
                </p>
              </div>

              {/* Progress Logs */}
              <div className="mb-4">
                <h6 className="text-start mb-3">
                  <i className="fas fa-list me-2"></i>
                  Progress Log:
                </h6>
                <div 
                  className="bg-dark text-light p-3 rounded text-start" 
                  style={{ 
                    height: '200px', 
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                >
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-success">[INFO]</span> {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> This process may take several minutes depending on the scenario complexity.
                Do not close this window until the optimization is complete.
              </div>

              {/* Cancel Button (optional) */}
              <div className="mt-3">
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel the optimization?')) {
                      if (onError) {
                        onError('Optimization cancelled by user');
                      }
                    }
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel Optimization
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationLoading;
