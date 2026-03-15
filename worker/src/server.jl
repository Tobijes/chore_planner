using ProtoBuf
using ZMQ

# ── Pre-generated protobuf types (regenerate via: julia worker/scripts/generate_proto.jl)

include(joinpath(@__DIR__, "proto", "choreplanner", "choreplanner.jl"))

using .choreplanner

# ── Include the solver ───────────────────────────────────────────────────────

include(joinpath(@__DIR__, "solver.jl"))

# ── Conversion helpers ───────────────────────────────────────────────────────

"""Convert a protobuf `JobRequest` into solver-native types."""
function request_to_solver_inputs(req::choreplanner.JobRequest)
    tasks = TaskInput[
        TaskInput(
            td.label,
            Int(td.frequency),
            Int(td.workload),
            td.force_alternation,
        )
        for td in req.tasks
    ]
    users     = String[u for u in req.users]
    n_periods = Int(req.n_periods)
    return tasks, users, n_periods
end

"""Convert solver output into a protobuf `JobResult`."""
function solver_result_to_response(results::Vector{PeriodResult})
    periods = choreplanner.PeriodSchedule[]
    for pr in results
        user_assignments = choreplanner.UserAssignment[]
        for upr in pr.users
            task_assignments = choreplanner.TaskAssignment[
                choreplanner.TaskAssignment(to.label, Int32(to.workload))
                for to in upr.tasks
            ]
            push!(user_assignments, choreplanner.UserAssignment(upr.user_name, task_assignments))
        end
        push!(periods, choreplanner.PeriodSchedule(Int32(pr.period_number), user_assignments))
    end
    return choreplanner.JobResult(periods)
end

# ── Health file ──────────────────────────────────────────────────────────────

const HEALTH_FILE = "/tmp/worker-alive"

function touch_health()
    write(HEALTH_FILE, string(time()))
end

# ── ZeroMQ REP server ───────────────────────────────────────────────────────

PORT = get(ENV, "PORT", "5555")

function run_server(; endpoint::String = "tcp://*:" * PORT)
    ctx = ZMQ.Context()
    sock = ZMQ.Socket(ctx, ZMQ.REP)
    ZMQ.bind(sock, endpoint)
    touch_health()

    println("Worker listening on $endpoint")

    try
        while true
            # Receive raw bytes
            raw = ZMQ.recv(sock)
            bytes = Vector{UInt8}(raw)

            println("Received job request ($(length(bytes)) bytes)")

            # Decode protobuf request
            iob = IOBuffer(bytes)
            decoder = ProtoBuf.ProtoDecoder(iob)
            req = ProtoBuf.decode(decoder, choreplanner.JobRequest)

            println("  Tasks: $(length(req.tasks)), Users: $(length(req.users)), Periods: $(req.n_periods)")

            # Convert, solve, convert back
            tasks, users, n_periods = request_to_solver_inputs(req)
            results = solve_chore_schedule(tasks, users, n_periods)
            response = solver_result_to_response(results)

            # Encode protobuf response
            out = IOBuffer()
            encoder = ProtoBuf.ProtoEncoder(out)
            ProtoBuf.encode(encoder, response)
            resp_bytes = take!(out)

            println("  Sending result ($(length(resp_bytes)) bytes)")

            # Send reply
            ZMQ.send(sock, ZMQ.Message(resp_bytes))
            touch_health()
        end
    catch e
        if e isa InterruptException
            println("\nShutting down worker...")
        else
            rethrow(e)
        end
    finally
        close(sock)
        close(ctx)
    end
end

# ── Main entry point ─────────────────────────────────────────────────────────
println("Starting worker...")
# Convert SIGINT into an InterruptException instead of crashing at the C level
Base.exit_on_sigint(false)
run_server()
