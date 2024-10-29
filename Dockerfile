FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:22-alpine AS deploy
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/openapi.json /app/openapi.json
COPY proto proto
EXPOSE 3000
CMD [ "node", "dist/main" ]
