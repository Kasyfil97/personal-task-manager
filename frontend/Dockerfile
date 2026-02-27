# Build stage
FROM node:20-slim AS builder

ARG REPO_URL=https://github.com/Kasyfil97/personal-task-manager.git
ARG BRANCH=main

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch ${BRANCH} ${REPO_URL} /repo

WORKDIR /repo/frontend

RUN npm ci && npm run build

# Serve stage
FROM nginx:alpine

COPY --from=builder /repo/frontend/dist /usr/share/nginx/html
COPY --from=builder /repo/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
