# 🎮 PlayList API | Backend de Watchlist de Jogos

[![Powered by FastAPI](https://img.shields.io/badge/API-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Powered by Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-316192.svg)](https://www.postgresql.org)

Este projeto é o backend de um "Letterboxd de Jogos" (Game Watchlist) que utiliza a API **IGDB** (via Twitch) para buscar dados de jogos e mantém um sistema interno de **Watchlists** e **Reviews** para seus usuários.

O foco principal do desenvolvimento foi a padronização de dados, a robustez na integração com APIs externas e a eficiência em queries de ranking complexas.

---

## ✨ Principais Funcionalidades

A API oferece serviços de dados e ranking otimizados:

* **Busca Inteligente:** Pesquisa de jogos por nome ou gênero (com correção automática de termos).
* **Ranking Global IGDB:** Listagem dos jogos mais populares/famosos de todos os tempos, ordenados pela contagem total de avaliações.
* **Ranking Interno:** Geração do Top 10 jogos com a maior média de nota baseada nas reviews dos usuários do sistema (SQL Aggregation).
* **Autenticação IGDB:** Lógica de autenticação e refresh de token via Twitch Client Credentials (implementada na classe `IGDBClient`).
* **Gerenciamento de Dados:** CRUD completo para Watchlists e Reviews dos usuários.
* **Padronização de Retorno:** Todos os endpoints de busca retornam Capa, Gêneros e Nota (escala 0-10) de forma consistente.

---

## ⚙️ Tecnologias Utilizadas

| Componente | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI** | Alto desempenho e tipagem forte em Python. |
| **Banco de Dados** | **PostgreSQL** (Recomendado) | Usado para armazenar usuários, jogos, reviews e watchlists. |
| **ORM/Queries** | **SQLAlchemy** (Async) | Gerenciamento de modelos e execução de queries SQL (`text` e Core). |
| **Requisições HTTP** | **httpx** (Async) | Cliente HTTP assíncrono para comunicação com a API IGDB. |
| **Integração Externa** | **IGDB API** | Fonte de dados de jogos (Autenticação via Twitch). |

---

## 🚀 Setup e Instalação

### 1. Clonar o Repositório

```bash
git clone [URL-DO-SEU-REPOSITÓRIO]
cd nome-do-repositorio
