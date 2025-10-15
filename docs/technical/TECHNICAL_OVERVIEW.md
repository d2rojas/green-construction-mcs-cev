# Technical Overview

## System Architecture

The MCS-CEV Optimization System consists of two main components:

### 1. Julia Optimization Engine
- **File**: `mcs_optimization_main.jl`
- **Purpose**: Core mathematical optimization
- **Technology**: Julia with JuMP and HiGHS solver
- **Capabilities**: 
  - Mixed-integer linear programming
  - Energy cost minimization
  - Route optimization
  - Constraint satisfaction

### 2. Web Interface
- **Location**: `optimization-interface/`
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **AI Integration**: OpenAI API for conversational configuration
- **Purpose**: User-friendly data generation and system management

## Data Flow

```
User Input → Web Interface → CSV Generation → Julia Optimization → Results
```

1. **Configuration**: User configures scenario through web interface
2. **Validation**: Real-time data validation and error checking
3. **Generation**: Automatic CSV file generation
4. **Optimization**: Julia engine processes data and finds optimal solution
5. **Results**: Comprehensive reports and visualizations

## Input Data Format

### Required CSV Files
1. **parameters.csv** - Model parameters and constraints
2. **ev_data.csv** - Electric vehicle specifications
3. **place.csv** - Location data and CEV assignments
4. **distance.csv** - Distance matrix between locations
5. **travel_time.csv** - Travel time matrix
6. **time_data.csv** - Time-dependent parameters (prices, CO2 factors)
7. **work.csv** - Work requirements and schedules

### Data Validation
- Automatic format checking
- Range validation for parameters
- Consistency verification
- Error reporting with specific messages

## Optimization Model

### Objective Function
Minimize total cost:
- Grid energy purchase costs
- Carbon emission costs
- Penalty costs for missed work

### Constraints
- Energy balance for MCS and CEV
- Charging/discharging power limits
- Travel time and distance constraints
- Work completion requirements
- Battery state of energy limits

### Variables
- Binary variables for MCS location and movement
- Continuous variables for power flows
- State variables for energy levels

## Output Format

### Visualizations
- Power profiles (charging/discharging)
- Energy state trajectories
- Location trajectories
- Cost analysis charts
- Node maps with assignments

### Data Export
- CSV files with all numerical data
- Detailed optimization logs
- Comprehensive reports
- Performance metrics

## Performance Considerations

### Scalability
- Handles multiple MCS (1-10+)
- Supports multiple CEV (1-50+)
- Manages multiple nodes (2-20+)
- 24-hour time horizon with 15-minute intervals

### Optimization Time
- Small scenarios (< 5 MCS, < 10 CEV): < 1 minute
- Medium scenarios (5-10 MCS, 10-20 CEV): 1-5 minutes
- Large scenarios (> 10 MCS, > 20 CEV): 5-30 minutes

## Current Limitations

### Model Simplifications
1. **Movement Energy**: MCS movement energy consumption is set to zero
2. **Battery Degradation**: No consideration of battery aging
3. **Grid Constraints**: Unlimited grid capacity assumed
4. **Weather Effects**: No weather-dependent factors

### Future Enhancements
1. **Movement Energy Model**: Implement realistic travel energy consumption
2. **Battery Degradation**: Add temperature and aging effects
3. **Grid Integration**: Include capacity constraints and demand response
4. **Real-time Adaptation**: Dynamic optimization with live updates

## Technology Stack

### Backend
- **Julia 1.6+**: Optimization engine
- **JuMP**: Mathematical modeling
- **HiGHS**: Linear programming solver
- **Plots.jl**: Visualization
- **DataFrames.jl**: Data manipulation

### Frontend
- **React 18**: User interface
- **Node.js**: Backend server
- **Express**: Web framework
- **OpenAI API**: AI integration
- **Material-UI**: Component library

### Development Tools
- **Git**: Version control
- **npm**: Package management
- **Julia Pkg**: Julia package management
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Deployment

### Local Development
```bash
# Start development environment
./scripts/start_system.sh
```

### Production Deployment
1. Install dependencies
2. Configure environment variables
3. Start services
4. Set up monitoring
5. Configure backups

## Security Considerations

- Input validation and sanitization
- API rate limiting
- Secure file handling
- Error message sanitization
- Access control for sensitive operations

## Monitoring and Logging

- Optimization performance metrics
- System health monitoring
- Error tracking and reporting
- User activity logging
- Resource usage monitoring
