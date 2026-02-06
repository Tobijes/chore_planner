# Prematter
We have a simple Julia script for solving a Chore Planning Problem. The algorithm is validated to work and we need to build a whole application around it. The architecure of the app should be like this:

# Architecure
Frontend (React) <--- JSON/SSE/HTTP ---> Backend (C#/.NET) <--- Protobuf/ZeroMQ ---> Worker (Julia)

We want the React frontend to communicate with the C# app using REST. However since we a dealing a potentially heavy computation we want to build a system where we submit a job, and then wait for the response. The C# backend should have an internal queue, and then submit job one at a time using ZeroMQ to the worker. In the frontend we want status updates when 
- The job is originally added to the queue: "Queued"
- The job has gone through the queue and is sent to the worker: "Processing"
- When the worker is done and the result is ready: "Done"

The async events should stream over HTTP SSE. The SSE stream should only contain the status updates, not the actual result. The result will be fetched when the result is Done. The API should be like this

POST job (data) --> jobId
GET events (jobId) --> SSE update stream
GET result (jobId) --> Result data (only works when the job was processed)
DELETE job (jobId) --> void

## Worker
The Worker is the current Julia script, but we need to add Protobuf and ZeroMQ. There should be a Job Protobuf Message with a list of Tasks used to construct the MIP program. There should also be a result Protobuf Message with a list of period, then for each period, each user and then for each user, a list of the users tasks. 


## Backedn
The Backend should be a C# application that accepts jobs and controls the queueing. It should map jobs to Protobuf which it sends using ZeroMQ to the worker. It should handle its internal queue. 


## Frontend
The frontend should be a React application where the user can add Tasks like the ones specified in the @main.jl script. There should be a default.json file where the default tasks are loaded from. The user frontend tasks should be saved in localStorage for convenience the next time. It should work like this: If there is nothing in localStorage, populate the state with default.json tasks and save it. There should also be Reset button somewhere.

