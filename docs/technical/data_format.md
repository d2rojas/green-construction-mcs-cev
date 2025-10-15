# Data Format and Validation Guide

This document describes the required data formats and validation rules for the MCS-CEV optimization model.

## CSV File Formats

### 1. parameters.csv

Required columns:
- Parameter: Parameter name (string)
- Value: Parameter value (numeric)
- Unit: Unit of measurement (string)
- Description: Parameter description (string)

Required parameters:
```
eta_ch_dch    # Charging/discharging efficiency (0 < value ≤ 1)
MCS_max       # Maximum MCS state of energy (kWh)
MCS_min       # Minimum MCS state of energy (kWh)
MCS_ini       # Initial MCS state of energy (kWh)
CH_MCS        # MCS charging power rate (kW)
DCH_MCS       # MCS discharging power rate (kW)
DCH_MCS_plug  # Per-plug discharging power rate (kW)
C_MCS_plug    # Number of plugs on MCS
k_trv         # Energy consumption per mile (kWh/mile)
delta_T       # Time interval duration (hours)
rho_miss      # Missed work penalty cost ($/kW)
```

Validation rules:
- All numeric values must be non-negative
- eta_ch_dch must be between 0 and 1
- MCS_ini must be between MCS_min and MCS_max

### 2. ev_data.csv

Required columns:
- SOE_min: Minimum state of energy (kWh)
- SOE_max: Maximum state of energy (kWh)
- SOE_ini: Initial state of energy (kWh)
- ch_rate: Charging power rate (kW)

Validation rules:
- All values must be non-negative
- SOE_min ≤ SOE_ini ≤ SOE_max
- Each row represents one CEV

### 3. place.csv

Format:
- First column: Location names
- Remaining columns: Binary indicators (0 or 1) for CEV presence

Validation rules:
- First location must be a grid node
- At least one construction site required
- Binary values only (0 or 1)
- Each CEV must be assigned to exactly one location

### 4. distance.csv

Format:
- Square matrix
- Distances in miles
- Zero diagonal

Validation rules:
- Matrix must be square
- All values must be non-negative
- Diagonal elements must be zero
- Symmetric matrix (D[i,j] = D[j,i])

### 5. travel_time.csv

Format:
- Square matrix
- Times in time intervals
- Zero diagonal

Validation rules:
- Matrix must be square
- All values must be non-negative integers
- Diagonal elements must be zero
- Matrix dimensions must match distance matrix

### 6. time_data.csv

Required columns:
- time: Time interval index
- lambda_CO2: CO2 emission price ($/kWh)
- lambda_buy: Wholesale energy purchase price ($/kWh)

Validation rules:
- Time intervals must be consecutive
- All prices must be non-negative
- Number of time intervals must match work.csv

### 7. work.csv

Required columns:
- Location: Location index
- EV: CEV index
- Additional columns: Work requirements per time interval (kW)

Validation rules:
- Work requirements must be non-negative
- Number of time intervals must match time_data.csv
- Location and EV indices must be valid

## Data Validation Process

The data loader performs the following validation steps:

1. **File Existence**
   - Checks if all required files exist
   - Verifies file permissions

2. **Format Validation**
   - Verifies required columns
   - Checks data types
   - Validates matrix dimensions

3. **Value Validation**
   - Checks for non-negative values
   - Validates ranges (e.g., efficiency between 0 and 1)
   - Verifies binary values where required

4. **Consistency Checks**
   - Validates relationships between parameters
   - Ensures matching dimensions across files
   - Verifies time interval consistency

5. **Error Handling**
   - Provides clear error messages
   - Suggests corrections when possible
   - Logs validation issues

## Example Data

### parameters.csv
```csv
Parameter,Value,Unit,Description
eta_ch_dch,0.95,unitless,Charging/discharging efficiency
MCS_max,100,kWh,Maximum MCS state of energy
MCS_min,10,kWh,Minimum MCS state of energy
MCS_ini,50,kWh,Initial MCS state of energy
CH_MCS,50,kW,MCS charging power rate
DCH_MCS,100,kW,MCS discharging power rate
DCH_MCS_plug,25,kW,Per-plug discharging power rate
C_MCS_plug,4,unitless,Number of plugs on MCS
k_trv,2,kWh/mile,Energy consumption per mile
delta_T,0.5,hours,Time interval duration
rho_miss,100,$/kW,Missed work penalty cost
```

### ev_data.csv
```csv
SOE_min,SOE_max,SOE_ini,ch_rate
20,100,50,25
20,100,50,25
20,100,50,25
20,100,50,25
```

### place.csv
```csv
Location,EV1,EV2,EV3,EV4
Grid Node 1,0,0,0,0
Construction Site 2,1,1,0,0
Construction Site 3,0,0,1,1
```

### distance.csv
```csv
,1,2,3
1,0,5,8
2,5,0,6
3,8,6,0
```

### travel_time.csv
```csv
,1,2,3
1,0,2,3
2,2,0,2
3,3,2,0
```

### time_data.csv
```csv
time,lambda_CO2,lambda_buy
1,0.1,0.15
2,0.1,0.15
3,0.1,0.15
4,0.1,0.15
```

### work.csv
```csv
Location,EV,1,2,3,4
2,1,10,10,10,10
2,2,10,10,10,10
3,3,10,10,10,10
3,4,10,10,10,10
```

## Troubleshooting

Common issues and solutions:

1. **File Not Found**
   - Check file paths
   - Verify file names
   - Ensure correct directory structure

2. **Invalid Data Types**
   - Check for non-numeric values in numeric columns
   - Verify binary values are 0 or 1
   - Ensure proper decimal point format

3. **Dimension Mismatch**
   - Verify matrix dimensions match
   - Check number of time intervals
   - Ensure consistent indexing

4. **Value Range Errors**
   - Check for negative values
   - Verify efficiency is between 0 and 1
   - Ensure proper units

5. **Consistency Issues**
   - Verify time interval consistency
   - Check location and EV indices
   - Ensure proper relationships between parameters 