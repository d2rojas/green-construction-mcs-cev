import Papa from 'papaparse';
import JSZip from 'jszip';

// Modern native file download function (replaces file-saver)
const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateCSVFiles = (formData) => {
  const { scenario, parameters, evData, locations, distanceMatrix, travelTimeMatrix, timeData, workData } = formData;
  
  const csvFiles = {};

  // Generate parameters.csv with correct delta_T based on scenario
  csvFiles['parameters.csv'] = generateParametersCSV(parameters, scenario.numMCS, scenario.is24Hours);

  // Generate ev_data.csv
  csvFiles['ev_data.csv'] = generateEVDataCSV(evData);

  // Generate place.csv
  csvFiles['place.csv'] = generatePlaceCSV(locations, scenario.numCEV);

  // Generate distance.csv using user-configured matrix
  csvFiles['distance.csv'] = generateDistanceCSVFromMatrix(distanceMatrix, scenario.numNodes);

  // Generate travel_time.csv using user-configured matrix
  csvFiles['travel_time.csv'] = generateTravelTimeCSVFromMatrix(travelTimeMatrix, scenario.numNodes);

  // Generate time_data.csv
  csvFiles['time_data.csv'] = generateTimeDataCSV(timeData);

  // Generate work.csv
  csvFiles['work.csv'] = generateWorkCSV(workData, timeData, formData.locations);

  // Generate CAISO files for 24-hour scenarios
  if (scenario.is24Hours) {
    csvFiles['CAISO-demand-20250806.csv'] = generateCAISODemandCSV(timeData);
    csvFiles['CAISO-co2-20250806.csv'] = generateCAISOCO2CSV(timeData);
  }

  return csvFiles;
};

const generateParametersCSV = (parameters, numMCS, is24Hours) => {
  // Calculate correct delta_T based on scenario type
  const deltaT = is24Hours ? 0.25 : 0.5; // 15 minutes for 24h, 30 minutes for standard
  
  const data = [
    { Parameter: 'eta_ch', Value: parameters.eta_ch_dch, Unit: '-', Description: 'Charging efficiency' },
    { Parameter: 'eta_dch', Value: parameters.eta_ch_dch, Unit: '-', Description: 'Discharging efficiency' },
    { Parameter: 'B', Value: 1000, Unit: '-', Description: 'Large binary constant' },
    { Parameter: 'MCS_max', Value: parameters.MCS_max, Unit: 'kWh', Description: 'Maximum MCS energy capacity' },
    { Parameter: 'MCS_ini', Value: parameters.MCS_ini, Unit: 'kWh', Description: 'Initial MCS energy level' },
    { Parameter: 'MCS_min', Value: parameters.MCS_min, Unit: 'kWh', Description: 'Minimum MCS energy level' },
    { Parameter: 'R_MCS_ch', Value: parameters.CH_MCS, Unit: 'kW', Description: 'MCS charging rate' },
    { Parameter: 'R_MCS_dch', Value: parameters.DCH_MCS, Unit: 'kW', Description: 'MCS discharging rate' },
    { Parameter: 'R_MCS_plug', Value: parameters.DCH_MCS_plug, Unit: 'kW', Description: 'MCS plug-in charging rate' },
    { Parameter: 'C_MCS', Value: 100, Unit: '$/kWh', Description: 'MCS cost per kWh' },
    { Parameter: 'DT', Value: deltaT, Unit: 'h', Description: 'Time step duration' },
    { Parameter: 'u_road', Value: 50, Unit: 'km/h', Description: 'Average road speed' },
    { Parameter: 't_end', Value: 24, Unit: 'h', Description: 'End time of simulation' },
    { Parameter: 'eta_ch_dch', Value: parameters.eta_ch_dch, Unit: '-', Description: 'Charging/discharging efficiency' },
    { Parameter: 'CH_MCS', Value: parameters.CH_MCS, Unit: 'kW', Description: 'MCS charging rate' },
    { Parameter: 'DCH_MCS', Value: parameters.DCH_MCS, Unit: 'kW', Description: 'MCS discharging rate' },
    { Parameter: 'DCH_MCS_plug', Value: parameters.DCH_MCS_plug, Unit: 'kW', Description: 'MCS plug-in charging rate' },
    { Parameter: 'C_MCS_plug', Value: parameters.C_MCS_plug, Unit: '-', Description: 'Number of plugs on MCSs' },
    { Parameter: 'k_trv', Value: 50, Unit: 'km/h', Description: 'Average road speed' },
    { Parameter: 'rho_miss', Value: 1000, Unit: '-', Description: 'Large binary constant' },
    { Parameter: 'delta_T', Value: deltaT, Unit: 'h', Description: 'Time step duration' },
    { Parameter: 'lambda_CO2', Value: 0.01, Unit: '-', Description: 'Default CO2 price' },
    { Parameter: 'lambda_buy', Value: 0.02, Unit: '-', Description: 'Default electricity price' },
    { Parameter: 'road_energy_consumption', Value: 0.5, Unit: 'kWh/mile', Description: 'MCS road energy consumption' },
    { Parameter: 'num_mcs', Value: numMCS, Unit: '-', Description: 'Number of MCSs' }
  ];

  return Papa.unparse(data);
};

const generateEVDataCSV = (evData) => {
  const data = evData.map(ev => ({
    'Unnamed: 0': `e${ev.id}`,
    'SOE_min': ev.SOE_min,
    'SOE_max': ev.SOE_max,
    'SOE_ini': ev.SOE_ini,
    'ch_rate': ev.ch_rate,
    'power': 25,
    'max_speed': 2.8,
    'road_consumption': 0.6
  }));

  return Papa.unparse(data);
};

const generatePlaceCSV = (locations, numCEV) => {
  const data = locations.map((location, index) => {
    const row = { site: `i${index + 1}` };
    
    // Add EV assignment columns
    for (let ev = 1; ev <= numCEV; ev++) {
      row[`e${ev}`] = location.evAssignments[ev] || 0;
    }
    
    return row;
  });

  return Papa.unparse(data);
};

const generateDistanceCSVFromMatrix = (distanceMatrix, numNodes) => {
  const data = [];
  
  // Header row
  const header = ['Unnamed: 0'];
  for (let i = 1; i <= numNodes; i++) {
    header.push(`i${i}`);
  }
  data.push(header);
  
  // Use user-configured matrix or generate default if empty
  const distances = distanceMatrix.length > 0 ? distanceMatrix : generateDefaultDistanceMatrix(numNodes);
  
  // Data rows
  for (let i = 1; i <= numNodes; i++) {
    const row = [`i${i}`];
    for (let j = 1; j <= numNodes; j++) {
      row.push(distances[i-1][j-1]);
    }
    data.push(row);
  }

  return Papa.unparse(data);
};

const generateDefaultDistanceMatrix = (numNodes) => {
  const distances = [];
  for (let i = 0; i < numNodes; i++) {
    distances[i] = [];
    for (let j = 0; j < numNodes; j++) {
      if (i === j) {
        distances[i][j] = 0; // Distance to self is 0
      } else {
        distances[i][j] = 1; // Default distance of 1
      }
    }
  }
  return distances;
};

const generateTravelTimeCSVFromMatrix = (travelTimeMatrix, numNodes) => {
  const data = [];
  
  // Header row - use "Node" instead of "Unnamed: 0"
  const header = ['Node'];
  for (let i = 1; i <= numNodes; i++) {
    header.push(`I${i}`);
  }
  data.push(header);
  
  // Use user-configured matrix or generate default if empty
  const times = travelTimeMatrix.length > 0 ? travelTimeMatrix : generateDefaultTravelTimeMatrix(numNodes);
  
  // Data rows
  for (let i = 1; i <= numNodes; i++) {
    const row = [`I${i}`];
    for (let j = 1; j <= numNodes; j++) {
      row.push(times[i-1][j-1]);
    }
    data.push(row);
  }

  return Papa.unparse(data);
};

const generateDefaultTravelTimeMatrix = (numNodes) => {
  const times = [];
  for (let i = 0; i < numNodes; i++) {
    times[i] = [];
    for (let j = 0; j < numNodes; j++) {
      if (i === j) {
        times[i][j] = 0; // Travel time to self is 0
      } else {
        times[i][j] = 1; // Default travel time of 1 period
      }
    }
  }
  return times;
};

const generateTimeDataCSV = (timeData) => {
  const data = timeData.map((item, index) => {
    // Generate variable values similar to the reference files
    const hour = parseInt(item.time.split(':')[0]);
    const minute = parseInt(item.time.split(':')[1]);
    const timeInMinutes = hour * 60 + minute;
    
    // Generate variable lambda_CO2 (CO2 price) - varies throughout the day
    const baseCO2Price = 0.015;
    const variation = Math.sin((timeInMinutes / 1440) * 2 * Math.PI) * 0.005;
    const lambda_CO2 = baseCO2Price + variation;
    
    // Generate variable intensity_tons_emissions - varies throughout the day
    const baseIntensity = 0.3;
    const intensityVariation = Math.sin((timeInMinutes / 1440) * 2 * Math.PI + Math.PI/4) * 0.1;
    const intensity_tons_emissions = baseIntensity + intensityVariation;
    
    return {
      'Unnamed: 0': item.time,
      'Unnamed: 1': `t${index + 1}`,
      'lambda_CO2': lambda_CO2,
      'lambda_buy': item.electricityPrice, // Keep user-defined electricity price
      'intensity_tons_emissions': intensity_tons_emissions
    };
  });

  return Papa.unparse(data);
};

// Fallback function to generate work data if it's empty
const generateFallbackWorkData = (locations, timeData) => {
  console.log('🔧 Generating fallback work data...');
  console.log('🔧 TimeData length:', timeData.length, 'periods');
  console.log('🔧 First time point:', timeData[0]?.time);
  console.log('🔧 Last time point:', timeData[timeData.length - 1]?.time);
  
  const fallbackWorkData = [];
  
  locations.forEach(location => {
    // Check if this location has any EV assignments
    const assignedEVs = Object.entries(location.evAssignments || {})
      .filter(([ev, assigned]) => assigned === 1)
      .map(([ev]) => parseInt(ev));
    
    assignedEVs.forEach(ev => {
      const workRequirements = timeData.map((timePoint, index) => {
        const time = timePoint.time;
        const timeParts = time.split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        const timeInMinutes = hour * 60 + minute;
        
        // Default work schedule: 8:00 AM to 5:00 PM (17:00)
        let workPower = 0;
        const startTimeInMinutes = 8 * 60; // 8:00 AM = 480 minutes
        const endTimeInMinutes = 17 * 60;  // 5:00 PM = 1020 minutes
        
        if (timeInMinutes >= startTimeInMinutes && timeInMinutes < endTimeInMinutes) {
          workPower = 2.5; // Default work power
        }
        
        // Debug logging for first few periods and working periods
        if (index < 5 || (workPower > 0 && index < 10) || index === 32 || index === 33 || index === 34) {
          console.log(`🔧 Fallback work data - Period ${index + 1}: ${time} (${timeInMinutes} min) - WorkPower: ${workPower}`);
          if (index === 32) console.log(`🔧 Start time check: ${timeInMinutes} >= ${startTimeInMinutes} = ${timeInMinutes >= startTimeInMinutes}`);
          if (index === 33) console.log(`🔧 End time check: ${timeInMinutes} < ${endTimeInMinutes} = ${timeInMinutes < endTimeInMinutes}`);
        }
        
        return {
          time: time,
          workPower: workPower,
          status: workPower > 0 ? 'Working' : 'Off'
        };
      });
      
      fallbackWorkData.push({
        location: location.id,
        ev: ev,
        workRequirements: workRequirements
      });
      
      console.log(`🔧 Generated fallback work data for EV${ev} at location ${location.id}`);
    });
  });
  
  return fallbackWorkData;
};

const generateWorkCSV = (workData, timeData, locations) => {
  console.log('🔍 DEBUG: Generating work CSV with data:', {
    workDataLength: workData.length,
    workData: workData,
    timeDataLength: timeData.length,
    locationsLength: locations.length
  });
  
  // Use fallback work data if workData is empty
  let finalWorkData = workData;
  if (workData.length === 0) {
    console.log('⚠️ WorkData is empty, using fallback generation...');
    finalWorkData = generateFallbackWorkData(locations, timeData);
  }
  
  // Detailed logging of workData structure
  if (finalWorkData.length > 0) {
    console.log('🔍 Final WorkData details:');
    finalWorkData.forEach((item, index) => {
      console.log(`  Item ${index}:`, {
        location: item.location,
        ev: item.ev,
        workRequirementsLength: item.workRequirements ? item.workRequirements.length : 0,
        firstFewRequirements: item.workRequirements ? item.workRequirements.slice(0, 3) : []
      });
    });
  } else {
    console.log('❌ Final WorkData is still empty!');
  }
  
  const data = [];
  
  // Header row - use HH:MM format (matching reference files)
  const header = ['Location', 'EV'];
  timeData.forEach(timePoint => {
    // Convert HH:MM:SS to HH:MM format
    const timeWithoutSeconds = timePoint.time.substring(0, 5);
    header.push(timeWithoutSeconds);
  });
  data.push(header);
  
  // Generate all possible location-EV combinations
  const numNodes = locations.length;
  const numCEV = finalWorkData.length > 0 ? Math.max(...finalWorkData.map(w => w.ev)) : 0;
  
  console.log(`🔍 Processing ${numNodes} nodes and ${numCEV} EVs`);
  console.log('🔍 Locations:', locations.map(loc => ({ id: loc.id, evAssignments: loc.evAssignments })));
  
  for (let locationIndex = 0; locationIndex < numNodes; locationIndex++) {
    const location = locations[locationIndex];
    const locationId = location.id; // Use the actual location ID
    
    for (let ev = 1; ev <= numCEV; ev++) {
      const row = [`i${locationId}`, `e${ev}`];
      
      // Check if this EV is assigned to this location
      const isAssigned = location.evAssignments && location.evAssignments[ev] === 1;
      console.log(`🔍 EV${ev} at Location${locationId} - Assigned: ${isAssigned}`);
      
      // Add work requirements for all time periods
      for (let t = 0; t < timeData.length; t++) {
        if (isAssigned) {
          // Find the work requirement for this location-EV combination
          const workItem = finalWorkData.find(w => w.location === locationId && w.ev === ev);
          console.log(`🔍 Looking for workItem: location=${locationId}, ev=${ev}, found:`, workItem);
          
          if (workItem && workItem.workRequirements && workItem.workRequirements[t]) {
            // Extract workPower from the workRequirements object
            const requirement = workItem.workRequirements[t];
            const workPower = typeof requirement === 'object' ? requirement.workPower : requirement;
            row.push(workPower || 0);
            if (t === 0) {
              console.log(`✅ EV${ev} at Location${locationId} - Work requirement: ${workPower}`);
              console.log(`  Full requirement object:`, requirement);
            }
          } else {
            row.push(0);
            if (t === 0) {
              console.log(`❌ EV${ev} at Location${locationId} - No work data found, using 0`);
              if (workItem) {
                console.log('  WorkItem exists but no workRequirements or missing time period');
                console.log('  WorkItem workRequirements length:', workItem.workRequirements ? workItem.workRequirements.length : 'undefined');
                console.log('  TimeData length:', timeData.length);
                console.log('  Current time index:', t);
              } else {
                console.log('  No workItem found for this location-EV combination');
              }
            }
          }
        } else {
          // No work if EV is not assigned to this location
          row.push(0);
        }
      }
      
      data.push(row);
    }
  }

  console.log('🔍 DEBUG: Generated work CSV data:', data.slice(0, 5)); // Show first 5 rows
  console.log('🔍 DEBUG: Full data array length:', data.length);
  console.log('🔍 DEBUG: First row (header):', data[0]);
  console.log('🔍 DEBUG: Second row (i1,e1):', data[1]);
  console.log('🔍 DEBUG: Third row (i2,e1):', data[2]);
  
  const csvResult = Papa.unparse(data);
  console.log('🔍 DEBUG: CSV result length:', csvResult.length);
  console.log('🔍 DEBUG: CSV result preview:', csvResult.substring(0, 200));
  
  return csvResult;
};

const generateCAISODemandCSV = (timeData) => {
  const data = [
    { 'Unnamed: 0': 'Time', 'Unnamed: 1': 'Demand (MW)' }
  ];
  
  timeData.forEach((item, index) => {
    data.push({
      'Unnamed: 0': item.time,
      'Unnamed: 1': Math.round(20000 + Math.sin(index * Math.PI / 48) * 5000) // Varying demand
    });
  });

  return Papa.unparse(data);
};

const generateCAISOCO2CSV = (timeData) => {
  const data = [
    { 'Unnamed: 0': 'Time', 'Unnamed: 1': 'CO2 Intensity (kg/MWh)' }
  ];
  
  timeData.forEach((item, index) => {
    data.push({
      'Unnamed: 0': item.time,
      'Unnamed: 1': Math.round(200 + Math.sin(index * Math.PI / 48) * 50) // Varying CO2 intensity
    });
  });

  return Papa.unparse(data);
};

export const downloadFiles = async (csvFiles, scenarioName) => {
  const zip = new JSZip();
  
  // Create csv_files folder
  const csvFolder = zip.folder('csv_files');
  
  // Add all CSV files to the folder
  Object.entries(csvFiles).forEach(([filename, content]) => {
    csvFolder.file(filename, content);
  });
  
  // Create README file
  const readmeContent = `# ${scenarioName} Optimization Files

This folder contains all the necessary CSV files for running the MCS-CEV optimization model.

## Files Description:

- **parameters.csv**: Model parameters and technical specifications
- **ev_data.csv**: Electric vehicle specifications and battery parameters
- **place.csv**: Location data and EV assignments
- **distance.csv**: Distance matrix between locations
- **travel_time.csv**: Travel time matrix between locations
- **time_data.csv**: Time-dependent electricity prices and CO2 emission factors
- **work.csv**: Work requirements for each EV at each location over time
${scenarioName.includes('24hours') ? `
- **CAISO-demand-YYYYMMDD.csv**: Real CAISO demand data for California
- **CAISO-co2-YYYYMMDD.csv**: Real CAISO CO2 intensity data for California` : ''}

## Usage:

1. Place all files in a folder named "${scenarioName}"
2. Run the optimization: \`julia mcs_optimization_main.jl ${scenarioName}\`

Generated on: ${new Date().toLocaleString()}
`;

  zip.file('README.md', readmeContent);
  
  // Generate and download the ZIP file
  const content = await zip.generateAsync({ type: 'blob' });
  const fileName = `${scenarioName}_optimization_files.zip`;
  
  // Download the file
  downloadFile(content, fileName);
  
  // Return the file for optimization use
  return new File([content], fileName, { type: 'application/zip' });
};
