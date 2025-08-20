# Etapa única, deps mínimas (prod)
FROM node:20-alpine

# Variáveis
ENV NODE_ENV=production
ENV PORT=3001
ENV ZIP_DIR=/app/zips

# Diretório de trabalho
WORKDIR /app

# Apenas package.json para cache de dependências
COPY package.json ./
RUN npm install
RUN npm ci --omit=dev

# Copia código e diretório de zips
COPY server.mjs ./server.mjs
COPY zips/ ./zips/

# Cria usuário não-root
RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 3000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "server.mjs"]
