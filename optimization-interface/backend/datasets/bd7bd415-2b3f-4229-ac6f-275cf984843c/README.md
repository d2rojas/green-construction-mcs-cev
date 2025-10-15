# 1MCS-1CEV-2nodes Optimization Files

This folder contains all the necessary CSV files for running the MCS-CEV optimization model.

## Files Description:

- **parameters.csv**: Model parameters and technical specifications
- **ev_data.csv**: Electric vehicle specifications and battery parameters
- **place.csv**: Location data and EV assignments
- **distance.csv**: Distance matrix between locations
- **travel_time.csv**: Travel time matrix between locations
- **time_data.csv**: Time-dependent electricity prices and CO2 emission factors
- **work.csv**: Work requirements for each EV at each location over time


## Usage:

1. Place all files in a folder named "1MCS-1CEV-2nodes"
2. Run the optimization: `julia mcs_optimization_main.jl 1MCS-1CEV-2nodes`

Generated on: 9/9/2025, 9:27:15 AM
