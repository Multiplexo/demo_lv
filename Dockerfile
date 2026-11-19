# Gewerke-Anfragen (Demo): App eines Kunden plus Onboarding, ausgeliefert von nginx mit Passwortschutz.
# Kunde wählen: docker build --build-arg KUNDE=demo .   (Ordner unter kunden/)
FROM python:3.12-alpine AS build
ARG KUNDE=demo
WORKDIR /app
COPY build.py ./
COPY src ./src
COPY kunden ./kunden
RUN python3 build.py --kunde "$KUNDE" --out /app/dist

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/40-basic-auth.sh /docker-entrypoint.d/40-basic-auth.sh
RUN chmod +x /docker-entrypoint.d/40-basic-auth.sh
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
