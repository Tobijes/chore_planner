#!/usr/bin/env julia
#
# Regenerate Julia protobuf bindings from taskplan.proto.
# Run this script after modifying protobuf/taskplan.proto:
#
#   julia worker/scripts/generate_proto.jl
#

using Pkg
Pkg.activate(joinpath(@__DIR__, ".."))

using ProtoBuf

const PROTO_INPUT_DIR  = joinpath(@__DIR__, "..", "..", "protobuf")
const PROTO_OUTPUT_DIR = joinpath(@__DIR__, "..", "src", "proto")

ProtoBuf.protojl("taskplan.proto", PROTO_INPUT_DIR, PROTO_OUTPUT_DIR)

println("Generated Julia protobuf code in: ", realpath(PROTO_OUTPUT_DIR))
