using JuMP
using HiGHS
using Plots
gr()  # Ensure GR backend is used for stepwise plotting
using DataFrames
using CSV
using Printf
using Dates

# Include necessary modules
include("src/core/DataLoader.jl")
include("src/core/FullDataLoader_v2.jl")
include("src/core/MCSOptimizer.jl")
include("sample_simple_dataset/results/ResultsLogger.jl")

using .DataLoader
using .FullDataLoader_v2
using .MCSOptimizer

"""
Run the optimization with CSV data and save results
"""
function run_optimization_with_logging(dataset_name::String)
    # Construct paths - handle both relative and absolute paths
    if isdir(joinpath(dataset_name, "csv_files"))
        # Relative path (original behavior)
        data_dir = joinpath(dataset_name, "csv_files")
        results_dir = joinpath(dataset_name, "results")
    else
        # Absolute path (new behavior for backend)
        data_dir = joinpath(dataset_name, "csv_files")
        # Create results directory in the same location as the dataset
        results_dir = joinpath(dirname(dataset_name), "results")
    end
    
    # Debug: Print the paths to understand what's happening
    println("Dataset name: ", dataset_name)
    println("Data directory: ", data_dir)
    println("Results directory: ", results_dir)
    println("Data directory exists: ", isdir(data_dir))
    println("CSV files in data directory: ", readdir(data_dir))
    
    # Ensure results directory exists
    mkpath(results_dir)
    
    println("Loading data from CSV files in directory: ", data_dir)
    
    # Determine which data loader to use based on the dataset
    if dataset_name == "sample_simple_dataset"
        # Use original data loader for simple dataset
        M, T, N, N_g, N_c, E, A, C_MCS_plug, CH_MCS, CH_CEV, DCH_MCS, DCH_MCS_plug,
        D, k_trv, R_work, SOE_CEV_ini, SOE_CEV_max, SOE_CEV_min, SOE_MCS_ini, SOE_MCS_max,
        SOE_MCS_min, tau_trv, lambda_whl_elec, lambda_CO2, rho_miss, eta_ch_dch, delta_T = DataLoader.load_all_data(data_dir)
    else
        # Use full dataset loader for other datasets
        M, T, N, N_g, N_c, E, A, C_MCS_plug, CH_MCS, CH_CEV, DCH_MCS, DCH_MCS_plug,
        D, k_trv, R_work, SOE_CEV_ini, SOE_CEV_max, SOE_CEV_min, SOE_MCS_ini, SOE_MCS_max,
        SOE_MCS_min, tau_trv, lambda_whl_elec, lambda_CO2, rho_miss, eta_ch_dch, delta_T = FullDataLoader_v2.load_full_dataset(data_dir)
        
        # Convert dictionary format to vector format for compatibility
        SOE_CEV_ini = [SOE_CEV_ini[e] for e in E]
        SOE_CEV_max = [SOE_CEV_max[e] for e in E]
        SOE_CEV_min = [SOE_CEV_min[e] for e in E]
        SOE_MCS_ini = [SOE_MCS_ini[m] for m in M]
        SOE_MCS_max = [SOE_MCS_max[m] for m in M]
        SOE_MCS_min = [SOE_MCS_min[m] for m in M]
        lambda_whl_elec = [lambda_whl_elec[t] for t in T]
        lambda_CO2 = [lambda_CO2[t] for t in T]
    end

    # Load time labels and mapping from time_data.csv
    time_df = CSV.read(joinpath(data_dir, "time_data.csv"), DataFrame)
    # Map t1...t96 to actual time labels
    t_cols = string.(time_df[!, "Unnamed: 1"])  # t1, t2, ...
    actual_time_labels = string.(time_df[!, hasproperty(time_df, :time) ? "time" : "Unnamed: 0"])  # 07:00:00, ...
    t_to_time = Dict(t_cols[i] => actual_time_labels[i] for i in 1:length(t_cols))
    # Use this mapping for all time series plots
    time_labels = [t_to_time[t] for t in t_cols]
    
    println("Data loaded successfully. Running optimization model...")
    
    # Record start time
    start_time = time()
    
    # Solve the model and analyze results
    model, obj_value, total_energy_from_grid, total_missed_work, total_carbon_emissions, 
    total_electricity_cost, p_combined, p5, p6, SOE_MCS_min_wide, SOE_MCS_max_wide, SOE_CEV_min_wide, SOE_CEV_max_wide, now_str, p_price_emission, mcs_power_plots, p_total_grid,
    mcs_csv_data, total_grid_csv, mcs_soe_csv, cev_soe_csv, work_csv, price_emission_csv, mcs_trajectory_csv = MCSOptimizer.solve_and_analyze(
        M, T, N, N_g, N_c, E, A, C_MCS_plug, CH_MCS, CH_CEV, DCH_MCS, DCH_MCS_plug,
        D, k_trv, R_work, SOE_CEV_ini, SOE_CEV_max, SOE_CEV_min, SOE_MCS_ini, SOE_MCS_max,
        SOE_MCS_min, tau_trv, lambda_whl_elec, lambda_CO2, rho_miss, eta_ch_dch, delta_T, time_labels
    )
    
    # Calculate solve time
    solve_time = time() - start_time
    
    # Calculate work completion percentage
    total_required_work = sum(R_work[i,e,t] * A[i,e] * delta_T for i in N_c, e in E, t in T)
    total_completed_work = sum(value.(model[:P_work][i,e,t]) * delta_T for i in N_c, e in E, t in T)
    work_completion_percentage = (total_completed_work / total_required_work) * 100
    
    # Extract detailed results for reporting
    mcs_locations = Dict()
    mcs_routes = Dict()
    cev_charging = Dict()
    
    # Extract MCS locations
    for m in M
        mcs_locations[m] = Dict()
        for t in T
            for i in N
                if value(model[:z][m, i, t]) > 0.5
                    node_type = i in N_g ? "Grid Node" : "Construction Site"
                    mcs_locations[m][t] = "$node_type $i"
                end
            end
        end
    end
    
    # Extract MCS routes
    for m in M
        mcs_routes[m] = Dict()
        for t in T
            for i in N, j in N
                if i != j && value(model[:x][m, i, j, t]) > 0.5
                    from_type = i in N_g ? "Grid Node" : "Construction Site"
                    to_type = j in N_g ? "Grid Node" : "Construction Site"
                    mcs_routes[m][t] = Dict(
                        "from" => "$from_type $i",
                        "to" => "$to_type $j"
                    )
                end
            end
        end
    end
    
    # Extract CEV charging information
    for e in E
        cev_charging[e] = []
        for t in T
            for m in M, i in N_c
                if value(model[:rho][m, i, e, t]) > 0.5
                    push!(cev_charging[e], Dict(
                        "time" => t,
                        "mcs" => m,
                        "location" => "Construction Site $i"
                    ))
                end
            end
        end
    end
    
    # Get individual plots for the main results grid, passing time_labels and wide bounds
    p_power, mcs_csv_data = MCSOptimizer.plot_power_profiles(model, M, N, T, delta_T, time_labels)
    p_mcs_soe, mcs_soe_csv = MCSOptimizer.plot_soe_profiles(model, M, T, delta_T, time_labels, SOE_MCS_max_wide, SOE_MCS_min_wide, now_str)
    p_cev_soe, cev_soe_csv = MCSOptimizer.plot_cev_soe_profiles(model, E, T, delta_T, time_labels, SOE_CEV_max, SOE_CEV_min, SOE_CEV_min_wide, SOE_CEV_max_wide, now_str)
    p_work, work_csv = MCSOptimizer.plot_work_profiles(model, N, N_c, E, T, delta_T, time_labels)
    p_mcs_time, mcs_trajectory_csv = MCSOptimizer.plot_mcs_time_trajectory(model, M, N, N_g, N_c, T, time_labels)
    p_node_map = MCSOptimizer.plot_node_map_with_cev(N, N_g, N_c, E, A, model, M, T, D)
    # Prepare summary text
    summary_text = """
    Optimization Summary
    -------------------
    Number of MCSs: $(length(M))
    Number of CEVs: $(length(E))
    Number of nodes: $(length(N)) (Grid: $(length(N_g)), Construction: $(length(N_c)))
    MCS Max Energy: $SOE_MCS_max_wide kWh
    MCS Min Energy: $SOE_MCS_min_wide kWh
    MCS Charging Rate: $CH_MCS kW
    MCS Discharging Rate: $DCH_MCS kW
    Plugs per MCS: $C_MCS_plug
    Time interval: $delta_T h
    Number of periods: $(length(T))
    """
    # Create the summary as a dummy plot
    p_summary = plot(legend=false, grid=false, framestyle=:none, xticks=false, yticks=false)
    annotate!(p_summary, 0, 0.5, text(summary_text, :black, 12, :left))
    # Create an empty plot for the last cell
    p_empty = plot(legend=false, grid=false, framestyle=:none, xticks=false, yticks=false)
    # Combine all plots (including total grid power profile, excluding individual MCS power plots which are saved separately)
    p_all = plot(
        p_total_grid, p_work,
        p_mcs_soe, p_cev_soe,
        p_price_emission, p_mcs_time,
        p_node_map, p_summary,
        layout = (4,2),
        size = (1800, 2200)
    )
    
    # Before saving any results, generate a timestamp string and create a run-specific directory
    run_index = Dates.format(now(), "yyyymmdd_HHMMSS")
    run_dir = joinpath(results_dir, run_index)
    mkpath(run_dir)

    # Save the main combined optimization results plot
    savefig(p_all, joinpath(run_dir, "mcs_optimization_results.png"))
    
    # Save individual plots for each of the 8 subplots
    savefig(p_total_grid, joinpath(run_dir, "01_total_grid_power_profile.png"))
    savefig(p_work, joinpath(run_dir, "02_work_profiles_by_site.png"))
    savefig(p_mcs_soe, joinpath(run_dir, "03_mcs_state_of_energy.png"))
    savefig(p_cev_soe, joinpath(run_dir, "04_cev_state_of_energy.png"))
    savefig(p_price_emission, joinpath(run_dir, "05_electricity_prices.png"))
    savefig(p_mcs_time, joinpath(run_dir, "06_mcs_location_trajectory.png"))
    savefig(p_node_map, joinpath(run_dir, "07_node_map_with_cev_assignments.png"))
    savefig(p_summary, joinpath(run_dir, "08_optimization_summary.png"))
    
    # Save CSV data for each plot
    CSV.write(joinpath(run_dir, "01_total_grid_power_profile.csv"), total_grid_csv)
    CSV.write(joinpath(run_dir, "02_work_profiles_by_site.csv"), work_csv)
    CSV.write(joinpath(run_dir, "03_mcs_state_of_energy.csv"), mcs_soe_csv)
    CSV.write(joinpath(run_dir, "04_cev_state_of_energy.csv"), cev_soe_csv)
    CSV.write(joinpath(run_dir, "05_electricity_prices.csv"), price_emission_csv)
    CSV.write(joinpath(run_dir, "06_mcs_location_trajectory.csv"), mcs_trajectory_csv)
    
    # Save individual MCS power profile plots and CSV data
    for (m_idx, mcs_plot) in enumerate(mcs_power_plots)
        savefig(mcs_plot, joinpath(run_dir, "mcs_$(m_idx)_power_profile.png"))
        # Save CSV data for this MCS
        CSV.write(joinpath(run_dir, "mcs_$(m_idx)_power_profile.csv"), mcs_csv_data[m_idx])
    end

    # Log and report files in the run directory
    log_file = joinpath(run_dir, "optimization_log.txt")
    report_file = joinpath(run_dir, "optimization_report.txt")
    ResultsLogger.log_results(
        obj_value,
        total_energy_from_grid,
        total_missed_work,
        total_carbon_emissions,
        total_electricity_cost,
        work_completion_percentage,
        solve_time,
        run_dir
    )
    ResultsLogger.generate_report(
        obj_value,
        total_energy_from_grid,
        total_missed_work,
        total_carbon_emissions,
        total_electricity_cost,
        work_completion_percentage,
        solve_time,
        mcs_locations,
        mcs_routes,
        cev_charging,
        run_dir
    )

    println("\nOptimization completed. Results have been saved to:")
    println("- $run_dir/mcs_optimization_results.png (combined view)")
    println("- $run_dir/01_total_grid_power_profile.png + .csv")
    println("- $run_dir/02_work_profiles_by_site.png + .csv")
    println("- $run_dir/03_mcs_state_of_energy.png + .csv")
    println("- $run_dir/04_cev_state_of_energy.png + .csv")
    println("- $run_dir/05_electricity_prices.png + .csv")
    println("- $run_dir/06_mcs_location_trajectory.png + .csv")
    println("- $run_dir/07_node_map_with_cev_assignments.png")
    println("- $run_dir/08_optimization_summary.png")
    for (m_idx, _) in enumerate(mcs_power_plots)
        println("- $run_dir/mcs_$(m_idx)_power_profile.png + .csv")
    end
    println("- $run_dir/optimization_log.txt")
    println("- $run_dir/optimization_report.txt")
    
    return model, obj_value, total_energy_from_grid, total_missed_work, 
           total_carbon_emissions, total_electricity_cost, p_combined, p5, p6
end

"""
Run optimization for multiple datasets
"""
function run_multiple_datasets(dataset_names::Vector{String})
    results = Dict{String, Any}()
    
    for dataset in dataset_names
        println("\nProcessing dataset: $dataset")
        try
            model, obj_value, total_energy_from_grid, total_missed_work, 
            total_carbon_emissions, total_electricity_cost, p_combined, p5, p6 = run_optimization_with_logging(dataset)
            
            results[dataset] = Dict(
                "model" => model,
                "objective_value" => obj_value,
                "total_energy_from_grid" => total_energy_from_grid,
                "total_missed_work" => total_missed_work,
                "total_carbon_emissions" => total_carbon_emissions,
                "total_electricity_cost" => total_electricity_cost
            )
        catch e
            println("Error processing dataset $dataset: ", e)
        end
    end
    
    return results
end

# If this script is run directly
if abspath(PROGRAM_FILE) == @__FILE__
    # Check if dataset name is provided as command line argument
    if length(ARGS) > 0
        if ARGS[1] == "--all"
            # Run all datasets in the current directory
            datasets = filter(x -> isdir(x) && x != ".ipynb_checkpoints", readdir())
            run_multiple_datasets(datasets)
        else
            # Run specific dataset
            run_optimization_with_logging(ARGS[1])
        end
    else
        # Default to sample dataset
        println("No dataset specified. Running with sample_simple_dataset...")
        run_optimization_with_logging("sample_simple_dataset")
    end
end 