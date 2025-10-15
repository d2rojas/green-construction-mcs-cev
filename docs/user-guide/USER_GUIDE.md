# User Guide

## Getting Started

### System Requirements
- Julia 1.6 or higher
- Node.js 16 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 4GB RAM minimum, 8GB recommended
- 1GB free disk space

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mcs-cev-optimization
   ```

2. **Install Julia dependencies**
   ```bash
   julia -e 'using Pkg; Pkg.add(["JuMP", "HiGHS", "Plots", "DataFrames", "CSV", "Printf", "Dates"])'
   ```

3. **Install Node.js dependencies**
   ```bash
   cd optimization-interface
   npm install
   ```

## Using the Web Interface

### Starting the System
```bash
# From the project root directory
./scripts/start_system.sh
```

This will:
- Start the backend server on port 3002
- Start the frontend on port 3001
- Open your browser automatically
- Provide status updates

### Configuration Process

The web interface guides you through 8 configuration steps:

#### Step 1: Scenario Configuration
- Number of MCS (Mobile Charging Stations)
- Number of CEV (Construction Electric Vehicles)
- Number of nodes (construction sites)
- Operation mode (24-hour recommended)
- Scenario name

#### Step 2: Model Parameters
- Charging/discharging efficiency
- MCS capacity and power rates
- Time intervals and penalty factors
- Energy constraints

#### Step 3: Electric Vehicle Data
- Battery specifications for each CEV
- State of Energy (SOE) limits
- Charging rates
- Initial energy levels

#### Step 4: Location Data
- Network nodes and construction sites
- CEV assignments to sites
- Location validation

#### Step 5: Time Data
- Electricity prices over time
- CO2 emission factors
- Peak/off-peak periods
- Time-dependent parameters

#### Step 6: Distance and Travel Time
- Distance matrix between locations
- Travel time matrix
- Matrix validation and symmetry checks

#### Step 7: Work Requirements
- Work schedules for each CEV
- Power requirements per time period
- Break periods and non-working hours
- Work profile generation

#### Step 8: Summary and Generation
- Review complete configuration
- Generate all CSV files
- Download ready-to-use dataset package

### AI-Powered Configuration

The system includes an AI assistant that can:
- Guide you through the configuration process
- Provide intelligent recommendations
- Validate your inputs in real-time
- Automatically navigate between steps
- Answer questions about the system

**Example conversation:**
```
User: "I need to configure a scenario with 2 MCS, 3 CEV and 4 nodes"
AI: "I'll help you set up that scenario. Let me start with the basic configuration..."
```

## Running Optimization

### Using Generated Data
1. Download the ZIP file from the web interface
2. Extract to a new directory in `datasets/generated/`
3. Run optimization:
   ```bash
   julia mcs_optimization_main.jl datasets/generated/your_scenario_name
   ```

### Using Sample Data
```bash
julia mcs_optimization_main.jl datasets/sample/sample_simple_dataset
```

### Command Line Options
```bash
# Run with specific dataset
julia mcs_optimization_main.jl dataset_name

# Run with all datasets in current directory
julia mcs_optimization_main.jl --all

# Run with verbose output
julia mcs_optimization_main.jl dataset_name --verbose
```

## Understanding Results

### Output Files
Each optimization generates files in `dataset/results/timestamp/`:

#### Visualizations (PNG files)
- `mcs_optimization_results.png` - Combined overview
- `01_total_grid_power_profile.png` - Grid power consumption
- `02_work_profiles_by_site.png` - Work power by site
- `03_mcs_state_of_energy.png` - MCS energy levels
- `04_cev_state_of_energy.png` - CEV energy levels
- `05_electricity_prices.png` - Price profiles
- `06_mcs_location_trajectory.png` - MCS movements
- `07_node_map_with_cev_assignments.png` - Network map
- `08_optimization_summary.png` - Summary metrics

#### Data Files (CSV)
- Corresponding CSV files for each visualization
- Numerical data for further analysis
- Time-series data with 15-minute intervals

#### Reports
- `optimization_log.txt` - Detailed optimization log
- `optimization_report.txt` - Comprehensive results report

### Key Metrics
- **Total Energy from Grid**: Total energy purchased from grid
- **Total Missed Work**: Energy not delivered due to constraints
- **Carbon Emissions Cost**: Cost of CO2 emissions
- **Electricity Cost**: Cost of grid energy
- **Solution Status**: OPTIMAL, FEASIBLE, or INFEASIBLE
- **Solution Time**: Time to find optimal solution

## Troubleshooting

### Common Issues

#### "Julia not found"
- Ensure Julia is installed and in your PATH
- Try running `julia --version` to verify installation

#### "Package not found"
- Run the installation command again
- Check Julia package registry: `julia -e 'using Pkg; Pkg.status()'`

#### "Port already in use"
- Stop other services using ports 3001 or 3002
- Or modify ports in the configuration files

#### "Optimization failed"
- Check input data format and values
- Verify all required CSV files are present
- Review error messages in the log files

#### "Web interface not loading"
- Check if both frontend and backend are running
- Verify ports are accessible
- Check browser console for errors

### Getting Help

1. **Check the logs**
   - Backend logs: `optimization-interface/backend/logs/`
   - Optimization logs: `dataset/results/timestamp/optimization_log.txt`

2. **Review documentation**
   - Technical documentation in `docs/technical/`
   - Examples in `examples/`

3. **Validate your data**
   - Use the web interface validation features
   - Check CSV file formats against documentation

4. **Test with sample data**
   - Try running with `datasets/sample/sample_simple_dataset`
   - Compare your configuration with working examples

## Best Practices

### Data Preparation
- Use realistic parameter values
- Ensure data consistency across files
- Validate time formats and ranges
- Check matrix symmetry for distances and travel times

### Optimization Settings
- Start with smaller scenarios for testing
- Use 24-hour operation mode for realistic results
- Set appropriate penalty factors for missed work
- Consider peak/off-peak electricity pricing

### Results Analysis
- Review all visualization charts
- Check energy balance and constraints
- Analyze cost breakdowns
- Validate work completion requirements

### Performance Optimization
- Use appropriate time intervals (15 minutes recommended)
- Limit scenario size for initial testing
- Monitor solution times and adjust parameters
- Consider parallel processing for multiple scenarios

## Advanced Usage

### Custom Scenarios
- Create your own dataset directories
- Modify CSV files for specific requirements
- Use the web interface for validation
- Test with different parameter combinations

### Batch Processing
- Run multiple scenarios automatically
- Use scripts for parameter sweeps
- Generate comparison reports
- Export results for external analysis

### Integration
- Import results into other tools (Excel, Python, R)
- Use CSV exports for custom analysis
- Integrate with existing energy management systems
- Connect to real-time data sources
