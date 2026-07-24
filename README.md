# FisioQuest

** ALLAN LEANDRO FERNANDES **.
** LEANDESON PINHEIRO SANTOS DE ARAUJO  **.

## 🛠 Tecnologias Utilizadas

**Back-end:**
* Java 17
* Spring Boot
* PostgreSQL (via Docker)
* Flyway (Migrations)
* Spring Security + JWT

**Front-end:**
* React

---

## Pré-requisitos

* [Java 17 (JDK)](https://adoptium.net/)
* [Node.js e NPM](https://nodejs.org/)
* [Docker e Docker Compose](https://www.docker.com/)
* [Git](https://git-scm.com/)

---

## Como rodar o projeto localmente

### 1. Iniciar o Back-end e o Banco de Dados

O banco de dados local roda de forma isolada em um container Docker.

1. Abra o terminal na pasta do back-end (`fisioquest-api`).
2. Suba o banco de dados executando: `docker compose up -d`
3. Inicie a API executando: `./mvnw clean spring-boot:run "-Dspring-boot.run.profiles=dev"`

### 2. Iniciar o Front-end

1. Abra o terminal na pasta do front-end (`fisioquest-react`).
2. Instale as dependências: `npm install`
3. Inicie o projeto: `npm run dev`

O Vite será iniciado e é só acessar a URL que ele fornecer.
