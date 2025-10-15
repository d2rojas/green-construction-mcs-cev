import React from 'react';
import { Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap';

const SummaryStep = ({ formData, onGenerateFiles, isGenerating }) => {
  const { scenario, parameters, evData, locations, distanceMatrix, travelTimeMatrix, timeData, workData } = formData;

  const getLocationName = (index) => {
    return index === 0 ? 'Grid Node' : `Construction Site ${index}`;
  };

  const getAssignedLocation = (evId) => {
    const assignedLocation = locations.find(location => 
      location.evAssignments && location.evAssignments[evId] === 1
    );
    return assignedLocation ? getLocationName(assignedLocation.id - 1) : 'Not Assigned';
  };



  return (
    <div>
      <h3>📋 Scenario Summary & Generation</h3>
      <p className="text-muted">
        Review your complete scenario configuration and generate the CSV files for optimization.
      </p>

      <Alert variant="success" className="mb-4">
        <strong>✅ All steps completed!</strong> Your scenario is ready for optimization. Review the configuration below and generate the CSV files.
      </Alert>

      <Row>
        <Col lg={8}>
          {/* Scenario Configuration */}
          <Card className="mb-4">
            <Card.Header>
              <h5>⚙️ Scenario Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Basic Setup:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Scenario Name:</strong> <Badge bg="primary">{scenario.scenarioName}</Badge></li>
                    <li><strong>MCS Count:</strong> <Badge bg="info">{scenario.numMCS}</Badge></li>
                    <li><strong>CEV Count:</strong> <Badge bg="success">{scenario.numCEV}</Badge></li>
                    <li><strong>Node Count:</strong> <Badge bg="warning">{scenario.numNodes}</Badge></li>
                    <li><strong>Duration:</strong> <Badge bg="secondary">
                      {scenario.is24Hours ? '24 hours (96 periods of 15 min)' : '24 hours (48 periods of 30 min)'}
                    </Badge></li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Model Parameters:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Charging Efficiency:</strong> {parameters.eta_ch_dch}</li>
                    <li><strong>MCS Capacity:</strong> {parameters.MCS_min}-{parameters.MCS_max} kWh</li>
                    <li><strong>Charging Rate:</strong> {parameters.CH_MCS} kW</li>
                    <li><strong>Time Interval:</strong> {parameters.delta_T} hours</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Electric Vehicles */}
          <Card className="mb-4">
            <Card.Header>
              <h5>🚗 Electric Vehicles</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {evData.map((ev, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <div className="border rounded p-3">
                      <h6>EV{ev.id}</h6>
                      <ul className="list-unstyled small">
                        <li><strong>Battery Range:</strong> {ev.SOE_min}-{ev.SOE_max} kWh</li>
                        <li><strong>Initial Charge:</strong> {ev.SOE_ini} kWh</li>
                        <li><strong>Charging Rate:</strong> {ev.ch_rate} kW</li>
                        <li><strong>Assigned to:</strong> <Badge bg="info">{getAssignedLocation(ev.id)}</Badge></li>
                      </ul>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Locations */}
          <Card className="mb-4">
            <Card.Header>
              <h5>📍 Locations</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {locations.map((location, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <div className="border rounded p-3">
                      <h6>{location.name}</h6>
                      <ul className="list-unstyled small">
                        <li><strong>Type:</strong> <Badge bg={location.type === 'grid' ? 'secondary' : 'success'}>
                          {location.type === 'grid' ? 'Grid Node' : 'Construction Site'}
                        </Badge></li>
                        <li><strong>Assigned EVs:</strong> {
                          Object.entries(location.evAssignments || {})
                            .filter(([evId, assigned]) => assigned === 1)
                            .map(([evId]) => `EV${evId}`)
                            .join(', ') || 'None'
                        }</li>
                      </ul>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Work Data */}
          {workData.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5>🏗️ Work Configuration</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {workData.map((work, index) => (
                    <Col md={6} key={index} className="mb-3">
                      <div className="border rounded p-3">
                        <h6>EV{work.ev} at {getLocationName(work.location - 1)}</h6>
                        <ul className="list-unstyled small">
                          <li><strong>Work Requirements:</strong> {work.workRequirements.length} periods</li>
                          <li><strong>Total Energy:</strong> {
                            work.workRequirements.reduce((sum, power) => sum + power * (timeData.length === 96 ? 0.25 : 0.5), 0).toFixed(1)
                          } kWh</li>
                        </ul>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Files to be Generated */}
          <Card className="mb-4">
            <Card.Header>
              <h5>📁 Files to be Generated</h5>
            </Card.Header>
            <Card.Body>
              <h6>Core Files:</h6>
              <ul className="list-unstyled">
                <li>✅ parameters.csv</li>
                <li>✅ ev_data.csv</li>
                <li>✅ place.csv</li>
                <li>✅ distance.csv <small className="text-muted">(user-configured)</small></li>
                <li>✅ travel_time.csv <small className="text-muted">(user-configured)</small></li>
                <li>✅ time_data.csv</li>
                <li>✅ work.csv</li>
              </ul>
              
              {scenario.is24Hours && (
                <>
                  <h6 className="mt-3">CAISO Data Files:</h6>
                  <ul className="list-unstyled">
                    <li>✅ CAISO-demand-YYYYMMDD.csv</li>
                    <li>✅ CAISO-co2-YYYYMMDD.csv</li>
                  </ul>
                </>
              )}
              
              <h6 className="mt-3">Additional Files:</h6>
              <ul className="list-unstyled">
                <li>✅ README.md</li>
                <li>✅ Complete folder structure</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Matrix Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5>🗺️ Distance & Travel Time</h5>
            </Card.Header>
            <Card.Body>
              <p className="small text-muted">
                <strong>Distance Matrix:</strong> {distanceMatrix.length > 0 ? 'User configured' : 'Default values'}
              </p>
              <p className="small text-muted">
                <strong>Travel Time Matrix:</strong> {travelTimeMatrix.length > 0 ? 'User configured' : 'Default values'}
              </p>
              <p className="small text-muted">
                <strong>Matrix Size:</strong> {scenario.numNodes} × {scenario.numNodes}
              </p>
            </Card.Body>
          </Card>

          {/* Generation Button */}
          <Card className="mb-4">
            <Card.Header>
              <h5>🚀 Generate Files</h5>
            </Card.Header>
            <Card.Body>
              <p className="small text-muted mb-3">
                Click the button below to generate all CSV files and download them as a ZIP file.
              </p>
              <Button 
                variant="success" 
                size="lg" 
                className="w-100"
                onClick={onGenerateFiles}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating Files...
                  </>
                ) : (
                  <>
                    📁 Generate CSV Files
                  </>
                )}
              </Button>
              <p className="small text-muted mt-2">
                Files will be downloaded as: <code>{scenario.scenarioName}_optimization_files.zip</code>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SummaryStep;
