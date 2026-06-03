# Social Network API

[English](#english) | [Português](#português)

---

## English

### 🚀 About the Project

This is a robust and scalable Social Network API, developed as a **portfolio** project to demonstrate skills in modern backend development, software architecture, and coding best practices.

The application simulates the core features of a social network, allowing users to interact with each other, share content, and receive real-time updates.

### 🏗️ Architecture

The project was built following **Clean Architecture** and **SOLID** principles, ensuring low coupling and high testability.

- **Repository & Unit of Work Pattern:** Used to abstract the data layer and ensure transaction consistency.
- **Domain-Driven Design (DDD) Principles:** Modular organization by business domains (Users, Posts, Chats, etc.).
- **Adapters:** Use of adapters to decouple external services (Storage, Mailer, Hash).
- **Event-Driven:** Communication between modules through NestJS internal events.
- **Real-time:** WebSocket integration for instant chats and notifications.
- **Job Queue:** Asynchronous processing of heavy tasks using BullMQ and Redis.

### 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Language:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** MySQL (MariaDB)
- **Cache & Queue:** Redis + BullMQ
- **Storage:** MinIO (S3 Compatible)
- **Real-time:** Socket.io
- **Testing:** Jest & Supertest (Unitary and E2E)
- **Containerization:** Docker & Docker Compose

### 📋 Main Features

- **Auth & Authorization:** Registration, Login (JWT with Cookies), password recovery.
- **User Management:** Profiles, follower system (follow/unfollow).
- **Content:** Post creation, editing, and deletion; Multi-level comment system; Likes on posts and comments.
- **Feed:** Dynamic feed based on followed users.
- **Real-time Communication:**
  - Private and group chats.
  - Instant notifications for likes, comments, and new followers.
- **Media:** Image and file upload integrated with MinIO.
- **Background Jobs:** Email processing and asynchronous tasks.

### 🏃 How to Run

**Prerequisites:** Docker and Docker Compose installed.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/social-network-api.git
    cd social-network-api
    ```

2.  **Environment Variables:**
    Copy `.env.example` to `.env` (if not present, create one based on current `.env`).

3.  **Start Containers:**

    ```bash
    docker-compose up -d app-dev
    ```

    _This will start the database, redis, minio, and the application in development mode (watch)._

4.  **Access Swagger Documentation:**
    The API will be available at `http://localhost:3000/api`.

5.  **Running Tests:**

    ```bash
    # Unit Tests
    docker-compose run --rm test-unit

    # E2E Tests
    docker-compose run --rm test-e2e
    ```

---

## Português

### 🚀 Sobre o Projeto

Esta é uma API de Reder Social robusta e escalável, desenvolvida como um projeto de **portfólio** para demonstrar habilidades em desenvolvimento backend moderno, arquitetura de software e boas práticas de codificação.

A aplicação simula as funcionalidades principais de uma rede social, permitindo que usuários interajam entre si, compartilhem conteúdos e recebam atualizações em tempo real.

### 🏗️ Arquitetura

O projeto foi construído seguindo princípios de **Clean Architecture** e **SOLID**, garantindo baixo acoplamento e alta testabilidade.

- **Padrão Repository & Unit of Work:** Utilizado para abstrair a camada de dados e garantir a consistência das transações.
- **Domain-Driven Design (DDD) Principles:** Organização modular por domínios de negócio (Usuários, Posts, Chats, etc.).
- **Adapters:** Uso de adapters para desacoplar serviços externos (Storage, Mailer, Hash).
- **Event-Driven:** Comunicação entre módulos através de eventos internos do NestJS.
- **Real-time:** Integração com WebSockets para chats e notificações instantâneas.
- **Job Queue:** Processamento assíncrono de tarefas pesadas usando BullMQ e Redis.

### 🛠️ Tecnologias

- **Framework:** [NestJS](https://nestjs.com/)
- **Linguagem:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io/)
- **Banco de Dados:** MySQL (MariaDB)
- **Cache & Queue:** Redis + BullMQ
- **Storage:** MinIO (S3 Compatible)
- **Real-time:** Socket.io
- **Testes:** Jest & Supertest (Unitários e E2E)
- **Containerização:** Docker & Docker Compose

### 📋 Principais Funcionalidades

- **Autenticação & Autorização:** Registro, Login (JWT com Cookies), recuperação de senha.
- **Gestão de Usuários:** Perfis, sistema de seguidores (follow/unfollow).
- **Conteúdo:** Criação, edição e exclusão de posts; Sistema de comentários multinível; Likes em posts e comentários.
- **Feed:** Feed dinâmico baseado nos usuários seguidos.
- **Comunicação Real-time:**
  - Chats privados e em grupo.
  - Notificações instantâneas de likes, comentários e novos seguidores.
- **Mídia:** Upload de imagens e arquivos integrados com MinIO.
- **Background Jobs:** Processamento de e-mails e tarefas assíncronas.

### 🏃 Como Rodar o Projeto

**Pré-requisitos:** Docker e Docker Compose instalados.

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/social-network-api.git
    cd social-network-api
    ```

2.  **Configure as variáveis de ambiente:**
    Copie o arquivo `.env.example` para `.env` (se não existir, crie um baseado no `.env` atual).

3.  **Suba os containers:**

    ```bash
    docker-compose up -d app-dev
    ```

    _Este comando subirá o banco de dados, redis, minio e a aplicação em modo de desenvolvimento (watch)._

4.  **Acesse a documentação (Swagger):**
    A API estará disponível em `http://localhost:3000/api`.

5.  **Rodar Testes:**

    ```bash
    # Testes Unitários
    docker-compose run --rm test-unit

    # Testes E2E
    docker-compose run --rm test-e2e
    ```
