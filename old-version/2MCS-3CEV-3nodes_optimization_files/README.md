# 2MCS-3CEV-3nodes Optimization Files

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

1. Place all files in a folder named "2MCS-3CEV-3nodes"
2. Run the optimization: `julia mcs_optimization_main.jl 2MCS-3CEV-3nodes`

Generated on: 8/25/2025, 10:43:41 PM
