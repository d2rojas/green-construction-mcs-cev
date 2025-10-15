import React, { useState, useEffect, useCallback } from 'react';
import { Form, Alert, Card, Button, Table, Row, Col, Badge } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CEVWorkScheduler = ({ data, numCEV, timeData, locationData, onUpdate }) => {
  const [workSchedules, setWorkSchedules] = useState([]);
  const [selectedEV, setSelectedEV] = useState(1);
  const [validationErrors, setValidationErrors] = useState({ criticalErrors: [], warnings: [] });
  const [defaultTimeData, setDefaultTimeData] = useState([]);

  // Generate default time data (48 periods of 30 minutes for 24 hours)
  const generateDefaultTimeData = useCallback(() => {
    const timeData = [];
    for (let i = 0; i < 48; i++) {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      timeData.push({
        period: i + 1,
        time: time,
        electricityPrice: 0.15,
        co2Intensity: 0.08
      });
    }
    return timeData;
  }, []);

  // Generate work data from schedules
  const generateWorkData = useCallback((schedules = workSchedules) => {
    console.log('🔍 generateWorkData called with:', {
      schedulesLength: schedules.length,
      timeDataLength: timeData.length,
      defaultTimeDataLength: defaultTimeData.length,
      locationDataLength: locationData.length
    });

    // Use timeData if available, otherwise use defaultTimeData
    const currentTimeData = timeData.length > 0 ? timeData : defaultTimeData;
    console.log('🔍 Using timeData:', currentTimeData.length, 'periods');
    console.log('🔍 timeData sample:', timeData.slice(0, 3));
    console.log('🔍 defaultTimeData sample:', defaultTimeData.slice(0, 3));
    console.log('🔍 currentTimeData sample:', currentTimeData.slice(0, 3));
    
    if (currentTimeData.length === 0) {
      console.log('🔍 No time data available, skipping work data generation');
      return;
    }

    if (schedules.length === 0) {
      console.log('🔍 No schedules available, skipping work data generation');
      return;
    }

    if (locationData.length === 0) {
      console.log('🔍 No location data available, skipping work data generation');
      return;
    }

    const newWorkData = [];
    
    schedules.forEach(evSchedule => {
      console.log(`🔍 Processing EV ${evSchedule.ev} with schedules:`, evSchedule.schedules);
      
      const workRequirements = generateWorkProfile(evSchedule.schedules, currentTimeData);
      console.log(`🔍 Generated work requirements for EV ${evSchedule.ev}:`, workRequirements.slice(0, 3));
      console.log(`🔍 Total work requirements for EV ${evSchedule.ev}:`, workRequirements.length);
      
      // Find the assigned location for this EV
      const assignedLocation = locationData.find(location => 
        location.evAssignments && location.evAssignments[evSchedule.ev] === 1
      );
      
      console.log(`🔍 Looking for assigned location for EV ${evSchedule.ev}:`, assignedLocation);
      
      if (assignedLocation) {
        const workItem = {
          location: assignedLocation.id,
          ev: evSchedule.ev,
          workRequirements: workRequirements
        };
        newWorkData.push(workItem);
        console.log(`✅ Added work item for EV${evSchedule.ev} at location ${assignedLocation.id}:`, workItem);
      } else {
        console.log(`❌ No assigned location found for EV${evSchedule.ev}`);
        console.log('Available locations:', locationData.map(loc => ({
          id: loc.id,
          evAssignments: loc.evAssignments
        })));
      }
    });
    
    console.log('🔍 Final generated work data:', newWorkData);
    console.log('🔍 Calling onUpdate with workData length:', newWorkData.length);
    onUpdate(newWorkData);
    console.log('🔍 onUpdate called successfully');
  }, [timeData, defaultTimeData, onUpdate, locationData]);

  // Initialize default time data if not provided
  useEffect(() => {
    if (timeData.length === 0 && defaultTimeData.length === 0) {
      const generatedTimeData = generateDefaultTimeData();
      setDefaultTimeData(generatedTimeData);
    }
  }, [timeData.length, defaultTimeData.length, generateDefaultTimeData]);

  // Initialize work schedules for each CEV
  useEffect(() => {
    if (numCEV > 0) {
      const initialSchedules = [];
      for (let ev = 1; ev <= numCEV; ev++) {
        initialSchedules.push({
          ev: ev,
          schedules: [{
            id: 1,
            startTime: '08:00',
            endTime: '17:00',
            workPower: 2.5,
            label: `Work Period 1`
          }]
        });
      }
      setWorkSchedules(initialSchedules);
    }
  }, [numCEV]);

  // Generate work data when all required data is available
  useEffect(() => {
    console.log('🔍 useEffect for generating work data:');
    console.log('- workSchedules.length:', workSchedules.length);
    console.log('- timeData.length:', timeData.length);
    console.log('- defaultTimeData.length:', defaultTimeData.length);
    console.log('- locationData.length:', locationData.length);
    
    // Check if we have all required data
    const hasSchedules = workSchedules.length > 0;
    const hasTimeData = timeData.length > 0 || defaultTimeData.length > 0;
    const hasLocationData = locationData.length > 0;
    
    console.log('🔍 Data availability check:', {
      hasSchedules,
      hasTimeData,
      hasLocationData,
      allReady: hasSchedules && hasTimeData && hasLocationData
    });
    
    if (hasSchedules && hasTimeData && hasLocationData) {
      console.log('🔍 All data ready, generating work data...');
      // Use a longer delay to ensure all state updates are complete
      setTimeout(() => {
        generateWorkData(workSchedules);
      }, 200);
    } else {
      console.log('🔍 Missing required data, skipping work data generation');
    }
  }, [workSchedules, timeData, defaultTimeData, locationData, generateWorkData]);

  // Force regeneration when timeData changes from default to real
  useEffect(() => {
    if (workSchedules.length > 0 && locationData.length > 0 && timeData.length > 0 && defaultTimeData.length > 0) {
      console.log('🔍 timeData changed from default to real, forcing regeneration...');
      console.log('🔍 timeData length:', timeData.length, 'defaultTimeData length:', defaultTimeData.length);
      setTimeout(() => {
        generateWorkData(workSchedules);
      }, 200);
    }
  }, [timeData, generateWorkData]); // Trigger when timeData object changes

  // Additional effect to regenerate work data when real timeData becomes available
  useEffect(() => {
    if (workSchedules.length > 0 && locationData.length > 0 && timeData.length > 0) {
      console.log('🔍 Real timeData became available, regenerating work data...');
      console.log('🔍 timeData length changed to:', timeData.length);
      console.log('🔍 timeData sample:', timeData.slice(0, 3));
      setTimeout(() => {
        generateWorkData(workSchedules);
      }, 100);
    }
  }, [timeData.length, generateWorkData]); // Trigger when timeData length changes from 0 to 96

  // Critical fix: Force regeneration when timeData becomes available (96 periods)
  useEffect(() => {
    if (workSchedules.length > 0 && locationData.length > 0 && timeData.length === 96) {
      console.log('🔍 CRITICAL: timeData with 96 periods became available, forcing work data regeneration...');
      console.log('🔍 timeData length:', timeData.length);
      console.log('🔍 timeData sample:', timeData.slice(0, 3));
      setTimeout(() => {
        generateWorkData(workSchedules);
      }, 100);
    }
  }, [timeData.length, generateWorkData]); // Trigger when timeData length becomes 96

  // Force regeneration when locationData becomes available
  useEffect(() => {
    if (locationData.length > 0 && workSchedules.length > 0) {
      console.log('🔍 Location data became available, forcing work data generation...');
      const currentTimeData = timeData.length > 0 ? timeData : defaultTimeData;
      if (currentTimeData.length > 0) {
        setTimeout(() => {
          generateWorkData(workSchedules);
        }, 100);
      }
    }
  }, [locationData.length]); // Only trigger when locationData length changes

  // Additional effect to ensure work data is generated when component is fully loaded
  useEffect(() => {
    if (workSchedules.length > 0 && locationData.length > 0) {
      const currentTimeData = timeData.length > 0 ? timeData : defaultTimeData;
      if (currentTimeData.length > 0) {
        console.log('🔍 Component fully loaded, ensuring work data generation...');
        setTimeout(() => {
          generateWorkData(workSchedules);
        }, 500);
      }
    }
  }, []); // Run once when component mounts

  // Force regeneration when timeData changes from default to real
  useEffect(() => {
    if (workSchedules.length > 0 && locationData.length > 0 && timeData.length > 0 && defaultTimeData.length > 0) {
      console.log('🔍 timeData changed from default to real, forcing regeneration...');
      console.log('🔍 timeData length:', timeData.length, 'defaultTimeData length:', defaultTimeData.length);
      setTimeout(() => {
        generateWorkData(workSchedules);
      }, 200);
    }
  }, [timeData, generateWorkData]); // Trigger when timeData object changes

  // Generate work profile based on schedules (piecewise function)
  const generateWorkProfile = (schedules, timeData) => {
    console.log('🔍 generateWorkProfile called with:', {
      schedulesLength: schedules.length,
      schedules: schedules,
      timeDataLength: timeData.length,
      firstTimePoint: timeData[0]
    });
    
    const workRequirements = [];
    let workingPeriodsCount = 0;
    
    timeData.forEach((timePoint, index) => {
      const time = timePoint.time;
      const timeParts = time.split(':');
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);
      const timeInMinutes = hour * 60 + minute;
      
      let workPower = 0;
      let status = 'Off';
      
      // Check all schedules for this time
      for (const schedule of schedules) {
        const startTime = schedule.startTime;
        const endTime = schedule.endTime;
        
        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const startInMinutes = startHour * 60 + startMinute;
        
        const endHour = parseInt(endTime.split(':')[0]);
        const endMinute = parseInt(endTime.split(':')[1]);
        const endInMinutes = endHour * 60 + endMinute;
        
        // Check if current time falls within this schedule
        if (timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes) {
          workPower = parseFloat(schedule.workPower) || 0;
          status = 'Working';
          if (workPower > 0) workingPeriodsCount++;
          break; // Use the first matching schedule
        }
      }
      
      workRequirements.push({
        time: time,
        workPower: workPower,
        status: status
      });
    });
    
    console.log(`🔍 generateWorkProfile result: ${workingPeriodsCount} working periods out of ${timeData.length} total periods`);
    if (workingPeriodsCount > 0) {
      console.log('✅ Work profile generated successfully with working periods');
    } else {
      console.log('❌ WARNING: No working periods found! All workPower values are 0');
    }
    
    return workRequirements;
  };

  // Add new work period for selected EV
  const addWorkPeriod = (ev) => {
    setWorkSchedules(prevSchedules => {
      const newSchedules = prevSchedules.map(schedule => {
        if (schedule.ev === ev) {
          const maxId = schedule.schedules.length > 0 
            ? Math.max(...schedule.schedules.map(s => s.id)) 
            : 0;
          
          const newPeriod = {
            id: maxId + 1,
            startTime: '09:00',
            endTime: '17:00',
            workPower: 2.0,
            label: `Work Period ${maxId + 1}`
          };
          
          return {
            ...schedule,
            schedules: [...schedule.schedules, newPeriod]
          };
        }
        return schedule;
      });
      
      generateWorkData(newSchedules);
      return newSchedules;
    });
  };

  // Remove work period
  const removeWorkPeriod = (ev, periodId) => {
    setWorkSchedules(prevSchedules => {
      const newSchedules = prevSchedules.map(schedule => {
        if (schedule.ev === ev) {
          const filteredSchedules = schedule.schedules.filter(s => s.id !== periodId);
          return {
            ...schedule,
            schedules: filteredSchedules
          };
        }
        return schedule;
      });
      
      generateWorkData(newSchedules);
      return newSchedules;
    });
  };

  // Update work period
  const updateWorkPeriod = (ev, periodId, field, value) => {
    setWorkSchedules(prevSchedules => {
      const newSchedules = prevSchedules.map(schedule => {
        if (schedule.ev === ev) {
          return {
            ...schedule,
            schedules: schedule.schedules.map(s => {
              if (s.id === periodId) {
                return { ...s, [field]: value };
              }
              return s;
            })
          };
        }
        return schedule;
      });
      
      generateWorkData(newSchedules);
      return newSchedules;
    });
  };

  // Generate chart data for selected EV
  const generateChartData = () => {
    const selectedSchedule = workSchedules.find(s => s.ev === selectedEV);
    
    if (!selectedSchedule || selectedSchedule.schedules.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Use timeData if available, otherwise use defaultTimeData
    const currentTimeData = timeData.length > 0 ? timeData : defaultTimeData;
    const workProfile = generateWorkProfile(selectedSchedule.schedules, currentTimeData);
    
    const labels = workProfile.map(period => {
      const time = period.time.split(':').slice(0, 2).join(':');
      return time;
    });
    
    const data = workProfile.map(period => period.workPower);
    
    const backgroundColors = workProfile.map(period => {
      if (period.status === 'Working') {
        return 'rgba(34, 197, 94, 0.7)';
      } else {
        return 'rgba(156, 163, 175, 0.4)';
      }
    });
    
    const borderColors = workProfile.map(period => {
      if (period.status === 'Working') {
        return 'rgb(34, 197, 94)';
      } else {
        return 'rgb(156, 163, 175)';
      }
    });
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Work Power (kW)',
          data: data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0,
          stepped: true,
        },
      ],
    };
    
    console.log('✅ Chart data generated successfully:', labels.length, 'time periods');
    
    return chartData;
  };

  // Chart options
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Work Schedule for CEV ${selectedEV}`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const time = context.label;
            const status = value > 0 ? 'Working' : 'Off';
            return `${time} - ${status}: ${value} kW`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Work Power (kW)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  });

  if (numCEV === 0) {
    return (
      <Alert variant="info">
        <h5>No CEVs Configured</h5>
        <p>Please go back to Step 3 and configure at least one CEV before setting up work schedules.</p>
      </Alert>
    );
  }

  return (
    <div>
      <Alert variant="info" className="mb-4">
        <h5>🔧 CEV Work Schedule Configuration</h5>
        <p>Configure independent work schedules for each CEV. You can create multiple work periods per CEV to represent piecewise functions.</p>
        {timeData.length === 0 && (
          <Alert variant="warning" className="mt-3">
            <strong>⚠️ Using Default Time Data:</strong> Time data hasn't been configured yet (Step 6). 
            The chart below shows a preview using default 30-minute periods. 
            The actual time periods will be updated when you configure time data in Step 6.
          </Alert>
        )}
        <hr />
        <p className="mb-2"><strong>✅ Features:</strong></p>
        <ul className="mb-2">
          <li><strong>Independent Scheduling:</strong> Each CEV can have different work schedules</li>
          <li><strong>Piecewise Functions:</strong> Add multiple work periods per CEV (e.g., 8:00-12:00 and 14:00-17:00)</li>
          <li><strong>Real-time Preview:</strong> See work profile chart as you edit</li>
          <li><strong>Flexible Power:</strong> Set different work power for each period</li>
        </ul>
        <p className="mb-0"><strong>💡 Tip:</strong> Click on any field to edit. Changes are applied immediately.</p>
      </Alert>

      {/* CEV Selection */}
      <Card className="mb-4">
        <Card.Header>
          <h6>🚗 Select CEV to Configure</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            {Array.from({ length: numCEV }, (_, i) => i + 1).map(ev => (
              <Button
                key={ev}
                variant={selectedEV === ev ? 'primary' : 'outline-primary'}
                onClick={() => setSelectedEV(ev)}
              >
                CEV {ev}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Work Periods Table */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6>📅 Work Periods for CEV {selectedEV}</h6>
          <Button 
            variant="success" 
            size="sm"
            onClick={() => addWorkPeriod(selectedEV)}
          >
            ➕ Add Work Period
          </Button>
        </Card.Header>
        <Card.Body>
          {(() => {
            const selectedEVSchedules = workSchedules.find(s => s.ev === selectedEV);
            const hasSchedules = selectedEVSchedules && selectedEVSchedules.schedules && selectedEVSchedules.schedules.length > 0;
            
            return hasSchedules ? (
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Work Power (kW)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workSchedules.find(s => s.ev === selectedEV)?.schedules.map(period => (
                    <tr key={period.id}>
                      <td>
                        <Form.Control
                          type="text"
                          value={period.label}
                          onChange={(e) => updateWorkPeriod(selectedEV, period.id, 'label', e.target.value)}
                          size="sm"
                          placeholder="Enter period name"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="time"
                          value={period.startTime}
                          onChange={(e) => updateWorkPeriod(selectedEV, period.id, 'startTime', e.target.value)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="time"
                          value={period.endTime}
                          onChange={(e) => updateWorkPeriod(selectedEV, period.id, 'endTime', e.target.value)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.1"
                          min="0"
                          value={period.workPower}
                          onChange={(e) => updateWorkPeriod(selectedEV, period.id, 'workPower', parseFloat(e.target.value))}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeWorkPeriod(selectedEV, period.id)}
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="warning">
                <strong>⚠️ No work periods configured for CEV {selectedEV}</strong><br/>
                Click "Add Work Period" to create a work schedule for this CEV.
              </Alert>
            );
          })()}
        </Card.Body>
      </Card>

      {/* Work Profile Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📊 Work Profile Preview for CEV {selectedEV}</h6>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '300px' }}>
            <Line data={generateChartData()} options={getChartOptions()} />
          </div>
        </Card.Body>
      </Card>

      {/* Summary */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📈 Work Schedule Summary</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            {workSchedules.map(schedule => {
              const totalPeriods = schedule.schedules.length;
              const totalWorkTime = schedule.schedules.reduce((total, period) => {
                const start = new Date(`2000-01-01T${period.startTime}`);
                const end = new Date(`2000-01-01T${period.endTime}`);
                return total + (end - start) / (1000 * 60 * 60); // Convert to hours
              }, 0);
              const totalEnergy = schedule.schedules.reduce((total, period) => {
                const start = new Date(`2000-01-01T${period.startTime}`);
                const end = new Date(`2000-01-01T${period.endTime}`);
                const hours = (end - start) / (1000 * 60 * 60);
                return total + (period.workPower * hours);
              }, 0);

              return (
                <Col md={4} key={schedule.ev} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <h6>CEV {schedule.ev}</h6>
                      <Badge bg="primary" className="mb-2">{totalPeriods} Periods</Badge>
                      <p className="mb-1"><strong>{totalWorkTime.toFixed(1)}h</strong> Total Work</p>
                      <p className="mb-0"><strong>{totalEnergy.toFixed(1)} kWh</strong> Total Energy</p>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CEVWorkScheduler;


