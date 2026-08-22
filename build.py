import os
def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

docker_compose = """version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: seamless
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
  redis:
    image: redis:7
  web:
    build: .
    command: bash -c "python manage.py migrate && python manage.py seed_demo && python manage.py generate_qr && daphne -b 0.0.0.0 -p 8000 config.asgi:application"
    volumes:
      - .:/app
    environment:
      - POSTGRES_HOST=db
      - POSTGRES_DB=seamless
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgrespassword
      - REDIS_URL=redis://redis:6379/0
      - DJANGO_SECRET_KEY=seamless-prod-secret-key-change-in-production
      - DEBUG=0
    depends_on:
      - db
      - redis
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - web
volumes:
  postgres_data:
"""

dockerfile = """FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""

nginx = """server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
    }
    location /ws/ {
        proxy_pass http://web:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
"""

write_file("docker-compose.yml", docker_compose)
write_file("frontend/Dockerfile", dockerfile)
write_file("frontend/nginx.conf", nginx)

