# Dockerfile

# Stage 1: Build the application
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum files to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
# -o /app/server builds the binary into the /app directory
# -ldflags="-w -s" strips debug symbols to make the binary smaller
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server -ldflags="-w -s" .

# Stage 2: Create the final, small image
FROM alpine:latest

WORKDIR /app

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/server .

# Copy the .env file (for local compose only, not a production best practice)
COPY .env .

# Expose the port the app runs on
EXPOSE 8080

# The command to run when the container starts
CMD ["./server"]