import React, { useState, useEffect } from 'react';

const ResultsLoading = ({ onResultsReady, scenarioName }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Processing optimization results...');
  const [logs, setLogs] = useState([]);

  const steps = [
    'Processing optimization results...',
    'Generating power profiles...',
    'Creating energy state visualizations...',
    'Calculating cost analysis...',
    'Generating trajectory plots...',
    'Creating summary charts...',
    'Preparing interactive results...',
    'Results ready for visualization!'
  ];

  useEffect(() => {
    let stepIndex = 0;
    let progressValue = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex]);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${steps[stepIndex]}`]);
        
        // Simulate gradual progress
        const targetProgress = ((stepIndex + 1) / steps.length) * 100;
        const progressIncrement = (targetProgress - progressValue) / 10;
        
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + progressIncrement;
            if (newProgress >= targetProgress) {
              clearInterval(progressInterval);
              return targetProgress;
            }
            return newProgress;
          });
        }, 100);
        
        stepIndex++;
        progressValue = targetProgress;
      } else {
        clearInterval(interval);
        // Simulate successful completion after a brief delay
        setTimeout(() => {
          if (onResultsReady) {
            onResultsReady();
          }
        }, 1000);
      }
    }, 1500); // Change step every 1.5 seconds (faster than optimization)

    return () => clearInterval(interval);
  }, [onResultsReady]);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white text-center">
              <h3 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Processing Results
              </h3>
            </div>
            <div className="card-body text-center">
              {/* Success Spinner */}
              <div className="mb-4">
                <div className="spinner-border text-success" role="status" style={{ width: '4rem', height: '4rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>

              {/* Progress Bar */}
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

              {/* Current Step */}
              <div className="mb-4">
                <h5 className="text-success">{currentStep}</h5>
                <p className="text-muted">
                  Preparing your optimization results for visualization...
                </p>
              </div>

              {/* Progress Logs */}
              <div className="mb-4">
                <h6 className="text-start mb-3">
                  <i className="fas fa-list me-2"></i>
                  Processing Log:
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

              {/* Success Message */}
              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                <strong>Optimization Complete!</strong> Your results are being processed and will be ready shortly.
              </div>

              {/* Scenario Info */}
              <div className="mt-3">
                <p className="text-muted">
                  <strong>Scenario:</strong> {scenarioName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsLoading;
