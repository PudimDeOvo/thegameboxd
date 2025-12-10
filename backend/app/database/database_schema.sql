
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
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic_url VARCHAR(255),
    background_pic_url VARCHAR(255),
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
    titulo VARCHAR(255),
    descricao TEXT,
    capa_url VARCHAR(255),
    nota_metacritic INTEGER,
    id_desenvolvedor INTEGER,
    id_igdb INTEGER,
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
    status_jogo VARCHAR(50) NOT NULL DEFAULT 'AINDA NAO JOGADO',
    PRIMARY KEY (id_watchlist, id_jogo),
    FOREIGN KEY(id_watchlist) REFERENCES watchlists(id_watchlist) ON DELETE CASCADE,
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo)
);

CREATE TABLE avaliacoes (
    id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,
    nota REAL NOT NULL,
    comentario TEXT,
    id_jogo INTEGER NOT NULL,
    id_user INTEGER NOT NULL,
    
    FOREIGN KEY(id_jogo) REFERENCES jogos(id_jogo),
    FOREIGN KEY(id_user) REFERENCES users(id)
);

PRAGMA foreign_keys = ON;

-- ==================================================================
-- CARGA INICIAL (CORRIGIDA)
-- ==================================================================

-- -- 1. Usuários
-- INSERT INTO users (id, username, email, password, admin) VALUES 
-- (1, 'admin_user', 'admin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 1),
-- (2, 'gamer_one', 'gamer@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 0);

-- -- 2. Empresas (Capcom=1, Nintendo=2)
-- INSERT INTO empresas (id_empresa, nome, tipo_empresa, pais_origem) VALUES 
-- (1, 'Capcom', 'desenvolvedora', 'Japão'),
-- (2, 'Nintendo', 'publicadora', 'Japão');

-- -- 3. Especializações
-- INSERT INTO desenvolvedoras (id_empresa, mercado_principal) VALUES (1, 'Global'); -- ID 1 existe
-- INSERT INTO publicadoras (id_empresa, mercado_principal) VALUES (2, 'Consoles');  -- ID 2 existe

-- -- 4. Gêneros e Plataformas
-- INSERT INTO generos (id_genero, nome_genero) VALUES (1, 'Survival Horror'), (2, 'Action');
-- INSERT INTO plataformas (id_plataforma, nome) VALUES (1, 'PC'), (2, 'PlayStation 5');

-- -- 5. Jogos (AQUI ESTAVA O ERRO)
-- -- Corrigido: id_desenvolvedor=1 (Capcom), id_publicadora=2 (Nintendo)
-- -- Antes estava 1 e 1, mas Publicadora 1 não existia.
-- INSERT INTO jogos (id_jogo, titulo, descricao, nota_metacritic, id_desenvolvedor, id_publicadora) VALUES 
-- (1, 'Resident Evil 4 Remake', 'Survival horror game.', 93, 1, 2);

-- -- 6. Associações
-- INSERT INTO jogo_genero (id_jogo, id_genero) VALUES (1, 1);
-- INSERT INTO jogo_plataformas (id_jogo, id_plataforma, data_lancamento) VALUES (1, 1, '2023-03-24');

-- -- 7. Watchlist
-- INSERT INTO watchlists (id_watchlist, id_user) VALUES (1, 2); -- User 2 existe
-- INSERT INTO watchlist_jogo (id_watchlist, id_jogo) VALUES (1, 1); -- Watchlist 1 e Jogo 1 existem

-- -- 8. Avaliação
-- INSERT INTO avaliacoes (id_avaliacao, nota, comentario, id_jogo, id_user, id_plataforma) VALUES 
-- (1, 10.0, 'Obra prima no PC!', 1, 2, 1);