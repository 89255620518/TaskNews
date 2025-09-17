# 1. Строим React
FROM node:18-alpine AS build
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

# 2. Отдаём сборку через nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Порт для HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
