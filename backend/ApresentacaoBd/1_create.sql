PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS avaliacoes;
DROP TABLE IF EXISTS watchlist_jogo;
DROP TABLE IF EXISTS watchlists;
DROP TABLE IF EXISTS dlcs;
DROP TABLE IF EXISTS jogo_plataformas;
DROP TABLE IF EXISTS jogo_genero;
DROP TABLE IF EXISTS plataformas;
DROP TABLE IF EXISTS generos;
DROP TABLE IF EXISTS jogos;
DROP TABLE IF EXISTS publicadoras;
DROP TABLE IF EXISTS desenvolvedoras;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) NOT NULL ,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    admin BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE empresas (
    id_empresa INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL UNIQUE,
    tipo_empresa VARCHAR(50) NOT NULL,
    data_fundacao DATE,
    pais_origem VARCHAR(100)
);

CREATE TABLE desenvolvedoras (
    id_empresa INTEGER PRIMARY KEY,
    mercado_principal VARCHAR(255),
    FOREIGN KEY(id_empresa) REFERENCES empresas(id_empresa)
);

CREATE TABLE publicadoras (
    id_empresa INTEGER PRIMARY KEY,
    mercado_principal VARCHAR(255),
    FOREIGN KEY(id_empresa) REFERENCES empresas(id_empresa)
);

CREATE TABLE jogos (
    id_jogo INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    nota_metacritic INTEGER,
    id_desenvolvedor INTEGER,
    id_publicadora INTEGER,
    FOREIGN KEY(id_desenvolvedor) REFERENCES desenvolvedoras(id_empresa),
    FOREIGN KEY(id_publicadora) REFERENCES publicadoras(id_empresa)
);

CREATE TABLE generos (
    id_genero INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_genero VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE plataformas (
    id_plataforma INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE jogo_genero (
    id_jogo INTEGER NOT NULL,
    id_genero INTEGER NOT NULL,
    PRIMARY KEY (id_jogo, id_genero),
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo),
    FOREIGN KEY(id_genero) REFERENCES generos(id_genero)
);

CREATE TABLE jogo_plataformas (
    id_jogo INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    data_lancamento DATE,
    PRIMARY KEY (id_jogo, id_plataforma),
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo),
    FOREIGN KEY(id_plataforma) REFERENCES plataformas(id_plataforma)
);

CREATE TABLE dlcs (
    id_jogo INTEGER NOT NULL,
    nome_dlc VARCHAR(255) NOT NULL,
    descricao TEXT,
    PRIMARY KEY (id_jogo, nome_dlc),
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo)
);

CREATE TABLE watchlists (
    id_watchlist INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    nome VARCHAR(100),
    FOREIGN KEY(id_user) REFERENCES users(id)
);

CREATE TABLE watchlist_jogo (
    id_watchlist INTEGER NOT NULL,
    id_jogo INTEGER NOT NULL,
    PRIMARY KEY (id_watchlist, id_jogo),
    FOREIGN KEY(id_watchlist) REFERENCES watchlists(id_watchlist),
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo)
);

CREATE TABLE avaliacoes (
    id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,
    nota REAL NOT NULL,
    comentario TEXT,
    id_jogo INTEGER NOT NULL,
    id_user INTEGER NOT NULL,
    
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo),
    FOREIGN KEY(id_user) REFERENCES users(id),
    UNIQUE(id_jogo, id_user)
);

PRAGMA foreign_keys = ON;