# MCS-CEV Optimization Project Documentation

## Overview

This document provides an index to all available documentation for the MCS-CEV (Mobile Charging Station - Construction Electric Vehicle) optimization project. The project consists of a Julia optimization model and a React-based web interface for generating input files.

## Documentation Structure

### 📚 Main Documentation

#### [README.md](README.md) - Project Overview
- **Purpose**: Main project documentation and quick start guide
- **Content**: 
  - Project description and architecture
  - Installation and setup instructions
  - Data format specifications
  - Usage examples
  - Current limitations and future work
- **Audience**: New users, developers, researchers

#### [INTERFACE_DOCUMENTATION.md](INTERFACE_DOCUMENTATION.md) - Interface Technical Guide
- **Purpose**: Complete technical documentation of the web interface
- **Content**:
  - Interface architecture and technology stack
  - Step-by-step process explanation
  - Component structure and data flow
  - File generation process
  - Validation rules and error handling
  - Performance considerations and browser compatibility
- **Audience**: Developers, technical users, interface customization

#### [INTERFACE_EXAMPLES.md](INTERFACE_EXAMPLES.md) - Practical Examples
- **Purpose**: Real-world examples of interface usage and output
- **Content**:
  - Complete scenario example (2MCS-3CEV-3nodes-24hours)
  - All generated CSV files with actual data
  - File structure explanations
  - ZIP file organization
  - Expected optimization results
- **Audience**: Users learning the interface, validation testing

#### [TECHNICAL_LIMITATIONS.md](TECHNICAL_LIMITATIONS.md) - Model Limitations and Roadmap
- **Purpose**: Technical limitations and future development plans
- **Content**:
  - Current model simplifications
  - Impact of limitations
  - Implementation roadmap (4 phases)
  - Validation and testing framework
  - Performance considerations
- **Audience**: Researchers, developers, stakeholders

#### [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Usage Scenarios
- **Purpose**: Detailed usage examples and scenarios
- **Content**:
  - Multiple scenario configurations
  - Common configuration patterns
  - Validation examples
  - Troubleshooting guide
  - Tips for successful configuration
- **Audience**: End users, scenario planners

### 🎯 Quick Start Guides

#### For New Users
1. **Start with**: [README.md](README.md) - Understand the project
2. **Then read**: [INTERFACE_EXAMPLES.md](INTERFACE_EXAMPLES.md) - See practical examples
3. **Finally**: [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Learn different scenarios

#### For Developers
1. **Start with**: [INTERFACE_DOCUMENTATION.md](INTERFACE_DOCUMENTATION.md) - Technical details
2. **Then read**: [TECHNICAL_LIMITATIONS.md](TECHNICAL_LIMITATIONS.md) - Current state and roadmap
3. **Finally**: [README.md](README.md) - Overall context

#### For Researchers
1. **Start with**: [TECHNICAL_LIMITATIONS.md](TECHNICAL_LIMITATIONS.md) - Model capabilities
2. **Then read**: [INTERFACE_EXAMPLES.md](INTERFACE_EXAMPLES.md) - Real data examples
3. **Finally**: [INTERFACE_DOCUMENTATION.md](INTERFACE_DOCUMENTATION.md) - Technical implementation

## Project Components

### 🚗 Julia Optimization Model
- **Location**: `mcs_optimization_main.jl`
- **Purpose**: Core optimization engine
- **Capabilities**: 
  - MCS routing and scheduling optimization
  - Energy cost minimization
  - Carbon emission optimization
  - Work completion guarantee
- **Documentation**: [README.md](README.md), [TECHNICAL_LIMITATIONS.md](TECHNICAL_LIMITATIONS.md)

### 🌐 React Web Interface
- **Location**: `optimization-interface/`
- **Purpose**: User-friendly CSV file generation
- **Capabilities**:
  - Step-by-step scenario configuration
  - Real-time data validation
  - Automatic file generation
  - CAISO data integration
- **Documentation**: [INTERFACE_DOCUMENTATION.md](INTERFACE_DOCUMENTATION.md), [INTERFACE_EXAMPLES.md](INTERFACE_EXAMPLES.md)

## Key Features

### ✅ Current Capabilities
- **Variable electricity pricing** optimization
- **Carbon emission** cost minimization
- **Work completion** guarantee
- **Energy balance** management
- **Real CAISO data** integration
- **Comprehensive validation** system
- **Automatic file generation**

### 🔄 Planned Enhancements
- **Movement energy losses** modeling
- **Battery degradation** effects
- **Grid capacity constraints**
- **Real-time adaptation**
- **Advanced battery models**

## Recent Fixes and Improvements

### August 2025 - Work Data Generation Fix

**Problem Resolved**: Work data in generated CSV files now correctly corresponds to user input in the interface.

**Key Changes**:
- Fixed location ID mapping inconsistency between interface and CSV generator
- Enhanced validation with robust time parsing and schedule checking
- Improved error handling and debugging capabilities
- Comprehensive testing and verification procedures

**Documentation**:
- [optimization-interface/WORK_DATA_FIXES.md](optimization-interface/WORK_DATA_FIXES.md) - Complete fix documentation
- [optimization-interface/CSV_GENERATOR_FIXES.md](optimization-interface/CSV_GENERATOR_FIXES.md) - Previous CSV fixes

**Files Modified**:
- `optimization-interface/src/components/WorkDataForm.js`
- `optimization-interface/src/utils/csvGenerator.js`
- `optimization-interface/src/utils/validators.js`

## File Formats

### Input Files (Generated by Interface)
- `parameters.csv` - Model parameters
- `ev_data.csv` - Electric vehicle specifications
- `place.csv` - Location and assignment data
- `distance.csv` - Distance matrix
- `travel_time.csv` - Travel time matrix
- `time_data.csv` - Time-dependent parameters
- `work.csv` - Work requirements (✅ Fixed August 2025)
- `CAISO-demand-*.csv` - Real demand data
- `CAISO-co2-*.csv` - Real CO2 data

### Output Files (Generated by Optimization)
- `optimization_results_*.log` - Basic metrics
- `optimization_report_*.md` - Detailed report
- `mcs_optimization_results.png` - Visualization
- `mcs_*_power_profile.png` - Power profiles

## Getting Started

### 1. Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install Julia dependencies
julia -e 'using Pkg; Pkg.add(["JuMP", "HiGHS", "Plots", "DataFrames", "CSV"])'

# Start the interface
cd optimization-interface
npm install
npm start
```

### 2. Run Optimization
```bash
# Generate files using the interface
# Then run optimization
julia mcs_optimization_main.jl scenario_name
```

### 3. View Results
- Check the `results/` directory for optimization outputs
- Review generated visualizations and reports
- Analyze cost and energy metrics

## Support and Contributing

### 📖 Documentation Updates
- All documentation is maintained in English
- Technical terms are consistently defined
- Examples are provided for all major features
- Limitations are clearly documented

### 🐛 Issue Reporting
- Use GitHub issues for bug reports
- Include scenario configuration details
- Provide error messages and logs
- Reference relevant documentation

### 🔧 Development
- Follow the roadmap in [TECHNICAL_LIMITATIONS.md](TECHNICAL_LIMITATIONS.md)
- Maintain documentation consistency
- Add examples for new features
- Update validation rules as needed

## Version Information

- **Interface Version**: 1.1.0
- **Model Version**: 2.0.0
- **Documentation Version**: 1.1.0
- **Last Updated**: August 2025
- **Recent Fixes**: Work data generation corrected

## Contact

For questions about:
- **Usage**: Check [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)
- **Technical Issues**: Check [TECHNICAL_LIMITATIONS.md](TECHNICAL_LIMITATIONS.md)
- **Interface**: Check [INTERFACE_DOCUMENTATION.md](INTERFACE_DOCUMENTATION.md)
- **Examples**: Check [INTERFACE_EXAMPLES.md](INTERFACE_EXAMPLES.md)

---

*This documentation index is maintained as part of the MCS-CEV optimization research project.*

