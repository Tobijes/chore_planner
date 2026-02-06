using ProtoBuf
using ZMQ

# ── Generate Julia types from .proto ─────────────────────────────────────────

const PROTO_INPUT_DIR  = joinpath(@__DIR__, "..", "..", "protobuf")
const PROTO_OUTPUT_DIR = joinpath(@__DIR__, "proto")

# Generate Julia code from the .proto file (idempotent – overwrites each time)
ProtoBuf.protojl("choreplanner.proto", PROTO_INPUT_DIR, PROTO_OUTPUT_DIR)

# Include the generated module
include(joinpath(PROTO_OUTPUT_DIR, "choreplanner", "choreplanner.jl"))

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

# ── ZeroMQ REP server ───────────────────────────────────────────────────────

function run_server(; endpoint::String = "tcp://*:5555")
    ctx = ZMQ.Context()
    sock = ZMQ.Socket(ctx, ZMQ.REP)
    ZMQ.bind(sock, endpoint)

    println("Worker listening on $endpoint")

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
    end
end

# ── Main entry point ─────────────────────────────────────────────────────────

run_server()
