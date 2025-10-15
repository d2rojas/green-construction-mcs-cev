import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import ChartViewer from './ChartViewer';
import JSZip from 'jszip';

const ResultsDisplay = ({ scenarioName, jobId, onBackToWizard }) => {
  const [resultsData, setResultsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load real results data from the optimization
    const loadResults = async () => {
      try {
        setIsLoading(true);
        
        if (!jobId) {
          throw new Error('No job ID provided');
        }
        
        // Download results ZIP from the completed job
        const response = await fetch(`http://localhost:3002/api/job/${jobId}/download`);
        
        if (!response.ok) {
          throw new Error(`Failed to download results: ${response.statusText}`);
        }
        
        const resultsBlob = await response.blob();
        console.log('Downloaded results blob:', resultsBlob);
        
        // Extract CSV files from the ZIP
        const zip = new JSZip();
        const zipContents = await zip.loadAsync(resultsBlob);
        console.log('ZIP contents:', Object.keys(zipContents.files));
        
        // Find the timestamp subfolder
        const zipFileNames = Object.keys(zipContents.files);
        const timestampFolder = zipFileNames.find(name => 
          name.includes('/') && name.endsWith('/') && name.match(/\d{8}_\d{6}/)
        );
        
        console.log('Found timestamp folder:', timestampFolder);
        
        // Extract the CSV files we need from the timestamp subfolder
        const csvFiles = {};
        const csvFileNames = [
          '01_total_grid_power_profile.csv',
          '02_work_profiles_by_site.csv', 
          '03_mcs_state_of_energy.csv',
          '04_cev_state_of_energy.csv',
          '05_electricity_prices.csv',
          '06_mcs_location_trajectory.csv'
        ];
        
        for (const fileName of csvFileNames) {
          // Try both direct path and subfolder path
          const directPath = fileName;
          const subfolderPath = timestampFolder ? `${timestampFolder}${fileName}` : fileName;
          
          let file = zipContents.files[directPath] || zipContents.files[subfolderPath];
          
          if (file) {
            const csvContent = await file.async('text');
            csvFiles[fileName] = csvContent;
            console.log(`Extracted ${fileName} from ${file.name}:`, csvContent.substring(0, 200) + '...');
            
            // Special logging for electricity prices to debug CO2 issue
            if (fileName === '05_electricity_prices.csv') {
              console.log('🔍 CO2 Debug - Full electricity prices CSV:');
              console.log(csvContent);
            }
          } else {
            console.log(`File ${fileName} not found in ZIP (tried ${directPath} and ${subfolderPath})`);
          }
        }
        
        const resultsData = {
          jobId: jobId,
          scenario: scenarioName,
          timestamp: new Date().toISOString(),
          downloadUrl: URL.createObjectURL(resultsBlob),
          csvFiles: csvFiles
        };
        
        // Transform the data to match the expected format
        const transformedData = {
          scenario: scenarioName,
          timestamp: new Date().toISOString(),
          charts: [
            {
              name: 'total_grid_power',
              title: 'Total Grid Power Profile',
              type: 'INTERACTIVE',
              csvData: csvFiles['01_total_grid_power_profile.csv'] || null
            },
            {
              name: 'work_profiles',
              title: 'Work Profiles by Site',
              type: 'INTERACTIVE',
              csvData: csvFiles['02_work_profiles_by_site.csv'] || null
            },
            {
              name: 'mcs_energy',
              title: 'MCS State of Energy',
              type: 'INTERACTIVE',
              csvData: csvFiles['03_mcs_state_of_energy.csv'] || null
            },
            {
              name: 'cev_energy',
              title: 'CEV State of Energy',
              type: 'INTERACTIVE',
              csvData: csvFiles['04_cev_state_of_energy.csv'] || null
            },
            {
              name: 'electricity_prices',
              title: 'Electricity Prices',
              type: 'INTERACTIVE',
              csvData: csvFiles['05_electricity_prices.csv'] || null
            },
            {
              name: 'mcs_trajectory',
              title: 'MCS Location Trajectory',
              type: 'INTERACTIVE',
              csvData: csvFiles['06_mcs_location_trajectory.csv'] || null
            }
          ]
        };
        
        setResultsData(transformedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load results: ' + err.message);
        setIsLoading(false);
      }
    };

    loadResults();
  }, [scenarioName, jobId]);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
        <p className="mt-3">Loading optimization results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Results</Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={onBackToWizard}>
            Back to Configuration
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>📊 Optimization Results</h3>
          <p className="text-muted mb-0">
            Results for scenario: <Badge bg="primary">{scenarioName}</Badge>
          </p>
        </div>
        <Button variant="outline-secondary" onClick={onBackToWizard}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Configuration
        </Button>
      </div>


      {/* Charts Section */}
      <Row>
        <Col md={12}>
          <ChartViewer charts={resultsData.charts} />
        </Col>
      </Row>


      {/* Action Buttons */}
      <Row className="mt-4">
        <Col className="text-center">
          {resultsData?.downloadUrl ? (
            <Button 
              variant="primary" 
              className="me-3"
              onClick={() => {
                const a = document.createElement('a');
                a.href = resultsData.downloadUrl;
                a.download = `optimization_results_${jobId}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              <i className="fas fa-download me-2"></i>
              Download Results
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              className="me-3"
              disabled
            >
              <i className="fas fa-spinner fa-spin me-2"></i>
              Loading Results...
            </Button>
          )}
          <Button variant="outline-primary" className="me-3">
            <i className="fas fa-share me-2"></i>
            Share Results
          </Button>
          <Button variant="outline-secondary" onClick={onBackToWizard}>
            <i className="fas fa-redo me-2"></i>
            Run New Optimization
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ResultsDisplay;
