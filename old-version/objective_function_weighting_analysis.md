# Objective Function Weighting Analysis: Carbon Emissions vs Electricity Costs

## 🎯 Objective Function Structure

### **Current Objective Function:**
```julia
@objective(model, Min,
    sum(lambda_whl_elec[t] * P_ch_tot[m,t] * delta_T for m in M, t in T) +  # Electricity cost
    sum(lambda_CO2[t] * P_ch_tot[m,t] * delta_T for m in M, t in T) +      # Carbon emissions cost
    sum(rho_miss * P_miss_work[i,e,t] * delta_T for i in N, e in E, t in T)  # Missed work penalty
)
```

### **Mathematical Form:**
```
Minimize: Σ(P_ch_tot[m,t] × (λ_whl_elec[t] + λ_CO2[t]) × ΔT) + Σ(P_miss_work[i,e,t] × ρ_miss)
```

## 📊 Parameter Values Analysis

### **From Latest Run (1MCS-2CEV-2nodes-24hours):**

| Parameter | Value Range | Units | Description |
|-----------|-------------|-------|-------------|
| **λ_whl_elec** | 0.261 - 0.627 | $/kWh | Electricity price |
| **λ_CO2** | 0.121 - 0.312 | tons CO2/MWh | Carbon intensity |
| **P_ch_tot** | 0 - 125 | kW | Charging power |
| **ΔT** | 0.25 | hours | Time step |

## 🔍 Weighting Analysis

### **1. Direct Comparison of Parameters**

**Electricity Price (λ_whl_elec):**
- **Range**: 0.261 - 0.627 $/kWh
- **Average**: ~0.387 $/kWh
- **Units**: Dollars per kilowatt-hour

**Carbon Intensity (λ_CO2):**
- **Range**: 0.121 - 0.312 tons CO2/MWh
- **Average**: ~0.200 tons CO2/MWh
- **Units**: Metric tons CO2 per megawatt-hour

### **2. Unit Conversion for Fair Comparison**

**To compare apples to apples, we need to convert to the same units:**

**Carbon Intensity Conversion:**
- **Current**: 0.200 tons CO2/MWh
- **Convert to**: 0.200 kg CO2/kWh (1 ton = 1000 kg, 1 MWh = 1000 kWh)
- **Carbon Price**: Need to assign a dollar value per kg CO2

### **3. Carbon Pricing Analysis**

**To determine if carbon emissions have the same weight as electricity costs, we need a carbon price:**

**Common Carbon Prices:**
- **Social Cost of Carbon (US)**: ~$51/ton CO2 = $0.051/kg CO2
- **California Cap-and-Trade**: ~$30/ton CO2 = $0.030/kg CO2
- **EU Emissions Trading**: ~$80/ton CO2 = $0.080/kg CO2

**Carbon Cost Calculation:**
```
Carbon Cost = λ_CO2 × Carbon Price × P_ch_tot × ΔT
Carbon Cost = 0.200 kg CO2/kWh × $0.051/kg CO2 × P_ch_tot × ΔT
Carbon Cost = $0.0102/kWh × P_ch_tot × ΔT
```

### **4. Weighting Comparison**

**Electricity Cost:**
- **Average Rate**: $0.387/kWh
- **Weight**: 100% (direct dollar cost)

**Carbon Cost (with Social Cost of Carbon):**
- **Effective Rate**: $0.0102/kWh
- **Weight**: 2.6% of electricity cost

**Carbon Cost (with California Cap-and-Trade):**
- **Effective Rate**: $0.0060/kWh
- **Weight**: 1.5% of electricity cost

**Carbon Cost (with EU ETS):**
- **Effective Rate**: $0.0160/kWh
- **Weight**: 4.1% of electricity cost

## 📈 Current Results Analysis

### **From Latest Run:**
```
Total Energy from Grid: 46.65 kWh
Total Electricity Cost: $12.18
Total Carbon Emissions Cost: $5.83
```

### **Cost Breakdown:**
- **Electricity**: $12.18 (67.6% of total cost)
- **Carbon**: $5.83 (32.4% of total cost)

### **Effective Carbon Price Implied:**
```
Effective Carbon Price = Carbon Cost / (Energy × Average Carbon Intensity)
Effective Carbon Price = $5.83 / (46.65 kWh × 0.200 tons CO2/MWh)
Effective Carbon Price = $5.83 / 0.00933 tons CO2
Effective Carbon Price = $625/ton CO2
```

## 🚨 Critical Finding: Implied Carbon Price is Extremely High!

### **Comparison with Real Carbon Prices:**
- **Implied Carbon Price**: $625/ton CO2
- **Social Cost of Carbon**: $51/ton CO2
- **California Cap-and-Trade**: $30/ton CO2
- **EU Emissions Trading**: $80/ton CO2

**The implied carbon price is 12x higher than the Social Cost of Carbon!**

## 🎯 Objective Function Weighting Conclusion

### **Current Weighting:**
1. **Electricity Cost**: 67.6% of total cost
2. **Carbon Emissions**: 32.4% of total cost
3. **Missed Work**: 0% (100% work completion)

### **Is the Weighting Appropriate?**

**❌ NO - Carbon emissions are significantly overweighted!**

**Reasons:**
1. **Implied carbon price ($625/ton) is unrealistically high**
2. **Carbon cost should be ~2-4% of electricity cost, not 32%**
3. **This creates a bias toward environmental optimization over economic efficiency**

## 🔧 Recommendations

### **Option 1: Adjust Carbon Intensity Values**
```julia
# Scale down carbon intensity to realistic levels
lambda_CO2_scaled = lambda_CO2 * (51/625)  # Scale to Social Cost of Carbon
```

### **Option 2: Add Carbon Price Parameter**
```julia
# Add explicit carbon price parameter
carbon_price = 51.0  # $/ton CO2
@objective(model, Min,
    sum(lambda_whl_elec[t] * P_ch_tot[m,t] * delta_T for m in M, t in T) +
    sum(lambda_CO2[t] * carbon_price * P_ch_tot[m,t] * delta_T for m in M, t in T) +
    sum(rho_miss * P_miss_work[i,e,t] * delta_T for i in N, e in E, t in T)
)
```

### **Option 3: Separate Carbon and Electricity Objectives**
```julia
# Multi-objective optimization
@objective(model, Min,
    sum(lambda_whl_elec[t] * P_ch_tot[m,t] * delta_T for m in M, t in T) +
    sum(rho_miss * P_miss_work[i,e,t] * delta_T for i in N, e in E, t in T)
)

# Add carbon constraint
@constraint(model, 
    sum(lambda_CO2[t] * P_ch_tot[m,t] * delta_T for m in M, t in T) <= max_carbon_budget
)
```

## 🎯 Final Answer

**No, carbon emissions and electricity costs do NOT have the same weight in the objective function.**

**Current Weighting:**
- **Electricity Cost**: 67.6% of total cost
- **Carbon Emissions**: 32.4% of total cost (overweighted by ~10x)

**The carbon emissions are significantly overweighted due to unrealistically high carbon intensity values, creating a bias toward environmental optimization over economic efficiency.**


