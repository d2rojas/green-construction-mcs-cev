$eolcom //

* Define file paths
$set MODELDIR "/Users/lzanda/Documents/MCS/MCS_CEV"
$set EXCELFILE "%MODELDIR%/Input_CEV.xlsx"
$set GDXFILE "%MODELDIR%/Input_CEV.gdx"

* Use explicit path to GDXXRW
$set GDXXRW "/Library/Frameworks/GAMS.framework/Versions/49/Resources/sysdir/gdxxrw"
$log path...
* Check if the Excel file exists
$if not exist "%EXCELFILE%" $abort Input file %EXCELFILE% not found!

* Convert Excel to GDX with error checking
$log Converting Excel file to GDX...
$call ="%GDXXRW%" "%EXCELFILE%" Index=ParamsAndSets!A1 output="%GDXFILE%" trace=3
$if errorlevel 1 $abort Problems reading Excel file

* Load the GDX file
$GDXIN "%GDXFILE%"
$if not exist "%GDXFILE%" $abort GDX file was not created successfully

* Rest of your model remains the same
$set depot1 i1
$set depot2 i2

Scalar eta_ch        /0.95/;                        // charge and discharge efficiencies
Scalar eta_dch        /0.95/;
Scalar B             /100/;                        // A large constant for binary operations
Scalar MCS_max       /250/;                        // Max, initial and minimum state of energy values for MCSs
Scalar MCS_ini       /125/;
Scalar MCS_min       /50/;   // 20% of 250kwh
Scalar R_MCS_ch      /125/;                       // Charging and discharging power rates for MCSs
Scalar R_MCS_dch     /125/;
Scalar R_MCS_plug    /41.6667/; // 125/3 =..     // Discharging power rate for one charger on the MCS
Scalar C_MCS         /3/;                        // Number of charger mounted on the MCS
Scalar DT            /0.25/;                     // Delta T, time interval
Scalar u_road       /0.304/;                     // Energy consumption on the road kWh/km
Scalar t_end           /96/;                     // End of the optimization for 15min time interval


Sets
m mobilestations
i parking areas
e construction electric vehicles
t time periods
timedat
evdat
;                                                // Sets for MCSs, parking nodes, CEVs, and time respectively

$LOAD i e t timedat evdat


alias (i,j);                                    // j represents the parking nodes sames as i
alias (t,tt);                                   // tt represents time interval same as t

set i0(i) /%depot1%/;                          // i0 represents the first depot location
set i1(i) /%depot2%/;                          // i1 represents the second depot location

set i2(i);
i2(i)$(not i0(i) and not i1(i)) = yes;        // i2 represents the construction nodes

set i3(i);
i3(i)$(not i2(i)) = yes;                     // i3 represents the depots

set m /m1*m4/;                               // 4 MCSs are located in two depots equally

set m0(m) /m1*m2/;

set m1(m) /m3*m4/;


Parameters                                  // Parameters collected from excel file
EVDATA(e,evdat)
TIMEDATA(t,timedat)
T_arcs(i,j)
D(i,j)
place(i,e)
R_work(i,e,t)


;
$LOAD TIMEDATA EVDATA T_arcs D place R_work

set arcs(i,j);                               // Two nodes representation into one set like (i1,i2), (i3,i6)...
arcs(i,j)$D(i,j) = yes;


Parameters                                                                            // Parameters collected from excel file
lambda_CO2(t), lambda_buy_UCSD(t), SOE_min(e), SOE_max(e), SOE_ini(e), ch_rate(e) ;

lambda_CO2(t)=TIMEDATA(t,'lambda_CO2');
lambda_buy_UCSD(t)=TIMEDATA(t,'lambda_buy');
SOE_min(e)=EVDATA(e,'SOE_min');
SOE_ini(e)=EVDATA(e,'SOE_ini');
SOE_max(e)=EVDATA(e,'SOE_max');
ch_rate(e)=EVDATA(e,'ch_rate');

variables                                              // Variable for cost of carbon and energy
COP
;
                                                      // alpha = binary variable to check connection status of MCS, beta_arr = binary variable to record arrival time of MCS,
                                                      // delta_dep = binary variable to record departure time of MCS, x = binary variable that selects a way for MCS to travel between nodes
                                                      // e_conmcs = binary variable which controls the connection of CEV to the MCS,
                                                      // u = binary variable to prevent charging and discharging of CEV in the same time interval
binary variables
    alpha(m,i,t)
    beta_arr(m,i,t)
    delta_dep(m,i,t)
    x(m,i,j,t)
    e_conmcs(m,i,e,t)
    u(i,e,t)
;
                                                      // E_road = Energy spent on the road by MCS, E_road_tot = Total energy consumption of MCS in time interval t
                                                      // P_ch_MCS = Charging power of MCS, P_dch_MCS = Discharging power of MCS, P_MCSdch = Discharging power of MCS to charge CEV e
                                                      // P_ch_tot = Total charging power of the MCS in time interval t, P_dch_tot= Total discharging power of the MCS in time interval t
                                                      // P_work = Power consumed to accomplish the work at construction node i, SOE_MCS = State of energy of MCS in time interval t,
                                                      // SOE_EV = State of energy of CEV in time interval t
Positive Variables
    E_road(m,i,j,t)
    E_road_tot(m,t)
    P_ch_MCS(m,i,t)
    P_dch_MCS(m,i,t)
    P_MCSdch(m,i,e,t)
    P_ch_tot(m,t)
    P_dch_tot(m,t)
    P_work(i,e,t)
    SOE_mcs(m,t)
    SOE_EV(e,t)

;

Equations
objfun, eq2, eq3, eq4, eq5, eq6, eq7, eq8, eq9, eq10, eq11, eq12, eq13, eq14, eq15, eq16, eq17, eq18, eq19, eq20, eq21, eq22, eq23
eq24, eq25, eq26, eq27, eq28, eq29, eq30, eq31, eq32;

************Primal equations***********************
SOE_MCS.fx(m,t)$(ord(t)=1) = MCS_ini;                      // Defining initial SOE for MCS
SOE_EV.fx(e,t)$(ord(t)=1) = SOE_ini(e);                    // Defining initial SOE for EV
P_dch_MCS.fx(m,i,t)$(ord(t)=1) = 0;                        // Preventing discharging of MCS in time interval t=1 (initial time interval)
P_ch_MCS.fx(m,i2(i),t) = 0;                                // Preventing charging of MCS in time interval t=1 (initial time interval)
P_dch_MCS.fx(m,i3(i),t) = 0;                               // Preventing discharging of MCS at depot nodes (depot1 , depot2)
alpha.fx(m0(m),i1(i),t) = 0;                               // MCSs m1 and m2 cannot connect to depot1
alpha.fx(m1(m),i0(i),t) = 0;                               // MCSs m3 and m4 cabbor connect to depot2
alpha.fx(m0(m),i0(i),t)$(ord(t) = 1) = 1;                  // MCSs m1 and m2 must be placed at depot1 in the initial time interval
alpha.fx(m1(m),i1(i),t)$(ord(t) = 1) = 1;                  // MCSs m3 and m4 must be placed at depot2 in the initial time interval
delta_dep.fx(m,i,t)$(ord(t) < 2) = 0;                      // MCSs cannot depart from any node in the initial time interval
beta_arr.fx(m,i2(i),t)$(ord(t) <= 2) = 0;                  // MCSs cannot arrive to construction nodes in the first two time interval
delta_dep.fx(m,i2(i),t)$(ord(t) <= 2) = 0;                 // MCSs cannot depart from construction nodes in the first two time interval
x.fx(m,i,j,t)$(ord(t) < 2) = 0;                            // MCSs cannot start to move from one node to another in the initial time interval
e_conmcs.fx(m,i,e,t)$(ord(t)=1) = 0;                       // CEVs cannot connect any MCS in the initial time interval



* Objective function
objfun.. COP =E= sum((m,t), lambda_CO2(t) * P_ch_tot(m,t) + lambda_buy_UCSD(t) * P_ch_tot(m,t)*DT);     // Objective function: minimizing both carbon cost and electricity cost

* Constraints
eq2(m,t).. P_ch_tot(m,t) =E= sum(i, P_ch_MCS(m,i,t));       // Calculation of total charging power for MCS m in time interval t

eq3(m,t)..P_dch_tot(m,t) =E= sum(i, P_dch_MCS(m,i,t));      // Calculation of total discharging power for MCS m in time interval t

eq4(m,i,t).. P_ch_MCS(m,i,t) =l= R_MCS_ch * alpha(m,i,t);   // Charging power of MCS m must be less than or equal to the charging power rate of MCSs, alpha requires that MCS must be connected
                                                            // to node i for charging

eq5(m,i,t).. P_dch_MCS(m,i,t) =e= sum(e, P_MCSdch(m,i,e,t));   // Discharging power of MCS m in node i to charge multiple CEVs

eq6(m,i2(i),t).. P_dch_MCS(m,i,t) =l= R_MCS_plug * C_MCS * alpha(m,i,t);  // Discharging power of MCS m in node i must be less than or equal to total discharging rate (125kW)

eq7(m,i2(i),e,t).. P_MCSdch(m,i,e,t) =l= R_MCS_plug * e_conmcs(m,i,e,t);  // Discharging power of MCS m for each CEV must be less than or equal to discharging rate of charger, e_conmcs requires that
                                                                          // MCS must be connected to an CEV in time interval t

eq8(m,i,j,t)..E_road(m,i,j,t) =E= u_road * D(i,j) * x(m,i,j,t);           // Energy consumed on the road is calculated based on the consumption rate (kWh/km) and distance between the nodes (i,j)
                                                                          // x takes a value of 1, when MCS travels from i to j

eq9(m,t).. E_road_tot(m,t) =e= sum(arcs(i,j), E_road(m,i,j,t));           // Calculating total energy consumption of MCS m in time interval t

eq10(m,t)$(ord(t)>1).. SOE_mcs(m,t) =E= SOE_mcs(m,t-1) + (P_ch_tot(m,t) * DT * eta_ch) - (P_dch_tot(m,t) * DT / eta_dch) - E_road_tot(m,t);  // Calculating SOE of MCS m based on the charging/discharging
                                                                                                                                             // powers and road consumption

eq11(m,t).. SOE_mcs(m,t) =l= MCS_max;      // Upper limit for MCS's SOE

eq12(m,t).. SOE_mcs(m,t) =g= MCS_min;      // Lower limit for MCS's SOE

eq13(m,t)$(ord(t)=t_end).. SOE_mcs(m,t) =e= MCS_ini; // MCS must be charged to initial SOE level until end of the simulation

eq14(e,t)$(ord(t)>1).. SOE_EV(e,t) =e= SOE_EV(e,t-1) + sum((m,i),P_MCSdch(m,i,e,t))*DT - sum(i, P_work(i,e,t))*DT; // Calculating SOE of CEV e based on the charging power (from MCSs)
                                                                                                                   //  and energy spent for work (discharging power)
eq15(e,t).. SOE_EV(e,t) =l= SOE_max(e);   // Upper limit for CEV's SOE

eq16(e,t).. SOE_EV(e,t) =g= SOE_min(e);  // Lower limit for CEV's SOE

eq17(e,t)$(ord(t)=t_end).. SOE_EV(e,t) =e= SOE_ini(e); // CEV e must be charged to initial SOE level until end of the simulation

eq18(i,e,t).. sum(m, P_MCSdch(m,i,e,t)) =l= ch_rate(e)*u(i,e,t);  // Charging power of CEVs must be less than or equal to charging rate of each CEV, u prevents the simultaneous charging and discharging

eq19(i,e,t).. P_work(i,e,t) =l= B*(1-u(i,e,t));     // u prevents the simultaneous charging and discharging

eq20(i,e,t).. P_work(i,e,t) =e= R_work(i,e,t);     // The work must be done as scheduled, thus power consumed by CEV e in time interval t equals to power required for accomplisihing the work

eq21(m,i,t).. sum(e, e_conmcs(m,i,e,t)) =l=  C_MCS;  // Limits the number of connected CEVs to the MCS m in the same time interval

eq22(m,i,e,t)..   e_conmcs(m,i,e,t) =l= place(i,e);  // Each CEV must be connected to MCS m in its designated construction node, "place" is a binary parameter

eq23(m,j)..  sum((i,t)$(ord(i)<>ord(j)), x(m,i,j,t)) =e= sum((i,t)$(ord(i)<>ord(j)), x(m,j,i,t));  // x determines whether MCS m goes from node i to node j, This equality ensures that number of
                                                                                                   // arrivals and departures for each node is equal

eq24(m,i,t)$(ord(t)>1).. beta_arr(m,i,t) - delta_dep(m,i,t) =e= alpha(m,i,t) - alpha(m,i,t-1);    // This equality establishes a balance between arrival/departure times and connection status of MCS m
                                                                                                  // beta_arr takes a value of 1, when MCS m arrives, therefore alpha must be 1 in the same time interval
                                                                                                  // delta_dep takes a value of 1, when MCS m departs, therefore alpha must be 0 in the same time interval
                                                                                                  // Alpha remains 1 during the period between arrival and departure

eq25(m,t).. sum(i, alpha(m,i,t)) =l= 1;         // MCS can connect only one node in time interval t

eq26(m,t).. sum(i, beta_arr(m,i,t)) =l= 1;      // MCS can arrive to only one node in time interval t

eq27(m,t).. sum(i, delta_dep(m,i,t)) =l= 1;    //  MCS can depart from only one node in time interval t

eq28(m,arcs(i,j),t,tt)$(ord(tt) = ord(t) + T_arcs(i,j)).. x(m,i,j,tt) =l= delta_dep(m,i,t);   // When MCS m departs from node i at time interval t to travel to node j, it can only arrive at node j after completing the travel time
                                                                                              // Therefore, x can take a value of 1 only when tt = t + T_arcs

eq29(m,j,t)..  beta_arr(m,j,t) =e= sum(i$(ord(i) <> ord(j)), x(m,i,j,t));     // MCS m can arrive node j if x equals to 1 in the same time interval

eq30(m,i,t)..  beta_arr(m,i,t) + delta_dep(m,i,t) =l= 1;                     // MCS m cannot arrive and depart in the same time interval

eq31(m,i2(i)).. sum(t,  beta_arr(m,i,t)) =l= 1;                              // MCS m cannot make multiple visits to construction nodes during simlation

eq32(m,i2(i)).. sum(t, delta_dep(m,i,t)) =l= 1;                              // MCS m cannot make multiple visits to construction nodes during simlation




* Model definition                                       // Options for optimization
Model electricConstruction /all/;
Option mip=CPLEX;
option decimals=4;
option threads = 0;
option reslim = 40000;
option iterlim = 1000000000;
option  Optcr= 0.00001;
electricConstruction.optfile = 1;

* Solve the model
Solve electricConstruction using mip minimizing COP;     // Solve statement

* Display results
Display COP.l, P_ch_tot.l, P_dch_tot.l, E_road.l, E_road_tot.l, P_ch_MCS.l, P_dch_MCS.l, P_MCSdch.l, P_work.l, SOE_mcs.l
SOE_EV.l, x.l, alpha.l, beta_arr.l, delta_dep.l, e_conmcs.l, u.l;



execute "xlstalk -S output_CEV.xlsx"          // Writing the results to the output Excel file

Execute_Unload "output_CEV.gdx"  COP.l, P_ch_tot.l, P_dch_tot.l, E_road.l, E_road_tot.l, P_ch_MCS.l, P_dch_MCS.l, P_MCSdch.l, P_work.l, SOE_mcs.l
SOE_EV.l, x.l, alpha.l, beta_arr.l, delta_dep.l, e_conmcs.l, u.l;

;

Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= COP.l  Rng=pCOP!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= P_ch_tot.l  Rng=P_ch_tot!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= P_dch_tot.l  Rng=P_dch_tot!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= E_road.l  Rng=E_road!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= E_road_tot.l  Rng=E_road_tot!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= P_ch_MCS.l  Rng=P_ch_MCS!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= P_dch_MCS.l  Rng=P_dch_MCS!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= P_MCSdch.l  Rng=P_MCSdch!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= P_work.l  Rng=P_work!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= SOE_mcs.l  Rng=SOE_mcs!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= SOE_EV.l  Rng=SOE_EV!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= x.l  Rng=x!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= alpha.l  Rng=alpha!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= beta_arr.l  Rng=beta_arr!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= delta_dep.l  Rng=delta_dep!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= e_conmcs.l  Rng=e_conmcs!B2'
Execute  'GDXXRW.EXE output_CEV.gdx O=output_CEV.xlsx SQ=N Var= u.l  Rng=u!B2'
