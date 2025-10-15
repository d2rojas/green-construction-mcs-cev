# Usage Examples for MCS-CEV Optimization Interface

This document provides detailed examples of how to use the interface for different scenarios.

## Example 1: Simple 2-Node Scenario

### Scenario: 1MCS-1CEV-2nodes
A basic scenario with one Mobile Charging Station, one Construction Electric Vehicle, and two nodes.

#### Configuration Steps:

1. **Scenario Configuration**
   ```
   Number of MCS: 1
   Number of CEVs: 1
   Number of Nodes: 2
   24-hour simulation: No
   Scenario Name: 1MCS-1CEV-2nodes
   ```

2. **Model Parameters**
   ```
   Charging/Discharging Efficiency: 0.95
   MCS Maximum Capacity: 1000 kWh
   MCS Minimum Capacity: 100 kWh
   MCS Initial Capacity: 500 kWh
   MCS Charging Rate: 50 kW
   MCS Discharging Rate: 50 kW
   MCS Plug Power: 50 kW
   Number of Plugs per MCS: 4
   Time Interval: 0.5 hours
   ```

3. **Electric Vehicle Data**
   ```
   EV1:
   - Minimum SOE: 20 kWh
   - Maximum SOE: 100 kWh
   - Initial SOE: 80 kWh
   - Charging Rate: 50 kW
   ```

4. **Location Data**
   ```
   Node 1 (i1): Grid Node
   - Type: Grid
   - EV Assignment: None
   
   Node 2 (i2): Construction Site
   - Type: Construction
   - EV Assignment: EV1
   ```

5. **Time Data** (48 periods for 24 hours)
   ```
   Period 1: Electricity Price $0.10/kWh, CO2 Intensity 0.05 kg/kWh
   Period 2: Electricity Price $0.12/kWh, CO2 Intensity 0.06 kg/kWh
   ... (continue for all 48 periods)
   ```

6. **Work Data**
   ```
   EV1 at Site 2: 2.5 kW work requirement for all periods
   ```

## Example 2: Complex 3-Node Scenario

### Scenario: 1MCS-2CEV-3nodes-24hours
A more complex scenario with multiple EVs and construction sites.

#### Configuration Steps:

1. **Scenario Configuration**
   ```
   Number of MCS: 1
   Number of CEVs: 2
   Number of Nodes: 3
   24-hour simulation: Yes
   Scenario Name: 1MCS-2CEV-3nodes-24hours
   ```

2. **Model Parameters** (same as Example 1)

3. **Electric Vehicle Data**
   ```
   EV1:
   - Minimum SOE: 20 kWh
   - Maximum SOE: 100 kWh
   - Initial SOE: 80 kWh
   - Charging Rate: 50 kW
   
   EV2:
   - Minimum SOE: 25 kWh
   - Maximum SOE: 120 kWh
   - Initial SOE: 90 kWh
   - Charging Rate: 60 kW
   ```

4. **Location Data**
   ```
   Node 1 (i1): Grid Node
   - Type: Grid
   - EV Assignment: None
   
   Node 2 (i2): Construction Site A
   - Type: Construction
   - EV Assignment: EV1
   
   Node 3 (i3): Construction Site B
   - Type: Construction
   - EV Assignment: EV2
   ```

5. **Time Data** (96 periods for 24 hours)
   ```
   Use the "Generate Default Data" button to create realistic time-varying data
   ```

6. **Work Data**
   ```
   EV1 at Site 2: 3.0 kW work requirement for all periods
   EV2 at Site 3: 2.5 kW work requirement for all periods
   ```

## Example 3: Multi-MCS Scenario

### Scenario: 2MCS-3CEV-4nodes-24hours
A large-scale scenario with multiple MCSs and EVs.

#### Configuration Steps:

1. **Scenario Configuration**
   ```
   Number of MCS: 2
   Number of CEVs: 3
   Number of Nodes: 4
   24-hour simulation: Yes
   Scenario Name: 2MCS-3CEV-4nodes-24hours
   ```

2. **Model Parameters**
   ```
   Charging/Discharging Efficiency: 0.92
   MCS Maximum Capacity: 1500 kWh
   MCS Minimum Capacity: 150 kWh
   MCS Initial Capacity: 750 kWh
   MCS Charging Rate: 75 kW
   MCS Discharging Rate: 75 kW
   MCS Plug Power: 75 kW
   Number of Plugs per MCS: 6
   Time Interval: 0.5 hours
   ```

3. **Electric Vehicle Data**
   ```
   EV1: Min SOE 20, Max SOE 100, Initial SOE 80, Charging Rate 50 kW
   EV2: Min SOE 25, Max SOE 120, Initial SOE 90, Charging Rate 60 kW
   EV3: Min SOE 30, Max SOE 150, Initial SOE 100, Charging Rate 70 kW
   ```

4. **Location Data**
   ```
   Node 1 (i1): Grid Node
   Node 2 (i2): Construction Site A (EV1)
   Node 3 (i3): Construction Site B (EV2)
   Node 4 (i4): Construction Site C (EV3)
   ```

5. **Time Data**
   ```
   Use "Generate Default Data" with realistic CAISO-style pricing
   ```

6. **Work Data**
   ```
   EV1 at Site 2: 3.5 kW work requirement
   EV2 at Site 3: 4.0 kW work requirement
   EV3 at Site 4: 3.0 kW work requirement
   ```

## Common Configuration Patterns

### Time Data Patterns

#### Pattern 1: Flat Rate
```
All periods: Electricity Price $0.12/kWh, CO2 Intensity 0.05 kg/kWh
```

#### Pattern 2: Time-of-Use Pricing
```
Peak hours (12-18): $0.18/kWh, 0.08 kg/kWh
Off-peak hours: $0.08/kWh, 0.03 kg/kWh
```

#### Pattern 3: Real CAISO Data
```
Use "Generate Default Data" button for realistic California grid data
```

### Work Data Patterns

#### Pattern 1: Standard Work Day
```
Work Hours: 08:00-17:00
Break: 12:00-13:00
Work Power: 2.5 kW
Break Power: 0.5 kW
```

#### Pattern 2: Extended Work Day
```
Work Hours: 06:00-18:00
Break: 12:00-13:00
Work Power: 3.0 kW
Break Power: 0.5 kW
```

#### Pattern 3: Shift-based Work
```
Morning Shift: 06:00-14:00, 3.0 kW
Afternoon Shift: 14:00-22:00, 2.0 kW
Break: 12:00-13:00, 0.5 kW
```

#### Pattern 4: Custom Schedule
```
Configure individual schedules for each EV with different work hours and power requirements
```

## Validation Examples

### Valid Configuration
```
✅ 1 MCS, 2 CEVs, 3 nodes
✅ EV1 assigned to Site 2, EV2 assigned to Site 3
✅ Grid node (Site 1) has no EVs
✅ All SOE values within bounds
✅ Symmetric distance matrix
✅ 96 time periods for 24-hour simulation
```

### Invalid Configuration (Common Errors)
```
❌ EV assigned to grid node
❌ EV not assigned to any construction site
❌ EV assigned to multiple construction sites
❌ SOE initial value outside min/max bounds
❌ Negative electricity prices
❌ Asymmetric distance matrix
❌ Insufficient time periods for 24-hour simulation
```

## Tips for Successful Configuration

1. **Start Simple**: Begin with 2-node scenarios to understand the interface
2. **Use Default Values**: Leverage the "Generate Default" buttons for realistic data
3. **Validate Early**: Check for validation errors before generating files
4. **Plan EV Assignments**: Ensure each EV is assigned to exactly one construction site
5. **Consider Time Patterns**: Use realistic electricity pricing patterns
6. **Test Small First**: Run small scenarios before scaling up to complex ones

## Troubleshooting

### Common Issues and Solutions

1. **"Grid nodes cannot have EVs assigned"**
   - Solution: Only assign EVs to construction sites

2. **"EV X must be assigned to exactly one construction site"**
   - Solution: Check that each EV has exactly one assignment

3. **"MCS maximum capacity must be greater than minimum capacity"**
   - Solution: Ensure MCS_max > MCS_min

4. **"Charging/Discharging efficiency must be between 0 and 1"**
   - Solution: Use values like 0.95 (95% efficiency)

5. **"Distance matrix is not symmetric"**
   - Solution: The interface automatically generates symmetric matrices

6. **"Insufficient time periods for 24-hour simulation"**
   - Solution: Use 96 periods for 24-hour simulations (15-minute intervals)
