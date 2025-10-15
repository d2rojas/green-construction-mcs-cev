# Scenario Comparison Documentation

## Purpose

The scenario comparison script is designed to **quantitatively and visually compare the performance of different charging strategies** for construction electric vehicles (CEVs) and mobile charging stations (MCSs). This helps to demonstrate the value of optimization and to benchmark against more basic or naive strategies.

---

## Scenarios Compared

The script evaluates **four distinct scenarios**:

1. **Optimized MCS (Scenario 1)**
   - Uses the full optimization model.
   - Jointly optimizes MCS routing, charging/discharging schedules, and CEV charging to minimize total cost (electricity, carbon, missed work).
   - This is your "best case" scenario.

2. **Non-Optimized MCS (Scenario 2)**
   - Uses MCS, but with a fixed, non-optimized schedule.
   - MCS charges at grid nodes during off-peak hours and discharges at construction sites during work hours, without regard to price or demand fluctuations.
   - Represents a naive use of MCS.

3. **Worst Case MCS (Scenario 3)**
   - Uses MCS, but with the worst possible schedule.
   - MCS charges at grid nodes during peak hours (highest electricity prices and emissions) and discharges during low-demand periods.
   - Represents the worst possible use of MCS technology.

4. **Fixed Charging Stations (Scenario 4, Baseline)**
   - No MCS is used.
   - CEVs are charged only at fixed charging stations at construction sites.
   - Represents the traditional approach, serving as a baseline for comparison.

---

## Metrics Compared

For each scenario, the following metrics are computed and compared:

- **Objective Value ($):** Total cost, including electricity, carbon emissions, and penalties for missed work.
- **Energy from Grid (kWh):** Total energy drawn from the grid.
- **Missed Work (kWh):** Amount of work not completed due to insufficient energy.
- **Carbon Emissions ($):** Cost associated with carbon emissions.
- **Electricity Cost ($):** Total cost of electricity purchased.
- **Work Completion (%):** Percentage of required work completed.
- **Solve Time (s):** Time taken to solve the scenario.

---

## How the Comparison is Performed

1. **Data Loading:**  
   The script loads the dataset (CSV files) for the selected scenario.

2. **Scenario Execution:**  
   Each scenario is run sequentially:
   - The optimization model is solved for the "Optimized MCS" scenario.
   - A simplified, fixed-schedule model is solved for the "Non-Optimized MCS" scenario.
   - A worst-case model with peak-hour charging is solved for the "Worst Case MCS" scenario.
   - A baseline model with only fixed charging stations is solved for the "Fixed Charging Stations" scenario.

3. **Result Extraction:**  
   For each scenario, the script extracts the relevant metrics listed above.

4. **Reporting and Visualization:**  
   - A **comparison table** is printed to the terminal.
   - **Improvement analysis** is performed, showing the percentage improvement of the optimized scenario over the others.
   - **Bar plots** are generated for visual comparison of key metrics.
   - A **detailed markdown report** is saved, summarizing all results and improvements.

5. **Output Location:**  
   All results, plots, and reports are saved in a timestamped subdirectory under the dataset's `results/` folder.

---

## How to Run

From the project root, run:

```sh
julia scenario_comparison.jl <dataset_name>
```
For example:
```sh
julia scenario_comparison.jl sample_simple_dataset
julia scenario_comparison.jl 1MCS-1CEV-2nodes
```

---

## Output Files

- `scenario_comparison_plots.png`: Bar plots comparing all scenarios.
- `scenario_comparison_report.md`: Markdown report with tables and improvement analysis.

---

## Customization

- You can add more scenarios by extending the script.
- The metrics and plots can be customized as needed. 