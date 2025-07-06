FROM mcr.microsoft.com/devcontainers/dotnet:1-9.0-bookworm

# Install Node.js 20.x for Angular
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get -y install --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    postgresql-client \
    iputils-ping \
    nano \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g @angular/cli@19 npm-check-updates

# Install Entity Framework Core tools
RUN dotnet tool install --global dotnet-ef

# Add dotnet tools to PATH
ENV PATH="${PATH}:/home/vscode/.dotnet/tools"

# Install MinIO Client
RUN curl -o /usr/local/bin/mc https://dl.min.io/client/mc/release/linux-amd64/mc \
    && chmod +x /usr/local/bin/mc

# Create workspace directory
RUN mkdir -p /workspace

# Set up git safe directory (for workspace mounted as volume)
RUN git config --global --add safe.directory /workspace

# Ensure vscode user owns the workspace
RUN chown -R vscode:vscode /workspace