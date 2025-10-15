# MCS-CEV Optimization System

A comprehensive optimization system for Mobile Charging Stations (MCS) and Construction Electric Vehicles (CEV) that minimizes energy costs while ensuring work completion at construction sites.

## 🚀 Quick Start

### Prerequisites
- Julia 1.6+ 
- Node.js 16+
- npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd mcs-cev-optimization

# Install Julia dependencies
julia -e 'using Pkg; Pkg.add(["JuMP", "HiGHS", "Plots", "DataFrames", "CSV", "Printf", "Dates"])'

# Install Node.js dependencies
cd optimization-interface
npm install
```

### Running the System
```bash
# Start the web interface (recommended)
./scripts/start_system.sh

# Or run optimization directly
julia mcs_optimization_main.jl datasets/sample/sample_simple_dataset
```

## 📁 Project Structure

```
├── README.md                          # This file
├── mcs_optimization_main.jl           # Main optimization script
├── src/                               # Core Julia modules
│   └── core/
│       ├── DataLoader.jl             # Data loading and validation
│       └── MCSOptimizer.jl           # Core optimization model
├── optimization-interface/            # Web interface (React + Node.js)
├── docs/                              # Documentation
│   ├── user-guide/                   # User documentation
│   ├── technical/                    # Technical documentation
│   └── api/                          # API documentation
├── datasets/                          # Data files
│   ├── sample/                       # Sample datasets
│   └── generated/                    # Generated datasets
├── examples/                          # Example files and GAMS models
├── scripts/                           # Utility scripts
└── tests/                            # Test files
```

## 🎯 Key Features

- **Mathematical Optimization**: Julia-based optimization using JuMP and HiGHS
- **Web Interface**: React-based interface with AI-powered configuration
- **Real-time Validation**: Automatic data validation and error handling
- **Comprehensive Results**: Detailed visualizations and CSV exports
- **Scalable**: Handles multiple MCS, CEV, and construction sites

## 📊 System Capabilities

### Optimization Model
- Minimizes grid energy purchase costs
- Reduces carbon emission costs
- Ensures work completion requirements
- Optimizes MCS routing and scheduling

### Web Interface
- 8-step guided configuration process
- AI-powered conversational setup
- Real-time data validation
- Automatic CSV file generation

### Results & Analysis
- 8 detailed visualization charts
- CSV data export for further analysis
- Comprehensive optimization reports
- Cost and energy metrics

## 📚 Documentation

- **[User Guide](docs/user-guide/)** - How to use the system
- **[Technical Docs](docs/technical/)** - Implementation details
- **[API Reference](docs/api/)** - Interface specifications

## 🔧 Usage Examples

### Basic Optimization
```bash
julia mcs_optimization_main.jl datasets/sample/sample_simple_dataset
```

### Web Interface
1. Start the system: `./scripts/start_system.sh`
2. Open browser: http://localhost:3001
3. Follow the AI-guided configuration
4. Download generated CSV files
5. Run optimization with your dataset

### Custom Dataset
```bash
# Create your dataset directory
mkdir -p datasets/generated/my_scenario/{csv_files,results}

# Add your CSV files to csv_files/
# Run optimization
julia mcs_optimization_main.jl datasets/generated/my_scenario
```

## 📈 Results

Each optimization generates:
- **Visualizations**: 8 PNG charts showing power profiles, energy states, and routes
- **Data Export**: CSV files with all numerical data
- **Reports**: Detailed optimization reports and logs
- **Metrics**: Cost analysis, energy usage, and performance indicators

## 🧪 Testing

```bash
# Run system tests
./scripts/test_system.sh

# Test specific components
julia -e 'include("tests/test_optimizer.jl")'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request



For questions and support:
- Check the [documentation](docs/)
- Review [examples](examples/)
- Open an issue on GitHub

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready