import React, { useState, useEffect, useCallback } from 'react';
import { Form, Alert, Card, Button, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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

const WorkDataForm = ({ data, numNodes, numCEV, timeData, locationData, onUpdate }) => {
  const [workSchedules, setWorkSchedules] = useState([]);
  const [selectedEV, setSelectedEV] = useState(1);
  const [validationErrors, setValidationErrors] = useState({ criticalErrors: [], warnings: [] });

  // Helper function to safely parse time - moved to component scope
  const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    // Handle different time formats
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!timeMatch) return null;
    
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    
    return hours * 60 + minutes; // Return minutes since midnight
  };

  // Get assigned EVs to construction sites
  const getAssignedEVs = useCallback(() => {
    if (locationData.length === 0) return [];
    
    const assignedEVs = [];
    for (let ev = 1; ev <= numCEV; ev++) {
      const assignedLocation = locationData.find(location => 
        location.evAssignments && location.evAssignments[ev] === 1
      );
      
      if (assignedLocation && assignedLocation.type === 'construction') {
        assignedEVs.push({
          ev: ev,
          location: assignedLocation.name,
          locationId: assignedLocation.id
        });
      }
    }
    return assignedEVs;
  }, [locationData, numCEV]);

  // Generate work data from schedules
  const generateWorkDataFromSchedules = useCallback((schedules = workSchedules) => {
    if (timeData.length === 0) return;

    const newWorkData = [];
    
    schedules.forEach(evSchedule => {
      const workRequirements = generateWorkProfile(evSchedule.schedules, timeData);
      
      const workItem = {
        location: evSchedule.locationId,
        ev: evSchedule.ev,
        workRequirements: workRequirements
      };
      newWorkData.push(workItem);
      
      console.log(`🔍 DEBUG: Generated work data for EV${evSchedule.ev} at location ${evSchedule.locationId}:`, {
        workItem: workItem,
        firstFewRequirements: workRequirements.slice(0, 5)
      });
    });
    
    console.log('🔍 DEBUG: Final work data being sent to parent:', newWorkData);
    onUpdate(newWorkData);
  }, [timeData, onUpdate, workSchedules]);

  // Generate work profile based on schedules
  const generateWorkProfile = (schedules, timeData) => {
    const workRequirements = [];
    
    timeData.forEach((timePoint, index) => {
      const time = timePoint.time;
      const timeParts = time.split(':');
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);
      const timeInMinutes = hour * 60 + minute;
      
      let workPower = 0;
      let status = 'Off';
      let activeSchedule = null;
      
      // Check all schedules for this time - use the first matching schedule
      for (const schedule of schedules) {
        const startTime = schedule.startTime;
        const endTime = schedule.endTime;
        
        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const startInMinutes = startHour * 60 + startMinute;
        
        const endHour = parseInt(endTime.split(':')[0]);
        const endMinute = parseInt(endTime.split(':')[1]);
        const endInMinutes = endHour * 60 + endMinute;
        
        if (timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes) {
          activeSchedule = schedule;
          break; // Use the first matching schedule
        }
      }
      
      // If we found a matching schedule, determine the status and power
      if (activeSchedule) {
        const breakStart = activeSchedule.breakStart;
        const breakEnd = activeSchedule.breakEnd;
        
        if (breakStart && breakEnd) {
          const breakStartHour = parseInt(breakStart.split(':')[0]);
          const breakStartMinute = parseInt(breakStart.split(':')[1]);
          const breakStartInMinutes = breakStartHour * 60 + breakStartMinute;
          
          const breakEndHour = parseInt(breakEnd.split(':')[0]);
          const breakEndMinute = parseInt(breakEnd.split(':')[1]);
          const breakEndInMinutes = breakEndHour * 60 + breakEndMinute;
          
          if (timeInMinutes >= breakStartInMinutes && timeInMinutes < breakEndInMinutes) {
            workPower = activeSchedule.breakPower;
            status = 'Break';
          } else {
            workPower = activeSchedule.workPower;
            status = 'Working';
          }
        } else {
          workPower = activeSchedule.workPower;
          status = 'Working';
        }
      }
      
      workRequirements.push({
        time: time,
        workPower: workPower,
        status: status
      });
    });
    
    return workRequirements;
  };

  // Initialize work schedules
  useEffect(() => {
    const assignedEVs = getAssignedEVs();
    if (assignedEVs.length > 0) {
      // Check if we already have work data from props
      if (data && data.length > 0) {
        // Convert existing work data back to schedules format
        const existingSchedules = data.map(workItem => {
          const assigned = assignedEVs.find(ev => ev.ev === workItem.ev);
          if (!assigned) return null;
          
          // Convert workRequirements back to schedules
          const schedules = convertWorkRequirementsToSchedules(workItem.workRequirements);
          
          return {
            ev: workItem.ev,
            location: assigned.location,
            locationId: assigned.locationId,
            schedules: schedules
          };
        }).filter(Boolean);
        
        if (existingSchedules.length > 0) {
          setWorkSchedules(existingSchedules);
          const validation = validateWorkSchedules(existingSchedules);
          setValidationErrors(validation);
          return;
        }
      }
      
      // If no existing data but we have timeData, generate default work data
      if (timeData.length > 0) {
        const initialSchedules = assignedEVs.map(assigned => ({
          ev: assigned.ev,
          location: assigned.location,
          locationId: assigned.locationId,
          schedules: [{
            id: 1,
            startTime: '08:00',
            endTime: '17:00',
            workPower: 2.5,
            breakStart: '12:00',
            breakEnd: '13:00',
            breakPower: 0.5,
            label: 'Standard Work Day (08:00-17:00)'
          }]
        }));
        setWorkSchedules(initialSchedules);
        
        // Generate work data immediately
        generateWorkDataFromSchedules(initialSchedules);
        
        // Validate initial schedules
        const validation = validateWorkSchedules(initialSchedules);
        setValidationErrors(validation);
        return;
      }
      
      // If no existing data, use default schedules
      const initialSchedules = assignedEVs.map(assigned => ({
        ev: assigned.ev,
        location: assigned.location,
        locationId: assigned.locationId,
        schedules: [{
          id: 1,
          startTime: '08:00',
          endTime: '17:00',
          workPower: 2.5,
          breakStart: '12:00',
          breakEnd: '13:00',
          breakPower: 0.5,
          label: 'Standard Work Day (08:00-17:00)'
        }]
      }));
      setWorkSchedules(initialSchedules);
      
      // Validate initial schedules
      const validation = validateWorkSchedules(initialSchedules);
      setValidationErrors(validation);
    }
  }, [getAssignedEVs, data, timeData.length]);

  // Load default work templates
  const loadDefaultTemplate = (templateName) => {
    const assignedEVs = getAssignedEVs();
    if (assignedEVs.length === 0) return;

    let templateSchedules = [];
    
    switch (templateName) {
      case 'standard':
        templateSchedules = [{
          id: 1,
          startTime: '08:00',
          endTime: '17:00',
          workPower: 2.5,
          breakStart: '12:00',
          breakEnd: '13:00',
          breakPower: 0.5,
          label: 'Standard Work Day (08:00-17:00)'
        }];
        break;
      
      case 'morning':
        templateSchedules = [{
          id: 1,
          startTime: '06:00',
          endTime: '14:00',
          workPower: 3.0,
          breakStart: '10:00',
          breakEnd: '10:30',
          breakPower: 0.5,
          label: 'Morning Shift (06:00-14:00)'
        }];
        break;
      
      case 'threeShifts':
        templateSchedules = [
          {
            id: 1,
            startTime: '06:00',
            endTime: '10:00',
            workPower: 2.5,
            breakStart: '08:00',
            breakEnd: '08:15',
            breakPower: 0.5,
            label: 'Morning Shift (06:00-10:00)'
          },
          {
            id: 2,
            startTime: '10:00',
            endTime: '14:00',
            workPower: 2.5,
            breakStart: '12:00',
            breakEnd: '12:15',
            breakPower: 0.5,
            label: 'Mid Shift (10:00-14:00)'
          },
          {
            id: 3,
            startTime: '14:00',
            endTime: '18:00',
            workPower: 2.5,
            breakStart: '16:00',
            breakEnd: '16:15',
            breakPower: 0.5,
            label: 'Afternoon Shift (14:00-18:00)'
          }
        ];
        break;
      
      default:
        return;
    }

    const newWorkSchedules = assignedEVs.map(assigned => ({
      ev: assigned.ev,
      location: assigned.location,
      locationId: assigned.locationId,
      schedules: templateSchedules
    }));

    setWorkSchedules(newWorkSchedules);
    setValidationErrors({ criticalErrors: [], warnings: [] });
    generateWorkDataFromSchedules(newWorkSchedules);
  };

  // Add new work schedule
  const addWorkSchedule = (ev) => {
    setWorkSchedules(prev => {
      const updatedSchedules = prev.map(schedule => {
        if (schedule.ev === ev) {
          const newId = Math.max(...schedule.schedules.map(s => s.id), 0) + 1;
          return {
            ...schedule,
            schedules: [...schedule.schedules, {
              id: newId,
              startTime: '09:00',
              endTime: '17:00',
              workPower: 2.0,
              breakStart: '12:00',
              breakEnd: '13:00',
              breakPower: 0.5,
              label: `Custom Schedule ${newId}`
            }]
          };
        }
        return schedule;
      });
      
      // Auto-validate after update
      const validation = validateWorkSchedules(updatedSchedules);
      setValidationErrors(validation);
      
      return updatedSchedules;
    });
  };

  // Remove work schedule
  const removeWorkSchedule = (ev, scheduleId) => {
    setWorkSchedules(prev => {
      const updatedSchedules = prev.map(schedule => {
        if (schedule.ev === ev) {
          return {
            ...schedule,
            schedules: schedule.schedules.filter(s => s.id !== scheduleId)
          };
        }
        return schedule;
      });
      
      // Auto-validate after update
      const validation = validateWorkSchedules(updatedSchedules);
      setValidationErrors(validation);
      
      return updatedSchedules;
    });
  };

  // Update work schedule
  const updateWorkSchedule = (ev, scheduleId, field, value) => {
    setWorkSchedules(prev => {
      const updatedSchedules = prev.map(schedule => {
        if (schedule.ev === ev) {
          return {
            ...schedule,
            schedules: schedule.schedules.map(s => {
              if (s.id === scheduleId) {
                return { ...s, [field]: value };
              }
              return s;
            })
          };
        }
        return schedule;
      });
      
      // Auto-validate after update
      const validation = validateWorkSchedules(updatedSchedules);
      setValidationErrors(validation);
      
      return updatedSchedules;
    });
  };

  // Validate work schedules - only check for logical contradictions
  const validateWorkSchedules = (schedules) => {
    const criticalErrors = [];
    const warnings = [];
    
    if (!schedules || schedules.length === 0) {
      warnings.push("No work schedules defined. Using default schedule.");
      return { criticalErrors, warnings };
    }
    
    schedules.forEach(evSchedule => {
      if (!evSchedule.schedules || evSchedule.schedules.length === 0) {
        warnings.push(`EV${evSchedule.ev}: No schedules defined. Using default schedule.`);
        return;
      }
      
      // Validate individual schedules
      evSchedule.schedules.forEach(schedule => {
        // Validate start and end times using parseTime function
        const startMinutes = parseTime(schedule.startTime);
        const endMinutes = parseTime(schedule.endTime);
        
        if (startMinutes === null) {
          criticalErrors.push(`EV${evSchedule.ev}: Invalid start time format "${schedule.startTime}" in schedule "${schedule.label || 'Unnamed'}"`);
          return;
        }
        
        if (endMinutes === null) {
          criticalErrors.push(`EV${evSchedule.ev}: Invalid end time format "${schedule.endTime}" in schedule "${schedule.label || 'Unnamed'}"`);
          return;
        }
        
        // Check if start time is before end time
        if (startMinutes >= endMinutes) {
          criticalErrors.push(`EV${evSchedule.ev}: Start time must be before end time in schedule "${schedule.label || 'Unnamed'}" (${schedule.startTime} - ${schedule.endTime})`);
        }
        
        // Validate break times if they exist
        if (schedule.breakStart && schedule.breakEnd) {
          const breakStartMinutes = parseTime(schedule.breakStart);
          const breakEndMinutes = parseTime(schedule.breakEnd);
          
          if (breakStartMinutes === null) {
            criticalErrors.push(`EV${evSchedule.ev}: Invalid break start time format "${schedule.breakStart}" in schedule "${schedule.label || 'Unnamed'}"`);
          } else if (breakEndMinutes === null) {
            criticalErrors.push(`EV${evSchedule.ev}: Invalid break end time format "${schedule.breakEnd}" in schedule "${schedule.label || 'Unnamed'}"`);
          } else {
            // Check if break is within work hours
            if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
              criticalErrors.push(`EV${evSchedule.ev}: Break time must be within work hours in schedule "${schedule.label || 'Unnamed'}"`);
            }
            
            // Check if break start is before break end
            if (breakStartMinutes >= breakEndMinutes) {
              criticalErrors.push(`EV${evSchedule.ev}: Break start must be before break end in schedule "${schedule.label || 'Unnamed'}"`);
            }
          }
        }
        
        // Validate power values
        const workPower = parseFloat(schedule.workPower);
        const breakPower = parseFloat(schedule.breakPower || 0);
        
        if (isNaN(workPower) || workPower < 0) {
          criticalErrors.push(`EV${evSchedule.ev}: Work power must be a non-negative number in schedule "${schedule.label || 'Unnamed'}"`);
        }
        
        if (isNaN(breakPower) || breakPower < 0) {
          criticalErrors.push(`EV${evSchedule.ev}: Break power must be a non-negative number in schedule "${schedule.label || 'Unnamed'}"`);
        }
      });

      // Check for overlaps between schedules for the same EV (only if multiple schedules)
      if (evSchedule.schedules.length > 1) {
        const sortedSchedules = [...evSchedule.schedules].sort((a, b) => {
          const aStart = parseTime(a.startTime) || 0;
          const bStart = parseTime(b.startTime) || 0;
          return aStart - bStart;
        });

        for (let i = 0; i < sortedSchedules.length - 1; i++) {
          const current = sortedSchedules[i];
          const next = sortedSchedules[i + 1];
          
          const currentEnd = parseTime(current.endTime) || 0;
          const nextStart = parseTime(next.startTime) || 0;
          
          if (currentEnd > nextStart) {
            criticalErrors.push(`EV${evSchedule.ev}: Overlap detected between "${current.label || 'Schedule ' + (i+1)}" (${current.startTime}-${current.endTime}) and "${next.label || 'Schedule ' + (i+2)}" (${next.startTime}-${next.endTime})`);
          }
        }
      }

      // Check total work coverage (WARNING only)
      if (evSchedule.schedules.length > 0) {
        const sortedSchedules = [...evSchedule.schedules].sort((a, b) => {
          const aStart = parseTime(a.startTime) || 0;
          const bStart = parseTime(b.startTime) || 0;
          return aStart - bStart;
        });

        const totalWorkTime = sortedSchedules.reduce((total, schedule) => {
          const startMinutes = parseTime(schedule.startTime) || 0;
          const endMinutes = parseTime(schedule.endTime) || 0;
          return total + (endMinutes - startMinutes) / 60; // Convert to hours
        }, 0);

        if (totalWorkTime < 1) { // Less than 1 hour of work scheduled
          warnings.push(`EV${evSchedule.ev}: Very little work scheduled (${totalWorkTime.toFixed(1)}h total). Consider adding more work periods.`);
        }
      }
    });
    
    return { criticalErrors, warnings };
  };

  // Auto-fix common schedule issues
  const autoFixSchedules = () => {
    const fixedSchedules = workSchedules.map(evSchedule => {
      const fixedSchedules = evSchedule.schedules.map(schedule => {
        let fixed = { ...schedule };
        
        // Fix break time if it's outside work hours
        if (schedule.breakStart && schedule.breakEnd) {
          const startTime = new Date(`2000-01-01T${schedule.startTime}:00`);
          const endTime = new Date(`2000-01-01T${schedule.endTime}:00`);
          const breakStart = new Date(`2000-01-01T${schedule.breakStart}:00`);
          const breakEnd = new Date(`2000-01-01T${schedule.breakEnd}:00`);
          
          if (breakStart < startTime) {
            fixed.breakStart = schedule.startTime;
          }
          if (breakEnd > endTime) {
            fixed.breakEnd = schedule.endTime;
          }
          if (breakStart >= breakEnd) {
            // Set break to middle of work day
            const workDuration = endTime - startTime;
            const breakStartTime = new Date(startTime.getTime() + workDuration / 2);
            fixed.breakStart = breakStartTime.toTimeString().slice(0, 5);
            const breakEndTime = new Date(breakStartTime.getTime() + 60 * 60 * 1000); // 1 hour break
            fixed.breakEnd = breakEndTime.toTimeString().slice(0, 5);
          }
        }
        
        // Ensure non-negative power values (allow zero for breaks)
        if (fixed.workPower < 0) {
          fixed.workPower = 2.5;
        }
        if (fixed.breakPower < 0) {
          fixed.breakPower = 0.0; // Allow zero power during breaks
        }
        
        return fixed;
      });
      
      return {
        ...evSchedule,
        schedules: fixedSchedules
      };
    });
    
    setWorkSchedules(fixedSchedules);
    setValidationErrors({ criticalErrors: [], warnings: [] });
    generateWorkDataFromSchedules(fixedSchedules);
  };

  // Apply work schedules
  const applyWorkSchedules = () => {
    const validation = validateWorkSchedules(workSchedules);
    setValidationErrors(validation);
    
    // Allow applying if there are no critical errors (warnings are OK)
    if (validation.criticalErrors.length === 0) {
      generateWorkDataFromSchedules(workSchedules);
    }
  };

  // Convert work requirements back to schedules (for loading existing data)
  const convertWorkRequirementsToSchedules = (workRequirements) => {
    console.log('🔍 DEBUG: Converting work requirements back to schedules:', workRequirements);
    
    if (!workRequirements || workRequirements.length === 0) {
      console.log('🔍 DEBUG: No work requirements found, using default schedule');
      return [{
        id: 1,
        startTime: '08:00',
        endTime: '17:00',
        workPower: 2.5,
        breakStart: '12:00',
        breakEnd: '13:00',
        breakPower: 0.5,
        label: 'Standard Work Day (08:00-17:00)'
      }];
    }

    // Find continuous work periods
    const schedules = [];
    let currentSchedule = null;
    let currentBreak = null;

    workRequirements.forEach((req, index) => {
      const time = req.time;
      const workPower = req.workPower;
      const status = req.status;

      if (status === 'Working' && workPower > 0) {
        if (!currentSchedule) {
          currentSchedule = {
            id: schedules.length + 1,
            startTime: time,
            workPower: workPower,
            label: `Work Period ${schedules.length + 1}`
          };
        }
      } else if (status === 'Break' && workPower > 0) {
        if (currentSchedule && !currentBreak) {
          currentBreak = {
            startTime: time,
            breakPower: workPower
          };
        }
      } else {
        // End of current period
        if (currentSchedule) {
          currentSchedule.endTime = time;
          if (currentBreak) {
            currentSchedule.breakStart = currentBreak.startTime;
            currentSchedule.breakEnd = time;
            currentSchedule.breakPower = currentBreak.breakPower;
          }
          schedules.push(currentSchedule);
          currentSchedule = null;
          currentBreak = null;
        }
      }
    });

    // Handle last schedule
    if (currentSchedule) {
      if (workRequirements.length > 0) {
        currentSchedule.endTime = workRequirements[workRequirements.length - 1].time;
      }
      if (currentBreak) {
        currentSchedule.breakStart = currentBreak.startTime;
        currentSchedule.breakEnd = currentSchedule.endTime;
        currentSchedule.breakPower = currentBreak.breakPower;
      }
      schedules.push(currentSchedule);
    }

    console.log('🔍 DEBUG: Converted schedules:', schedules);
    
    return schedules.length > 0 ? schedules : [{
      id: 1,
      startTime: '08:00',
      endTime: '17:00',
      workPower: 2.5,
      breakStart: '12:00',
      breakEnd: '13:00',
      breakPower: 0.5,
      label: 'Standard Work Day (08:00-17:00)'
    }];
  };

  // Generate chart data for selected EV
  const generateWorkChartData = () => {
    const selectedSchedule = workSchedules.find(s => s.ev === selectedEV);
    if (!selectedSchedule || selectedSchedule.schedules.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const workProfile = generateWorkProfile(selectedSchedule.schedules, timeData);
    
    const labels = workProfile.map(period => {
      const time = period.time.split(':').slice(0, 2).join(':');
      return time;
    });
    
    const data = workProfile.map(period => period.workPower);
    
    const backgroundColors = workProfile.map(period => {
      if (period.status === 'Working') {
        return 'rgba(34, 197, 94, 0.7)';
      } else if (period.status === 'Break') {
        return 'rgba(251, 146, 60, 0.7)';
      } else {
        return 'rgba(156, 163, 175, 0.4)';
      }
    });
    
    const borderColors = workProfile.map(period => {
      if (period.status === 'Working') {
        return 'rgb(34, 197, 94)';
      } else if (period.status === 'Break') {
        return 'rgb(251, 146, 60)';
      } else {
        return 'rgb(156, 163, 175)';
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Work Power (kW)',
          data: data,
          borderColor: borderColors,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          fill: true,
          tension: 0,
          stepped: true,
        },
      ],
    };
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
        text: `Work Profile for EV${selectedEV}`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const time = context.label;
            let status = 'Off';
            if (value > 0) {
              const selectedSchedule = workSchedules.find(s => s.ev === selectedEV);
              if (selectedSchedule) {
                const workProfile = generateWorkProfile(selectedSchedule.schedules, timeData);
                const period = workProfile.find(p => p.time.startsWith(time));
                status = period ? period.status : 'Working';
              }
            }
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

  const assignedEVs = getAssignedEVs();

  if (assignedEVs.length === 0) {
    return (
      <Alert variant="info">
        <h5>No Construction EVs Assigned</h5>
        <p>Please go back to the Location Data step and assign at least one EV to a construction site to configure work schedules.</p>
      </Alert>
    );
  }

  return (
    <div>
      <Alert variant="info" className="mb-4">
        <h5>Work Schedule Configuration</h5>
        <p>Configure work schedules for each EV assigned to construction sites. You can create multiple schedules per EV and use templates for common work patterns.</p>
        <hr />
        <p className="mb-0"><strong>💡 Tip:</strong> Click "Apply Schedules" to validate your configuration and check for overlaps, gaps, or inconsistencies in the time series.</p>
      </Alert>

      {/* Overall Summary */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📊 Overall Work Schedule Summary</h6>
        </Card.Header>
        <Card.Body>
          {(() => {
            if (workSchedules.length === 0) {
              return <p className="text-muted mb-0">No work schedules configured yet.</p>;
            }

            let totalWorkingHours = 0;
            let totalBreakHours = 0;
            let totalOffHours = 0;
            let totalEnergy = 0;
            let totalEVs = 0;

            workSchedules.forEach(evSchedule => {
              if (evSchedule.schedules.length > 0) {
                totalEVs++;
                const workProfile = generateWorkProfile(evSchedule.schedules, timeData);
                const workingPeriods = workProfile.filter(p => p.status === 'Working').length;
                const breakPeriods = workProfile.filter(p => p.status === 'Break').length;
                const offPeriods = workProfile.filter(p => p.status === 'Off').length;
                
                const periodDuration = timeData.length === 96 ? 0.25 : 0.5;
                totalWorkingHours += workingPeriods * periodDuration;
                totalBreakHours += breakPeriods * periodDuration;
                totalOffHours += offPeriods * periodDuration;
                totalEnergy += workProfile.reduce((sum, p) => sum + p.workPower * periodDuration, 0);
              }
            });

            return (
              <div className="row">
                <div className="col-md-2">
                  <div className="text-center">
                    <h4 className="text-primary mb-1">{totalEVs}</h4>
                    <small className="text-muted">EVs Configured</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="text-center">
                    <h4 className="text-success mb-1">{totalWorkingHours.toFixed(1)}h</h4>
                    <small className="text-muted">Working Time</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="text-center">
                    <h4 className="text-warning mb-1">{totalBreakHours.toFixed(1)}h</h4>
                    <small className="text-muted">Break Time</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="text-center">
                    <h4 className="text-muted mb-1">{totalOffHours.toFixed(1)}h</h4>
                    <small className="text-muted">Off Time</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h4 className="text-info mb-1">{totalEnergy.toFixed(1)} kWh</h4>
                    <small className="text-muted">Total Energy Consumption</small>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card.Body>
      </Card>

      {/* Default Templates */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📋 Work Schedule Templates</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => loadDefaultTemplate('standard')}
            >
              🏢 Standard Work Day (8-5)
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => loadDefaultTemplate('morning')}
            >
              🌅 Morning Shift (6-2)
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => loadDefaultTemplate('threeShifts')}
            >
              ⏰ Three 4-Hour Shifts
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* EV Selection */}
      <Card className="mb-4">
        <Card.Header>
          <h6>🚗 Select EV to Configure</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            {assignedEVs.map(assigned => (
              <Button
                key={assigned.ev}
                variant={selectedEV === assigned.ev ? 'primary' : 'outline-primary'}
                onClick={() => setSelectedEV(assigned.ev)}
              >
                EV{assigned.ev} - {assigned.location}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Work Schedules Table */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6>📅 Work Schedules for EV{selectedEV}</h6>
          <Button 
            variant="success" 
            size="sm"
            onClick={() => addWorkSchedule(selectedEV)}
          >
            ➕ Add Schedule
          </Button>
        </Card.Header>
        <Card.Body>
          {workSchedules.find(s => s.ev === selectedEV)?.schedules.length === 0 ? (
            <Alert variant="warning">
              No work schedules configured for EV{selectedEV}. Add a schedule or use a template above.
            </Alert>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Work Power (kW)</th>
                  <th>Break Start</th>
                  <th>Break End</th>
                  <th>Break Power (kW)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workSchedules.find(s => s.ev === selectedEV)?.schedules.map(schedule => (
                  <tr key={schedule.id}>
                    <td>
                      <Form.Control
                        type="text"
                        value={schedule.label}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'label', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'startTime', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'endTime', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        value={schedule.workPower}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'workPower', parseFloat(e.target.value))}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={schedule.breakStart}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'breakStart', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={schedule.breakEnd}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'breakEnd', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        value={schedule.breakPower}
                        onChange={(e) => updateWorkSchedule(selectedEV, schedule.id, 'breakPower', parseFloat(e.target.value))}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeWorkSchedule(selectedEV, schedule.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Validation Errors and Warnings */}
      {(validationErrors.criticalErrors.length > 0 || validationErrors.warnings.length > 0) && (
        <div className="mb-4">
          {validationErrors.criticalErrors.length > 0 && (
            <Alert variant="danger" className="mb-3">
              <h6>❌ Critical Errors:</h6>
              <ul className="mb-0">
                {validationErrors.criticalErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          {validationErrors.warnings.length > 0 && (
            <Alert variant="warning" className="mb-3">
              <h6>⚠️ Warnings:</h6>
              <ul className="mb-0">
                {validationErrors.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      )}

      {/* Apply Button */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {validationErrors.criticalErrors.length > 0 ? (
                <span className="text-danger">❌ {validationErrors.criticalErrors.length} critical error(s) found - Fix errors to enable Apply button</span>
              ) : validationErrors.warnings.length > 0 ? (
                <span className="text-warning">⚠️ {validationErrors.warnings.length} warning(s) found - Apply button is enabled (warnings are OK)</span>
              ) : (
                <span className="text-success">✅ All validations passed! Click 'Apply Schedules' to update the work profile</span>
              )}
            </div>
            <div className="d-flex gap-2">
              {(validationErrors.criticalErrors.length > 0 || validationErrors.warnings.length > 0) && (
                <Button 
                  variant="warning" 
                  onClick={autoFixSchedules}
                  size="sm"
                >
                  🔧 Auto-Fix Schedules
                </Button>
              )}
              <Button 
                variant="primary" 
                onClick={applyWorkSchedules}
                disabled={validationErrors.criticalErrors.length > 0}
              >
                Apply Schedules
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Work Profile Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h6>📊 Work Profile Preview for EV{selectedEV}</h6>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '300px' }}>
            <Line data={generateWorkChartData()} options={getChartOptions()} />
          </div>
          
          {/* Statistics Summary */}
          <div className="mt-3">
            <h6>📈 Work Profile Statistics</h6>
            <div className="bg-light p-3 rounded">
              {(() => {
                const selectedSchedule = workSchedules.find(s => s.ev === selectedEV);
                if (!selectedSchedule || selectedSchedule.schedules.length === 0) {
                  return <p className="text-muted mb-0">No schedules configured for this EV.</p>;
                }

                const workProfile = generateWorkProfile(selectedSchedule.schedules, timeData);
                const workingPeriods = workProfile.filter(p => p.status === 'Working').length;
                const breakPeriods = workProfile.filter(p => p.status === 'Break').length;
                const offPeriods = workProfile.filter(p => p.status === 'Off').length;
                
                // Convert periods to hours (assuming 15 or 30 minute periods)
                const periodDuration = timeData.length === 96 ? 0.25 : 0.5; // 15 min or 30 min
                const workingHoursNum = workingPeriods * periodDuration;
                const breakHoursNum = breakPeriods * periodDuration;
                const offHoursNum = offPeriods * periodDuration;
                const totalHoursNum = workingHoursNum + breakHoursNum + offHoursNum;
                
                const workingHours = workingHoursNum.toFixed(1);
                const breakHours = breakHoursNum.toFixed(1);
                const offHours = offHoursNum.toFixed(1);
                const totalHours = totalHoursNum.toFixed(1);
                
                // Calculate total energy consumption
                const totalEnergy = workProfile.reduce((sum, p) => sum + p.workPower * periodDuration, 0);
                const totalActiveHours = workingHoursNum + breakHoursNum;
                const avgPower = totalActiveHours > 0 ? totalEnergy / totalActiveHours : 0;
                
                // Calculate peak power
                const peakPower = Math.max(...workProfile.map(p => p.workPower));
                
                // Calculate utilization percentage
                const utilizationPercent = totalHoursNum > 0 ? (totalActiveHours / totalHoursNum * 100) : 0;
                
                return (
                  <div className="row">
                    <div className="col-md-6">
                      <h6>⏰ Time Distribution</h6>
                      <ul className="list-unstyled mb-0">
                        <li><strong>Working:</strong> {workingHours} hours ({workingPeriods} periods)</li>
                        <li><strong>Break:</strong> {breakHours} hours ({breakPeriods} periods)</li>
                        <li><strong>Off:</strong> {offHours} hours ({offPeriods} periods)</li>
                        <li><strong>Total:</strong> {totalHours} hours</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6>⚡ Power Analysis</h6>
                      <ul className="list-unstyled mb-0">
                        <li><strong>Total Energy:</strong> {totalEnergy.toFixed(1)} kWh</li>
                        <li><strong>Average Power:</strong> {avgPower.toFixed(2)} kW</li>
                        <li><strong>Peak Power:</strong> {peakPower.toFixed(1)} kW</li>
                        <li><strong>Utilization:</strong> {utilizationPercent.toFixed(1)}%</li>
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorkDataForm;
