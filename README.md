# CheckIn Hub — Totem de Autoatendimento Hoteleiro

> FIAP Challenge 2025-26 · 3º Ano · Engenharia de Software · Parceiro: Flexmedia

Sistema web/kiosk multi-tenant que permite hóspedes realizarem **check-in e check-out automatizados** em totens de autoatendimento, com emissão de chave digital, painel administrativo para gestores e suporte a múltiplos idiomas.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Executando com Docker Compose](#executando-com-docker-compose)
- [Executando em modo desenvolvimento](#executando-em-modo-desenvolvimento)
- [Testes](#testes)
- [Fluxo do Totem](#fluxo-do-totem)
- [Painel Administrativo](#painel-administrativo)
- [API — Principais Endpoints](#api--principais-endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Visão Geral

O **CheckIn Hub** resolve o problema de filas na recepção hoteleira ao permitir que o hóspede realize todo o processo de entrada e saída de forma autônoma em um totem touchscreen.

**Três componentes principais:**

| Componente | Descrição | URL |
|---|---|---|
| `frontend-totem` | Interface touch do kiosk (React + Vite) | [localhost:5173](http://localhost:5173) |
| `frontend-admin` | Painel gerencial para gestores e Flexmedia (React + Vite) | [localhost:5174](http://localhost:5174) |
| `backend` | API REST (Java 17 + Spring Boot 3.4) | [localhost:8080](http://localhost:8080) |

**Infraestrutura:**

| Serviço | Tecnologia |
|---|---|
| Banco de dados | Oracle Database 21c XE |
| Cache / sessão | Redis 7 |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

```
┌─────────────────────────┐    ┌──────────────────────────┐
│    TOTEM (kiosk touch)  │    │   PAINEL ADMIN (web)     │
│  React · Vite · TS      │    │  React · Vite · TS       │
│  TailwindCSS · i18n     │    │  TailwindCSS · Recharts  │
└────────────┬────────────┘    └────────────┬─────────────┘
             │                              │  REST / JWT
             └──────────────┬───────────────┘
                            ▼
                 ┌──────────────────────┐
                 │   BACKEND (API REST) │
                 │  Spring Boot 3.4     │
                 │  Spring Security     │
                 │  JWT Authentication  │
                 ├──────────────────────┤
                 │  Módulos:            │
                 │  · check-in          │
                 │  · check-out         │
                 │  · chaves digitais   │
                 │  · hotéis (tenant)   │
                 │  · métricas          │
                 │  · conteúdo totem    │
                 │  · PMS adapter       │
                 └────────┬─────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
     ┌────────────────┐    ┌─────────────────┐
     │  Oracle XE 21c │    │    Redis 7       │
     │  (persistência)│    │  (cache/sessão)  │
     └────────────────┘    └─────────────────┘
```

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Docker Desktop | 24+ |
| Docker Compose | v2+ |
| Java (desenvolvimento) | 17 (Temurin) |
| Maven (desenvolvimento) | 3.9+ |
| Node.js (desenvolvimento) | 20+ |

---

## Executando com Docker Compose

Esta é a forma **recomendada** para rodar o sistema completo.

```bash
# 1. Clone o repositório
git clone https://github.com/MatheusCompass/2025-challenge-flexmedia.git
cd 2025-challenge-flexmedia

# 2. Suba todos os serviços (Oracle, Redis, backend, totem, admin)
docker compose up --build -d

# 3. Aguarde todos os health checks passarem (~2-3 min na primeira vez)
docker compose ps
```

> **Atenção:** Na primeira execução o Oracle leva cerca de 2 minutos para inicializar. O backend aguarda automaticamente via `depends_on: condition: service_healthy`.

**URLs disponíveis após subir:**

| Interface | URL |
|---|---|
| Totem (kiosk) | [http://localhost:5173](http://localhost:5173) |
| Painel Admin | [http://localhost:5174](http://localhost:5174) |
| API health check | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) |

```bash
# Parar todos os serviços
docker compose down

# Parar e remover volumes (reset total do banco)
docker compose down -v
```

---

## Executando em modo desenvolvimento

### Backend

```bash
cd backend

# Inicie apenas Oracle e Redis via Docker
docker compose up oracle redis -d

# Execute o backend localmente
./mvnw spring-boot:run
# ou no Windows:
mvn spring-boot:run
```

O backend inicia em [http://localhost:8080](http://localhost:8080) e cria as tabelas automaticamente (`ddl-auto=update`).

### Frontend Totem

```bash
cd frontend-totem
npm install
npm run dev
```

Abre em → [http://localhost:5173](http://localhost:5173)

### Frontend Admin

```bash
cd frontend-admin
npm install
npm run dev
```

Abre em → [http://localhost:5174](http://localhost:5174)

> Por padrão, os frontends apontam para `http://localhost:8080`. Para alterar, edite `VITE_API_URL` no arquivo `.env` de cada frontend.

---

## Testes

```bash
cd backend

# Executar todos os testes (unitários + integração com H2 em memória)
mvn test
```

**Suíte atual: 52 testes — 0 falhas**

| Classe | Tipo | Testes |
|---|---|---|
| `JwtServiceTest` | Unit | 6 |
| `HotelServiceTest` | Unit | 7 |
| `CheckinServiceTest` | Unit | 3 |
| `CheckoutServiceTest` | Unit | 3 |
| `ChavesServiceTest` | Unit | 3 |
| `CheckinHubApplicationTests` | Context | 1 |
| `AuthControllerIT` | Integration | 4 |
| `HotelControllerIT` | Integration | 7 |
| `CheckinControllerIT` | Integration | 6 |
| `CheckoutControllerIT` | Integration | 7 |
| `ChavesControllerIT` | Integration | 5 |

Os testes de integração usam **H2 em memória** — não precisam de Oracle nem Redis.

---

## Fluxo do Totem

O totem funciona em **modo kiosk fullscreen** e guia o hóspede pelas seguintes telas:

```
1. Tela Idle          → exibe promoções / instruções; toque inicia o fluxo
2. Seleção de Idioma  → Português · English · Español
3. Buscar Reserva     → por código de reserva ou CPF
4. Confirmar Dados    → hóspede revisa nome, quarto e datas
5. Reconhecimento     → câmera valida identidade (MediaStream API)
6. Emissão de Chave   → QR Code / token digital exibido na tela
7. Obrigado / Saída   → retorna ao idle após timer configurável

Fluxo de Check-out (acessado pela tela Idle):
1. Buscar Reserva     → por código ou CPF
2. Confirmar Checkout → chaves digitais são invalidadas
3. Obrigado           → retorna ao idle
```

---

## Painel Administrativo

Acesse [http://localhost:5174](http://localhost:5174) e faça login com um usuário administrador.

### Criando o primeiro usuário admin

Insira diretamente no banco (ou via endpoint de seed que pode ser adicionado):

```sql
INSERT INTO usuario (id, nome, email, senha, role, ativo)
VALUES (1, 'Admin', 'admin@checkinhub.com',
        -- senha: admin123 (BCrypt)
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHy',
        'ADMIN', 1);
```

### Funcionalidades do painel

| Página | Descrição |
|---|---|
| **Dashboard** | KPIs do dia (check-ins, check-outs, chaves emitidas, ocupação, hotéis ativos) + gráficos históricos (7 dias) |
| **Hotéis** | Cadastro e desativação de hotéis (suporte multi-tenant) |
| **Reservas** | Listagem com filtro por status (CONFIRMADA, CHECKIN\_REALIZADO, CHECKOUT\_REALIZADO, CANCELADA) |
| **Conteúdo** | Gerenciamento de banners e mensagens exibidos no totem em modo idle |

---

## API — Principais Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | [/api/auth/login](http://localhost:8080/api/auth/login) | Retorna JWT token |

### Check-in (público — sem autenticação)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | [/api/checkin/reserva/{codigoOuCpf}](http://localhost:8080/api/checkin/reserva/RES-001) | Busca reserva por código ou CPF |
| `POST` | [/api/checkin/confirmar/{reservaId}](http://localhost:8080/api/checkin/confirmar/1) | Realiza check-in |

### Check-out (público)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | [/api/checkout/reserva/{codigoOuCpf}](http://localhost:8080/api/checkout/reserva/RES-001) | Busca reserva com check-in |
| `POST` | [/api/checkout/confirmar/{reservaId}](http://localhost:8080/api/checkout/confirmar/1) | Realiza check-out e invalida chaves |

### Chaves Digitais (público)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | [/api/chaves/{reservaId}](http://localhost:8080/api/chaves/1) | Emite chave digital — 201 Created |

### Hotéis (requer autenticação JWT)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | [/api/hoteis](http://localhost:8080/api/hoteis) | Lista paginada |
| `POST` | [/api/hoteis](http://localhost:8080/api/hoteis) | Cadastra hotel |
| `GET` | [/api/hoteis/{id}](http://localhost:8080/api/hoteis/1) | Busca por id |
| `DELETE` | [/api/hoteis/{id}](http://localhost:8080/api/hoteis/1) | Desativa hotel |

### Métricas (requer autenticação JWT)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | [/api/metricas/dashboard](http://localhost:8080/api/metricas/dashboard) | KPIs + histórico 7 dias |

### Conteúdo do Totem
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | [/api/conteudo](http://localhost:8080/api/conteudo) | Lista conteúdos ativos (público) |
| `POST` | [/api/conteudo](http://localhost:8080/api/conteudo) | Cria conteúdo (admin) |

### Health Check
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | [/actuator/health](http://localhost:8080/actuator/health) | Status do serviço |

> Endpoints protegidos exigem o header: `Authorization: Bearer <token>`

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

```env
# Banco de dados Oracle
ORACLE_URL=jdbc:oracle:thin:@localhost:1521/XEPDB1
ORACLE_USER=checkinhub
ORACLE_PASS=checkinhub123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=

# JWT (mínimo 256 bits)
JWT_SECRET=3cHm9K8vXqL2pN5rT7wZ0jF4dY1sU6bE
JWT_EXPIRATION=86400000

# PMS Adapter: mock | opera | totvs
PMS_ADAPTER=mock

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

## Estrutura do Projeto

```
.
├── backend/                        # API Java Spring Boot
│   └── src/
│       ├── main/java/.../
│       │   ├── modules/
│       │   │   ├── checkin/        # Check-in module
│       │   │   ├── checkout/       # Check-out module
│       │   │   ├── keys/           # Emissão de chaves digitais
│       │   │   ├── hotel/          # Multi-tenant: hotéis e reservas
│       │   │   ├── metrics/        # Métricas e dashboard
│       │   │   └── conteudo/       # Conteúdo do totem (idle screen)
│       │   ├── pms/                # PMS Adapter (Strategy Pattern)
│       │   ├── security/           # JWT + Spring Security
│       │   └── common/             # Exceções e handler global
│       └── test/                   # 52 testes (unit + integração)
│
├── frontend-totem/                 # Interface touch do kiosk
│   └── src/
│       ├── pages/                  # Idle, Idioma, Busca, Chave, Checkout...
│       ├── context/                # TotemContext (estado global do fluxo)
│       ├── services/               # Chamadas à API
│       └── locales/                # Traduções: pt.json, en.json, es.json
│
├── frontend-admin/                 # Painel administrativo
│   └── src/
│       ├── pages/                  # Login, Dashboard, Hotéis, Reservas, Conteúdo
│       ├── components/             # Layout, Sidebar, PrivateRoute
│       ├── context/                # AuthContext (JWT)
│       └── services/               # Chamadas à API
│
├── docker-compose.yml              # Orquestração completa (5 serviços)
├── .env.example                    # Template de variáveis de ambiente
└── README.md
```

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Backend | Java 17 · Spring Boot 3.4 · Spring Security · JPA/Hibernate |
| Autenticação | JWT (jjwt 0.12) |
| Frontend | React 18 · Vite · TypeScript · TailwindCSS v4 |
| Gráficos (admin) | Recharts |
| Banco de Dados | Oracle Database 21c XE |
| Cache | Redis 7 |
| Testes | JUnit 5 · Mockito · H2 · MockMvc |
| Containers | Docker · Docker Compose |

---

## Equipe

Grupo XX — 3ESOR · FIAP 2025-26
