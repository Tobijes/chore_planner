## IMPORTS
using JuMP
import HiGHS


## INPUT
# -- Input data
struct Task
    label::String
    frequency::Int
    workload::Int
end

tasks = [
    Task("Skrald", 1, 10),
    Task("Støvsugning", 1, 20),
    Task("Badeværelse", 2, 15),
    Task("Komfurrens", 2, 10),
    Task("Tørre støv af", 4, 20),
    Task("Køkkenvask", 4, 10),
    Task("Skifte sengetøj", 4, 5),
    Task("Rense mikroovn", 4, 5),
    Task("Pudse vinduer", 12, 20),
    Task("Afkalke", 12, 15),
    Task("Ovnrens", 12, 30),
    Task("Rense afløb", 12, 15)
]

users = ["Kristine", "Tobias"]

n_periods = 26

# -- Sets
P = 1:n_periods # Periods (weeks)
U = 1:length(users) # Users (persons)
T = 1:length(tasks) # Tasks

# -- Constants
F_t = map(x -> x.frequency, tasks)
W_t = map(x -> x.workload, tasks)

# -- Pre-computed shift matrixes
F = sort(unique(F_t))
R = Dict{Int, Array{Bool, 2}}(
    f => [(((p-(s-1)) % f == 0)) for s in 1:f, p in P]
    for f in F
)

## MODEL
model = Model(HiGHS.Optimizer)

# Decision variables
@variable(model, x[U,P,T], Bin) # Decision variable for which user U takes the task T in period P
@variable(model, s[T, 1:maximum(F)], Bin) # For each task T, how many periods is the cycle shifted
@variable(model, dWabs_parts[P, i=1:2] >= 0, Int) # Delta of workload between each user U for each period P

# -- Constraints
# Constraint saying given a shift s_t should the task be taken t in this period p ?
for p in P
    for t in T
        f = F_t[t]
        @constraint(model, sum(x[u,p,t] for u in U) == sum( R[f][i,p] * s[t,i] for i in 1:f))
    end
end

# Exactly one shift decision must chosen for each task
@constraint(model, [sum(s[t,i] for i in 1:F_t[t]) for t in T] .== 1)

# Find absolute difference for each period
@expression(model, w[u = U, p = P], sum(W_t[t] * x[u,p,t] for t in T))
@expression(model, dW[p = P], sum(w[1,p] - w[2,p]))
@constraint(model, dWabs_parts[:, 1] - dWabs_parts[:, 2] .== dW)
absDiff = @expression(model, dWabs_parts[:, 1] + dWabs_parts[:, 2])

# Average workload (not used)
avgLoad = @expression(model, sum(w) / length(P))

# -- Objective function
@objective(model, Min, sum(absDiff))
# @objective(model, Min, sum(absDiff) + avgLoad)

## SPECIFIC REQUIREMENTS
# Weekly tasks must switch around
weeklyTasksIdxs = findall(t -> t.frequency == 1, tasks)
for wti in weeklyTasksIdxs, p in P, u in U
    fix(x[u,p,wti], (p + u + wti) % length(U))
end

## SOLVE
optimize!(model)


## PRESENT

function show_matrices(x)
    x_sol = permutedims(x, (2, 3, 1))

    threshold = 0.5
    to_binary(value, threshold) = value >= threshold ? 1 : 0

    # Get the size of the array
    dims = size(x_sol)

    # Create an array to store the binary values
    x_bin = Array{Int}(undef, dims)

    # Convert each element to a binary value
    for i in CartesianIndices(x_sol)
        x_bin[i] = to_binary(x_sol[i], threshold)
    end
    println("Dimensions: [Periods, Tasks, Users]")
    display(x_bin)
    return x_bin
end

function show_pretty_printout(x, filepath::Union{AbstractString, Nothing}=nothing)
    file = nothing
    if (filepath !== nothing)
        file = open(filepath, "w")
    end

    prw(s) = begin
        println(s)
        if file !== nothing
            write(file, s * "\n")
        end
    end

    prw("LØSNING:")
    for p in P
        prw("Uge $p")
        for u in U
            active_task_indexes = findall(x -> x == 1, x[u,p,:])
            active_task_labels = map(i -> tasks[i].label  * " (" * string(tasks[i].workload) * ")", active_task_indexes)
            joined_labels = join(active_task_labels, ", ")
            prw("($u): $joined_labels")
        end
        prw("")
    end

    if (file !== nothing)
        close(file)
    end
end


x_sol = Array(value.(x))
show_matrices(x_sol)
show_pretty_printout(x_sol, "solution.txt")
