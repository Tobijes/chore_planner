FROM julia:1.12
WORKDIR /app

COPY Project.toml Manifest.toml ./
RUN julia --project=. -e "using Pkg; Pkg.instantiate(); Pkg.precompile()"

COPY src/ src/

ENV ENDPOINT=tcp://*:80
EXPOSE 80

CMD ["julia", "--project=.", "src/server.jl"]
