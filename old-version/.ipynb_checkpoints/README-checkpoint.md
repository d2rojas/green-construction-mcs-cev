# MCS-CEV Optimization Model

This project implements an optimization model for Mobile Charging Stations (MCS) and Construction Electric Vehicles (CEV). The model optimizes the routing and charging schedules of MCSs to support CEVs at construction sites while minimizing costs and maximizing work completion.

## Project Structure

```
.
├── mcs_optimization_main.jl     # Main optimization script
├── src/                        # Core implementation files
│   └── core/
│       ├── DataLoader.jl       # Data loading and validation module
│       └── MCSOptimizer.jl     # Core optimization model
├── sample_simple_dataset/      # Example dataset
│   ├── csv_files/             # Input data files
│   │   ├── parameters.csv     # Model parameters
│   │   ├── ev_data.csv       # CEV specifications
│   │   ├── place.csv         # Location data
│   │   ├── distance.csv      # Distance matrix
│   │   ├── travel_time.csv   # Travel time matrix
│   │   ├── time_data.csv     # Time-dependent parameters
│   │   └── work.csv          # Work requirements
│   └── results/              # Optimization results
│       ├── ResultsLogger.jl  # Results logging module
│       ├── optimization_results_*.log
│       ├── optimization_report_*.md
│       ├── mcs_optimization_results.png
│       └── mcs_routes.png
└── README.md                  # This file
```

## Requirements

- Julia 1.6 or higher
- Required Julia packages:
  - JuMP
  - HiGHS
  - Plots
  - DataFrames
  - CSV
  - Printf
  - Dates

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install required Julia packages:
   ```julia
   julia -e 'using Pkg; Pkg.add(["JuMP", "HiGHS", "Plots", "DataFrames", "CSV", "Printf", "Dates"])'
   ```

## Data Format

### Input Files

1. `parameters.csv`:
   - Contains model parameters
   - Required columns: Parameter, Value, Unit, Description
   - Required parameters: eta_ch_dch, MCS_max, MCS_min, MCS_ini, CH_MCS, DCH_MCS, DCH_MCS_plug, C_MCS_plug, k_trv, delta_T, rho_miss

2. `ev_data.csv`:
   - Contains CEV specifications
   - Required columns: SOE_min, SOE_max, SOE_ini, ch_rate
   - Each row represents one CEV

3. `place.csv`:
   - Defines locations and CEV assignments
   - First column: Location names
   - Remaining columns: Binary indicators for CEV presence

4. `distance.csv`:
   - Distance matrix between locations
   - Square matrix with zero diagonal
   - Distances in miles

5. `travel_time.csv`:
   - Travel time matrix between locations
   - Square matrix with zero diagonal
   - Times in time intervals

6. `time_data.csv`:
   - Time-dependent parameters
   - Required columns: time, lambda_CO2, lambda_buy
   - Each row represents one time interval

7. `work.csv`:
   - Work requirements for each CEV
   - Required columns: Location, EV
   - Remaining columns: Work requirements per time interval

### Output Files

1. `optimization_results_*.log`:
   - Basic optimization metrics
   - Timestamp in filename
   - Includes objective value, solution time, energy metrics, and costs

2. `optimization_report_*.md`:
   - Detailed markdown report
   - Includes executive summary, detailed results, and visualization references
   - Timestamp in filename

3. `mcs_optimization_results.png`:
   - Visualization of charging/discharging power
   - State of energy profiles
   - Work power profiles

4. `mcs_routes.png`:
   - Visualization of MCS routes
   - Node locations and movements

## Usage

### Running the Optimization

1. Basic usage (runs with sample dataset):
   ```bash
   julia mcs_optimization_main.jl
   ```

2. Run with specific dataset:
   ```bash
   julia mcs_optimization_main.jl dataset_name
   ```

3. Run with all datasets in current directory:
   ```bash
   julia mcs_optimization_main.jl --all
   ```

### Creating a New Dataset

1. Create a new directory for your dataset:
   ```bash
   mkdir -p new_dataset/{csv_files,results}
   ```

2. Copy the required CSV files to `new_dataset/csv_files/`
   - Ensure all files follow the required format
   - Validate data using the data_loader.jl module

3. Run the optimization:
   ```bash
   julia mcs_optimization_main.jl new_dataset
   ```

## Model Description

The optimization model minimizes the following objective function:
- Grid energy purchase costs
- Carbon emission costs
- Penalty costs for missed work

Subject to constraints:
- MCS and CEV energy balance
- Charging/discharging power limits
- Travel time and distance constraints
- Work completion requirements
- Battery state of energy limits

## Results Analysis

The model generates comprehensive results including:
1. Objective value and solution time
2. Energy metrics:
   - Grid energy usage
   - Missed work
3. Cost analysis:
   - Carbon emissions
   - Electricity costs
4. MCS operations:
   - Locations over time
   - Routes between nodes
5. CEV charging sessions
6. Visualizations of key metrics, including:
   - Node labels on the node map
   - Consistent MCS start location across plots

