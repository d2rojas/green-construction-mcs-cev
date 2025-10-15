# MCS-CEV Optimization Model Documentation

## Overview

The MCS-CEV (Mobile Charging Station - Construction Electric Vehicle) optimization model is designed to optimize the operation of mobile charging stations that support construction electric vehicles. The model determines optimal routes and charging schedules while minimizing costs and maximizing work completion.

## Mathematical Formulation

### Sets

- M: Set of Mobile Charging Stations (MCSs)
- T: Set of time intervals
- N: Set of nodes (locations)
- N_g: Set of grid connection nodes
- N_c: Set of construction facility nodes
- E: Set of Construction Electric Vehicles (CEVs)
- S: Set of paths (i,j) between nodes

### Parameters

#### MCS Parameters
- C_MCS_plug: Number of plugs on MCSs
- CH_MCS: Charging power rate of MCSs (kW)
- DCH_MCS: Discharging power rate of MCSs (kW)
- DCH_MCS_plug: Discharging power rate per plug (kW)
- SOE_MCS_ini: Initial state of energy (kWh)
- SOE_MCS_max: Maximum state of energy (kWh)
- SOE_MCS_min: Minimum state of energy (kWh)

#### CEV Parameters
- CH_CEV[e]: Charging power rate of CEV e (kW)
- SOE_CEV_ini[e]: Initial state of energy of CEV e (kWh)
- SOE_CEV_max[e]: Maximum state of energy of CEV e (kWh)
- SOE_CEV_min[e]: Minimum state of energy of CEV e (kWh)

#### Network Parameters
- D[i,j]: Distance between nodes i and j (miles)
- tau_trv[i,j]: Travel time between nodes i and j (time intervals)
- A[i,e]: Binary parameter; 1 if CEV e is located at node i

#### Work Parameters
- R_work[i,e,t]: Power consumption of CEV e at node i in time t (kW)

#### Cost Parameters
- lambda_whl_elec[t]: Wholesale energy purchase price ($/kWh)
- lambda_CO2[t]: CO2 emission price ($/kWh)
- rho_miss: Penalty cost for missed work ($/kW)

#### Other Parameters
- k_trv: Energy consumed per mile during MCS travel (kWh/mile)
- eta_ch_dch: Charging/discharging efficiency
- delta_T: Time interval duration (hours)

### Variables

#### Power Variables
- P_ch_MCS[m,i,t]: Charging power of MCS m at node i in time t (kW)
- P_dch_MCS[m,i,t]: Discharging power of MCS m at node i in time t (kW)
- P_MCS_CEV[m,i,e,t]: Power transferred from MCS m to CEV e at node i in time t (kW)
- P_work[i,e,t]: Power consumed by CEV e for work at node i in time t (kW)
- P_miss_work[i,e,t]: Power corresponding to missed work (kW)

#### Energy Variables
- L_trv[m,i,j,t]: Energy consumed by MCS m for travel between i and j in time t (kWh)
- SOE_MCS[m,t]: State of energy of MCS m in time t (kWh)
- SOE_CEV[e,t]: State of energy of CEV e in time t (kWh)

#### Binary Variables
- rho[m,i,e,t]: 1 if CEV e connects to MCS m at node i in time t
- gamma_arr[m,i,t]: 1 if MCS m arrives at node i in time t
- sigma_dep[m,i,t]: 1 if MCS m departs from node i in time t
- x[m,i,j,t]: 1 if MCS m travels from i to j in time t
- mu[i,e,t]: 1 if any MCS charges CEV e at node i in time t
- z[m,i,t]: 1 if MCS m is at node i in time t

### Objective Function

Minimize:
```
∑(P_ch_tot[m,t] * (lambda_CO2[t] + lambda_whl_elec[t]) * delta_T) + 
∑(P_miss_work[i,e,t] * rho_miss)
```

### Key Constraints

1. **Power Balance**
   - Total charging power equals sum of individual charging powers
   - Total discharging power equals sum of power to CEVs
   - No charging at construction nodes
   - No discharging at grid nodes

2. **Power Limits**
   - Charging power limited by MCS capacity
   - Discharging power limited by MCS capacity
   - Per-plug discharging power limits
   - CEV charging power limits

3. **Work Constraints**
   - Work power limited by requirements
   - Missed work calculation
   - Prevention of simultaneous charging and working

4. **Energy Balance**
   - MCS energy consumption during travel
   - MCS state of energy updates
   - CEV state of energy updates
   - Energy limits for both MCS and CEV

5. **Spatial Movement**
   - MCS plug connection limits
   - CEV location constraints
   - Flow conservation
   - Connection status updates
   - Initial conditions
   - Travel time constraints

## Implementation Details

### Data Loading

The model uses a modular data loading system that:
1. Validates input data format and values
2. Converts data to appropriate types
3. Creates necessary sets and parameters
4. Handles missing or invalid data gracefully

### Optimization Solver

The model uses the HiGHS solver through JuMP with:
- Time limit: 600 seconds (10 minutes)
- Default solver parameters for MIP
- Warm start capabilities

### Results Processing

Results are processed in multiple formats:
1. Numerical results (objective value, costs, etc.)
2. Time series data (power profiles, energy levels)
3. Spatial data (routes, locations)
4. Visualizations (plots, graphs)

## Performance Considerations

1. **Model Size**
   - Number of variables grows with:
     - Number of MCSs
     - Number of CEVs
     - Number of nodes
     - Number of time intervals
   - Solution time increases exponentially with problem size

2. **Solution Quality**
   - Trade-off between solution time and optimality
   - Gap tolerance can be adjusted
   - Warm starts can improve performance

3. **Memory Usage**
   - Large matrices for distances and times
   - Sparse storage for binary variables
   - Efficient data structures for results

## Extensions and Modifications

The model can be extended in several ways:
1. Multiple MCS types with different characteristics
2. Time-dependent travel times
3. Stochastic work requirements
4. Battery degradation considerations
5. Grid capacity constraints
6. Renewable energy integration

## Validation and Testing

The model includes:
1. Input data validation
2. Constraint satisfaction checks
3. Energy balance verification
4. Solution feasibility testing
5. Performance benchmarking 