# Etapa unica, deps minimas (prod)
FROM node:20-alpine

# Variaveis
ENV NODE_ENV=production
ENV PORT=3000
ENV ZIP_DIR=/app/zips
ENV STORAGE_TYPE=local

# Diretorio de trabalho
WORKDIR /app

# Apenas package.json para cache de dependencias
COPY package.json ./
RUN npm ci --omit=dev

# Copia codigo da aplicacao
COPY server.mjs ./
COPY views/ ./views/
COPY middleware/ ./middleware/
COPY routes/ ./routes/

# Cria diretorio de zips (pode ser sobrescrito por volume)
RUN mkdir -p /app/zips

# Cria usuario nao-root
RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 3000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "server.mjs"]
