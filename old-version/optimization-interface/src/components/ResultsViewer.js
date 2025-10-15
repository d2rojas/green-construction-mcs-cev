import React, { useState, useRef } from 'react';
import { Card, Button, Alert, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import ResultsUpload from './ResultsUpload';
import ChartViewer from './ChartViewer';
import SummaryViewer from './SummaryViewer';

const ResultsViewer = () => {
  const [resultsData, setResultsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleResultsUpload = async (zipFile) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resultsZip', zipFile);

      // Upload to backend
      const response = await fetch('http://localhost:3002/api/results/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResultsData(data);
      
      // Reset progress after success
      setTimeout(() => setUploadProgress(0), 1000);

    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setResultsData(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="results-viewer">
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-gradient-primary text-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">
                📊 Optimization Results Viewer
              </h4>
              <div className="step-indicator">
                Results Analysis
              </div>
            </div>
            <div className="d-flex align-items-center">
              <Badge bg="light" text="dark" className="me-2">Interactive Charts</Badge>
              <Badge bg="light" text="dark" className="me-2">Data Visualization</Badge>
              <Badge bg="light" text="dark">Performance Analysis</Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {!resultsData ? (
            <div className="row">
              <div className="col-md-8">
                <ResultsUpload 
                  onUpload={handleResultsUpload}
                  isLoading={isLoading}
                  progress={uploadProgress}
                />
                
                {/* Error Display */}
                {error && (
                  <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
                    <strong>Error:</strong> {error}
                  </Alert>
                )}

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="mt-3">
                    <ProgressBar 
                      now={uploadProgress} 
                      label={`${uploadProgress}%`}
                      variant="primary"
                    />
                    <small className="text-muted">Processing results...</small>
                  </div>
                )}
              </div>
              
              <div className="col-md-4">
                <Card className="bg-light">
                  <Card.Body>
                    <h6>💡 How to view results:</h6>
                    <ol className="small">
                      <li>Upload your optimization results ZIP file</li>
                      <li>The system will extract and parse your data</li>
                      <li>View interactive charts and summary metrics</li>
                      <li>Analyze performance and energy consumption</li>
                      <li>Download charts or export data as needed</li>
                    </ol>
                    
                    <hr />
                    
                    <h6>📋 Supported Files:</h6>
                    <ul className="small">
                      <li><strong>optimization_log.txt</strong> - Summary metrics</li>
                      <li><strong>*.png</strong> - Chart images</li>
                      <li><strong>*.csv</strong> - Data for interactive charts</li>
                    </ul>
                    
                    <hr />
                    
                    <h6>🎯 Features:</h6>
                    <ul className="small">
                      <li>Interactive Chart.js visualizations</li>
                      <li>Real-time data parsing</li>
                      <li>Responsive design</li>
                      <li>Export capabilities</li>
                    </ul>
                  </Card.Body>
                </Card>
              </div>
            </div>
          ) : (
            <div className="results-content">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="mb-1">📈 Optimization Results</h5>
                  <p className="text-muted mb-0">
                    Dataset: {resultsData.datasetName} | 
                    Generated: {new Date(resultsData.timestamp).toLocaleString()}
                  </p>
                </div>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleClearResults}
                >
                  🔄 Load New Results
                </Button>
              </div>

              {/* Summary Section */}
              <Row className="mb-4">
                <Col md={12}>
                  <SummaryViewer summary={resultsData.summary} />
                </Col>
              </Row>

              {/* Charts Section */}
              <Row>
                <Col md={12}>
                  <ChartViewer charts={resultsData.charts} />
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResultsViewer;
