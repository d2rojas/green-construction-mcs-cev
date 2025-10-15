# MCS-CEV Optimization Interface

A React-based web interface with **AI-powered multi-agent system** for creating CSV files needed to run MCS-CEV optimization models.

## 🚀 **New Features - AI Multi-Agent System**

### **🤖 Intelligent AI Assistant**
- **Natural Language Processing**: Configure scenarios using conversational language
- **Multi-Agent Architecture**: Specialized AI agents for understanding, validation, recommendations, and conversation management
- **Automatic Navigation**: AI proactively guides you through all 8 configuration steps
- **Smart Validation**: Real-time validation and error detection with specific recommendations
- **Context Awareness**: AI remembers your preferences and maintains conversation context

### **🎯 Proactive User Experience**
- **No Manual Navigation**: AI automatically moves between steps when configuration is complete
- **Intelligent Recommendations**: Context-aware suggestions for optimal parameters
- **Error Prevention**: AI detects issues before they become problems
- **Conversational Interface**: Natural language interaction instead of form filling

## Features

- **Scenario Configuration**: Define number of MCSs, CEVs, and nodes
- **Model Parameters**: Configure technical parameters for the optimization model
- **Electric Vehicle Data**: Set battery specifications for each CEV
- **Location Data**: Define locations and assign EVs to construction sites
- **Time Data**: Configure time-dependent electricity prices and CO2 emission factors
- **Work Data**: Configure work schedules with automatic profile generation (grid nodes are for charging only)
- **Data Validation**: Comprehensive validation to ensure data quality and consistency
- **File Generation**: Automatically generate all required CSV files in the correct format
- **Download**: Get a ZIP file with the complete folder structure ready for optimization

## 🏗️ **System Architecture**

### **Multi-Agent System Components**
1. **Understanding Agent**: Extracts structured parameters from natural language
2. **Validation Agent**: Validates parameters against business rules and constraints
3. **Recommendation Agent**: Provides optimal values and suggestions
4. **Conversation Manager**: Manages flow and generates natural responses

### **Technical Stack**
- **Frontend**: React.js with modern UI components
- **Backend**: Node.js/Express with OpenAI API integration
- **AI System**: Multi-agent orchestration with prompt engineering
- **Data Processing**: Automated CSV generation and validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Start the backend server (in a separate terminal):
```bash
cd backend && node server.js
```

4. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

## 🎯 **Usage - AI-Powered Configuration**

### **Conversational Configuration Example**

Instead of filling forms manually, you can now configure everything through natural conversation:

```
User: "I need to configure a scenario with 2 MCS, 3 CEVs, and 4 nodes for 24-hour operation"

AI: "Perfect! I've configured your scenario. Now let's set up the technical parameters..."

User: "What charging efficiency should I use for construction equipment?"

AI: "For construction equipment, I recommend 0.92. This is more realistic for harsh conditions..."

User: "Set up work schedule from 8 AM to 5 PM with lunch break"

AI: "Great! I've configured work schedules for all construction sites. Your configuration is complete!"
```

### **Automatic Step Navigation**
The AI automatically detects when each step is complete and moves to the next step, providing:
- ✅ **No manual navigation** between steps
- ✅ **Proactive guidance** for each configuration phase
- ✅ **Smart validation** with specific recommendations
- ✅ **Context preservation** throughout the conversation

## 📋 **Configuration Steps**

### **Step 1: Scenario Configuration**
- Define MCS, CEV, and node counts
- Set 24-hour operation mode
- Provide scenario name

### **Step 2: Model Parameters**
- Configure charging efficiency, capacities, and rates
- Set time intervals and penalties
- AI provides optimal recommendations

### **Step 3: Electric Vehicle Data**
- Set battery specifications for each CEV
- Configure SOE ranges and charging rates
- AI validates technical constraints

### **Step 4: Location Data**
- Define grid nodes and construction sites
- Assign EVs to construction sites
- AI ensures proper assignments

### **Step 5: Time Data**
- Configure electricity prices and CO2 factors
- Set up peak/off-peak periods
- AI generates time profiles

### **Step 6: Matrix Data**
- Define distances and travel times
- AI ensures matrix symmetry
- Validate realistic values

### **Step 7: Work Data**
- Configure work schedules and power requirements
- AI generates complete work profiles
- Set break schedules and off-hours

### **Step 8: Summary & Generation**
- Review complete configuration
- Generate all CSV files
- Download ready-to-use optimization package

## 🧪 **Testing & Verification**

The system includes comprehensive testing scripts:

```bash
# Test the complete multi-agent system
node backend/test-system-verification.js

# Test automatic navigation
node backend/test-auto-navigation.js

# Test specific scenarios
node backend/test-complete-scenario.js

# Test prompt loading and variables
node backend/test-prompt-variables.js
```

## 📁 **Generated Files**

The interface generates the following CSV files:

- `parameters.csv` - Model parameters and technical specifications
- `ev_data.csv` - Electric vehicle specifications and battery parameters
- `place.csv` - Location data and EV assignments
- `distance.csv` - Distance matrix between locations
- `travel_time.csv` - Travel time matrix between locations
- `time_data.csv` - Time-dependent electricity prices and CO2 emission factors
- `work.csv` - Work requirements for each EV at each location over time

## 🔧 **Advanced Features**

### **AI Agent Customization**
- **Modular Prompt System**: All AI prompts stored in external files for easy modification
- **Agent Templates**: Standardized templates for creating new AI agents
- **Context Variables**: Dynamic prompt generation with user context
- **Validation Rules**: Configurable business rules and constraints

### **Error Handling & Recovery**
- **Graceful Degradation**: System continues working even if some agents fail
- **Detailed Logging**: Comprehensive logs for debugging and monitoring
- **User Feedback**: Clear error messages with actionable solutions
- **Automatic Recovery**: AI attempts to fix issues automatically

## 📚 **Documentation**

- **[System Summary](backend/SYSTEM_SUMMARY.md)**: Complete system overview
- **[Multi-Agent Documentation](backend/prompts/README.md)**: Detailed agent architecture
- **[Implementation Guide](IMPLEMENTATION_SUMMARY.md)**: Technical implementation details
- **[Usage Examples](USAGE_EXAMPLES.md)**: Practical usage scenarios
- **[Testing Guide](backend/test-system-verification.js)**: Comprehensive testing procedures

## 🎉 **Benefits**

### **For Users**
- **Faster Configuration**: Natural language instead of form filling
- **Fewer Errors**: AI validation prevents configuration mistakes
- **Better Results**: AI recommendations optimize for performance
- **Intuitive Experience**: Conversational interface is more user-friendly

### **For Developers**
- **Modular Architecture**: Easy to extend and maintain
- **Comprehensive Testing**: Automated verification of all components
- **Well Documented**: Complete documentation and examples
- **Scalable Design**: Multi-agent system can be extended with new capabilities

## 🚀 **Getting Started**

1. **Quick Start**: Run the interface and start chatting with the AI
2. **Example Scenarios**: Try the pre-configured example scenarios
3. **Custom Configuration**: Use natural language to configure your specific needs
4. **Optimization**: Download files and run your MCS-CEV optimization

The AI assistant will guide you through the entire process, making configuration faster, more accurate, and more enjoyable!
