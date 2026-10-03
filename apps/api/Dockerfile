FROM oven/bun:1.2
WORKDIR /app
COPY apps/api/package.json apps/api/tsconfig.json ./
COPY apps/api/src ./src
ENV PORT=8787
EXPOSE 8787
CMD ["bun", "src/server.ts"]
