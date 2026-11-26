FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install --global pnpm@10.12.4 && pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "dev"]
