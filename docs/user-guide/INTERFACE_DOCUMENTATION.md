# MCS-CEV Optimization Interface Documentation

## Overview

The MCS-CEV Optimization Interface is a React-based web application that allows users to configure and generate CSV files for mobile charging station optimization scenarios. The interface provides an intuitive step-by-step process to create all necessary input files for the Julia optimization model.

## Interface Architecture

### Technology Stack
- **Frontend**: React 18.2.0
- **UI Framework**: React Bootstrap 2.8.0
- **Charts**: Chart.js 4.5.0 + React-Chartjs-2 5.3.0
- **File Processing**: PapaParse 5.4.1 (CSV parsing)
- **File Generation**: JSZip 3.10.1 (ZIP creation)
- **File Download**: FileSaver 2.0.5

### Component Structure
```
src/
├── App.js                    # Main application component
├── components/
│   ├── ScenarioConfig.js     # Step 1: Scenario configuration
│   ├── ParametersForm.js     # Step 2: Model parameters
│   ├── EVDataForm.js         # Step 3: Electric vehicle data
│   ├── LocationDataForm.js   # Step 4: Location and EV assignments
│   ├── TimeDataForm.js       # Step 5: Time-dependent data
│   ├── MatrixDataForm.js     # Step 6: Distance and travel time matrices
│   ├── WorkDataForm.js       # Step 7: Work requirements
│   └── SummaryStep.js        # Step 8: Summary and file generation
└── utils/
    ├── csvGenerator.js       # CSV file generation logic
    └── validators.js         # Data validation functions
```

## Step-by-Step Process

### Step 1: Scenario Configuration
**Component**: `ScenarioConfig.js`

**Inputs**:
- Number of MCS (Mobile Charging Stations)
- Number of CEV (Construction Electric Vehicles)
- Number of Nodes
- 24-hour simulation flag
- Scenario name

**Validation**:
- MCS count: 1-10
- CEV count: 1-20
- Node count: 2-10
- Scenario name: Required, unique

### Step 2: Model Parameters
**Component**: `ParametersForm.js`

**Parameters**:
```javascript
{
  eta_ch_dch: 0.95,        // Charging/discharging efficiency
  MCS_max: 1000.0,         // MCS maximum capacity (kWh)
  MCS_min: 100.0,          // MCS minimum capacity (kWh)
  MCS_ini: 500.0,          // MCS initial capacity (kWh)
  CH_MCS: 50.0,            // MCS charging rate (kW)
  DCH_MCS: 50.0,           // MCS discharging rate (kW)
  DCH_MCS_plug: 50.0,      // MCS plug power (kW)
  C_MCS_plug: 4,           // Number of plugs per MCS
  k_trv: 1.0,              // Travel energy factor
  delta_T: 0.5,            // Time interval (hours)
  rho_miss: 0.6            // Missed work penalty
}
```

### Step 3: Electric Vehicle Data
**Component**: `EVDataForm.js`

**Data Structure**:
```javascript
[
  {
    SOE_min: 20,           // Minimum state of energy (kWh)
    SOE_max: 100,          // Maximum state of energy (kWh)
    SOE_ini: 80,           // Initial state of energy (kWh)
    ch_rate: 50            // Charging rate (kW)
  }
  // ... one entry per CEV
]
```

### Step 4: Location Data
**Component**: `LocationDataForm.js`

**Data Structure**:
```javascript
[
  {
    name: "Grid Node 1",           // Location name
    type: "grid",                  // "grid" or "construction"
    evAssignments: {               // EV assignment mapping
      1: 0,                       // 0 = not assigned, 1 = assigned
      2: 0,
      // ... one entry per CEV
    }
  }
  // ... one entry per node
]
```

**Validation Rules**:
- Grid nodes cannot have EVs assigned
- Each EV must be assigned to exactly one construction site
- EVs cannot be assigned to multiple locations

### Step 5: Time Data
**Component**: `TimeDataForm.js`

**Features**:
- Time range configuration with validation
- Automatic synchronization between chart and table
- CAISO template data
- Fixed value templates
- Real-time validation for overlaps and gaps

**Data Structure**:
```javascript
[
  {
    period: 1,
    time: "00:00:00",
    electricityPrice: 0.261,      // $/kWh
    co2Intensity: 0.28            // kg CO2/kWh
  }
  // ... one entry per time period
]
```

**Time Ranges Structure**:
```javascript
[
  {
    startHour: 0,
    endHour: 6,
    price: 0.261,
    co2: 0.28,
    label: "Off-peak (00:00-06:00)"
  }
  // ... configurable ranges
]
```

### Step 6: Matrix Data
**Component**: `MatrixDataForm.js`

**Matrices Generated**:
- **Distance Matrix**: Symmetric matrix of distances between nodes
- **Travel Time Matrix**: Symmetric matrix of travel times between nodes

**Data Structure**:
```javascript
// Distance matrix (miles)
[
  [0, 5, 10],    // From node 1 to nodes 1, 2, 3
  [5, 0, 8],     // From node 2 to nodes 1, 2, 3
  [10, 8, 0]     // From node 3 to nodes 1, 2, 3
]

// Travel time matrix (time intervals)
[
  [0, 2, 4],     // From node 1 to nodes 1, 2, 3
  [2, 0, 3],     // From node 2 to nodes 1, 2, 3
  [4, 3, 0]      // From node 3 to nodes 1, 2, 3
]
```

### Step 7: Work Data
**Component**: `WorkDataForm.js`

**Features**:
- Work schedule configuration
- Automatic profile generation
- Visual preview of work profiles
- Break time configuration

**Data Structure**:
```javascript
[
  {
    location: "i2",               // Node identifier
    ev: "e1",                     // EV identifier
    workSchedule: {
      startTime: "08:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      workPower: 2.5,             // kW during work
      breakPower: 0.5             // kW during breaks
    },
    requirements: [2.5, 2.5, ...] // Power requirements per time period
  }
  // ... one entry per EV-location combination
]
```

### Step 8: Summary and Generation
**Component**: `SummaryStep.js`

**Features**:
- Complete data summary
- Validation check
- File generation and download
- Progress tracking

## Generated Files and Structures

### 1. parameters.csv
**Structure**:
```csv
Parameter,Value,Unit,Description
eta_ch_dch,0.95,unitless,Charging/discharging efficiency
MCS_max,1000.0,kWh,MCS maximum capacity
MCS_min,100.0,kWh,MCS minimum capacity
MCS_ini,500.0,kWh,MCS initial capacity
CH_MCS,50.0,kW,MCS charging rate
DCH_MCS,50.0,kW,MCS discharging rate
DCH_MCS_plug,50.0,kW,MCS plug power
C_MCS_plug,4,unitless,Number of plugs per MCS
k_trv,1.0,kWh/mile,Travel energy factor
delta_T,0.5,hours,Time interval
rho_miss,0.6,unitless,Missed work penalty
```

### 2. ev_data.csv
**Structure**:
```csv
EV,SOE_min,SOE_max,SOE_ini,ch_rate
e1,20.0,100.0,80.0,50.0
e2,20.0,100.0,80.0,50.0
e3,20.0,100.0,80.0,50.0
```

### 3. place.csv
**Structure**:
```csv
site,e1,e2,e3
i1,0,0,0
i2,1,0,0
i3,0,1,1
```

### 4. distance.csv
**Structure**:
```csv
,i1,i2,i3
i1,0,5,10
i2,5,0,8
i3,10,8,0
```

### 5. travel_time.csv
**Structure**:
```csv
,i1,i2,i3
i1,0,2,4
i2,2,0,3
i3,4,3,0
```

### 6. time_data.csv
**Structure**:
```csv
Unnamed: 0,Unnamed: 1,lambda_buy,lambda_CO2
00:00:00,t1,0.261,0.28
00:30:00,t2,0.261,0.28
01:00:00,t3,0.261,0.28
...
23:30:00,t48,0.387,0.25
```

### 7. work.csv
**Structure**:
```csv
Location,EV,t1,t2,t3,...,t48
i2,e1,2.5,2.5,2.5,...,2.5
i3,e2,2.5,2.5,2.5,...,2.5
i3,e3,2.5,2.5,2.5,...,2.5
```

### 8. CAISO Data Files (24-hour scenarios)
**CAISO-demand-YYYYMMDD.csv**:
```csv
Time,Demand_MW
00:00,25000
00:15,24800
...
23:45,26000
```

**CAISO-co2-YYYYMMDD.csv**:
```csv
Time,CO2_kg_MWh
00:00,280
00:15,275
...
23:45,285
```

## File Generation Process

### 1. Data Validation
- **Real-time validation** during form input
- **Comprehensive validation** before file generation
- **Error reporting** with specific messages

### 2. CSV Generation
- **PapaParse** for CSV formatting
- **Proper escaping** of special characters
- **Consistent formatting** across all files

### 3. ZIP Creation
- **JSZip** for archive creation
- **Proper folder structure** maintained
- **README.md** included with scenario information

### 4. File Download
- **FileSaver** for browser download
- **Automatic filename** generation
- **Progress tracking** during generation

## Validation Rules

### Scenario Configuration
- MCS count: 1-10
- CEV count: 1-20
- Node count: 2-10
- Scenario name: Required, alphanumeric

### Model Parameters
- Efficiency: 0-1
- Capacities: Positive values
- Rates: Positive values
- Time interval: > 0

### EV Data
- SOE bounds: min < max
- Initial SOE: within bounds
- Charging rate: Positive

### Location Data
- Grid nodes: No EV assignments
- Construction sites: At least one EV assigned
- EV assignments: One per EV

### Time Data
- No overlapping ranges
- Complete 24-hour coverage
- Non-negative prices and CO2

### Matrix Data
- Symmetric matrices
- Zero diagonal
- Non-negative values

### Work Data
- Non-negative requirements
- Valid time periods
- Proper EV-location mapping

## Error Handling

### Validation Errors
- **Real-time feedback** during input
- **Specific error messages** for each field
- **Prevention of invalid data** entry

### Generation Errors
- **Graceful error handling** during file creation
- **User-friendly error messages**
- **Recovery suggestions**

### Network Errors
- **Download failure handling**
- **Retry mechanisms**
- **Alternative download methods**

## Performance Considerations

### Optimization
- **Lazy loading** of components
- **Memoization** of expensive calculations
- **Debounced validation** for real-time checks

### Memory Management
- **Efficient data structures**
- **Garbage collection** optimization
- **File size limits** for large datasets

### Scalability
- **Component-based architecture**
- **Modular validation system**
- **Extensible file generation**

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6+ support
- File API support
- Blob API support
- Download API support

## Security Considerations

### Data Privacy
- **No server-side storage** of user data
- **Client-side processing** only
- **Local file generation**

### Input Sanitization
- **XSS prevention** in form inputs
- **CSV injection** prevention
- **File name validation**

### Download Security
- **Safe file types** only
- **Size limits** for generated files
- **Content validation** before download

## Recent Fixes and Improvements

### Work Data Generation Fix (August 2025)

**Problem**: Work data in generated CSV files did not correspond to user input in the interface.

**Root Cause**: Inconsistency in location ID handling between WorkDataForm and csvGenerator.

**Solution**: 
- Fixed location ID mapping in `generateWorkCSV()` function
- Improved data extraction and validation
- Enhanced error handling and logging

**Files Modified**:
- `src/components/WorkDataForm.js` - Improved validation and time parsing
- `src/utils/csvGenerator.js` - Fixed location ID handling
- `src/utils/validators.js` - Enhanced work data validation

**Benefits**:
- ✅ Work requirements now match interface configuration exactly
- ✅ Correct location-EV mapping in generated files
- ✅ Robust validation prevents data inconsistencies
- ✅ Better debugging capabilities with enhanced logging

### Validation Improvements

**Enhanced Time Parsing**:
- Robust time format validation
- Support for multiple time formats (HH:MM, HH:MM:SS)
- Better error messages for invalid inputs

**Improved Schedule Validation**:
- Detection of overlapping schedules
- Validation of break times within work hours
- Power value range checking
- Comprehensive error reporting

**Data Structure Validation**:
- Verification of required properties
- Array format validation
- Type checking for work power values
- Graceful handling of missing data

### Testing and Verification

**Automated Tests**:
- Work data validation tests
- CSV generation verification
- Location ID mapping tests
- Time parsing validation

**Manual Verification**:
- Interface configuration → CSV generation → Optimization results
- End-to-end workflow testing
- Multiple scenario validation

For detailed information about recent fixes, see:
- `WORK_DATA_FIXES.md` - Complete documentation of work data fixes
- `CSV_GENERATOR_FIXES.md` - Previous CSV generation improvements

