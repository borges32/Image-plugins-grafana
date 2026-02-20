# Etapa unica, deps minimas (prod) - Red Hat UBI
FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest

# Variaveis
ENV NODE_ENV=production
ENV PORT=3000
ENV ZIP_DIR=/app/zips
ENV STORAGE_TYPE=local

# Diretorio de trabalho
WORKDIR /app

# Copia manifestos para cache de dependencias
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia codigo da aplicacao
COPY server.mjs ./
COPY views/ ./views/
COPY middleware/ ./middleware/
COPY routes/ ./routes/

# Cria diretorio de zips (pode ser sobrescrito por volume)
RUN mkdir -p /app/zips

# Usa usuario nao-root (UBI minimal ja roda com UID 1001)
USER 1001

EXPOSE 3000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -sf http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "server.mjs"]
