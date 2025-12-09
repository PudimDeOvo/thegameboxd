
-- USUÁRIOS

INSERT INTO users (username, email, password, admin) VALUES 
('kaynan', 'kaynan@gmail.com', 'admin123', 1),
('bia', 'bia@gmail.com', 'bialinda', 0),
('felipe', 'felipe@gmail.com', 'footballmanager', 0),
('larinha', 'lara@gmail.com', 'twice', 0),
('demo_user', 'demo@gmail.com', '123456', 0);

--EMPRESAS 
INSERT INTO empresas (nome, tipo_empresa, pais_origem) VALUES 
('Capcom', 'desenvolvedora', 'Japão'),       -- ID 1
('Rockstar Games', 'desenvolvedora', 'EUA'), -- ID 2
('FromSoftware', 'desenvolvedora', 'Japão'), -- ID 3
('Nintendo', 'publicadora', 'Japão'),        -- ID 4
('Take-Two', 'publicadora', 'EUA'),          -- ID 5
('Bandai Namco', 'publicadora', 'Japão');    -- ID 6

-- ESPECIALIZAÇÕES

-- Desenvolvedoras
INSERT INTO desenvolvedoras (id_empresa, mercado_principal) VALUES 
(1, 'Global'),          -- Capcom
(2, 'Mundo Aberto'),    -- Rockstar
(3, 'Hardcore Games'),  -- FromSoftware
(4, 'Consoles');        -- nintendo
-- Publicadoras
INSERT INTO publicadoras (id_empresa, mercado_principal) VALUES 
(1, 'Global'),
(4, 'Consoles'),        -- Nintendo
(5, 'Global'),          -- Take-Two
(6, 'Global');          -- Bandai Namco

-- JOGOS
-- IDs: 1=RE4, 2=Zelda, 3=RDR2, 4=GTA V, 5=Elden Ring
INSERT INTO jogos (titulo, descricao, nota_metacritic, id_desenvolvedor, id_publicadora) VALUES 
('Resident Evil 4 Remake', 'Survival Horror reimaginado.', 93, 1, 1), -- Capcom (Dev)
('Zelda: Breath of the Wild', 'Aventura em mundo aberto.', 97, 4, 4), -- Nintendo (Dev/Pub)
('Red Dead Redemption 2', 'Épico do velho oeste.', 97, 2, 5),         -- Rockstar (Dev), TakeTwo (Pub)
('Grand Theft Auto V', 'Crime e mundo aberto.', 96, 2, 5),            -- Rockstar (Dev), TakeTwo (Pub)
('Elden Ring', 'RPG de ação desafiador.', 96, 3, 6);                  -- FromSoft (Dev), Bandai (Pub)

-- GÊNEROS
INSERT INTO generos (nome_genero) VALUES 
('Survival Horror'), -- ID 1
('Aventura'),        -- ID 2
('RPG'),             -- ID 3
('Ação'),            -- ID 4
('Mundo Aberto');    -- ID 5

-- PLATAFORMAS
INSERT INTO plataformas (nome) VALUES 
('PC'),              -- ID 1
('PlayStation 5'),   -- ID 2
('Nintendo Switch'), -- ID 3
('Xbox Series X');   -- ID 4

-- ASSOCIAÇÕES: JOGO_GENERO (Muitos para Muitos)

-- RE4: Horror e Ação
INSERT INTO jogo_genero VALUES (1, 1), (1, 4);
-- Zelda: Aventura e Mundo Aberto
INSERT INTO jogo_genero VALUES (2, 2), (2, 5);
-- RDR2: Ação, Aventura e Mundo Aberto
INSERT INTO jogo_genero VALUES (3, 4), (3, 2), (3, 5);
-- GTA V: Ação e Mundo Aberto
INSERT INTO jogo_genero VALUES (4, 4), (4, 5);
-- Elden Ring: RPG e Ação
INSERT INTO jogo_genero VALUES (5, 3), (5, 4);

-- ASSOCIAÇÕES: JOGO_PLATAFORMAS (Muitos para Muitos)

-- RE4: PC, PS5, Xbox
INSERT INTO jogo_plataformas VALUES (1, 1, '2023-03-24'), (1, 2, '2023-03-24'), (1, 4, '2023-03-24');
-- Zelda: Apenas Switch
INSERT INTO jogo_plataformas VALUES (2, 3, '2017-03-03');
-- RDR2: PC, PS5, Xbox
INSERT INTO jogo_plataformas VALUES (3, 1, '2018-10-26'), (3, 2, '2018-10-26'), (3, 4, '2018-10-26');
-- Elden Ring: Todos menos Switch
INSERT INTO jogo_plataformas VALUES (5, 1, '2022-02-25'), (5, 2, '2022-02-25'), (5, 4, '2022-02-25');

-- ADICIONANDO DLCS (
INSERT INTO dlcs (id_jogo, nome_dlc, descricao) VALUES 
(1, 'Separate Ways', 'Campanha adicional focada em Ada Wong.'),
(3, 'Red Dead Online Access', 'Acesso ao modo multiplayer de RDR2.'),
(4, 'The Diamond Casino Heist', 'Grande assalto adicionado ao GTA V Online.'),
(5, 'Shadow of the Erdtree', 'Nova expansão massiva de Elden Ring, com novas áreas e bosses.');

-- WATCHLISTS (Listas de jogos)

-- Bia quer jogar Zelda
INSERT INTO watchlists (id_user, nome) VALUES (2, 'favoritos');
INSERT INTO watchlist_jogo (id_watchlist, id_jogo) VALUES (1, 2);

-- Felipe gosta de jogos difíceis (Elden Ring)
INSERT INTO watchlists (id_user, nome) VALUES (3, 'Souls-like');
INSERT INTO watchlist_jogo (id_watchlist, id_jogo) VALUES (2, 5);

-- Kaynan tem uma lista mista
INSERT INTO watchlists (id_user, nome) VALUES (1, 'So os tops');
INSERT INTO watchlist_jogo (id_watchlist, id_jogo) VALUES (3, 1), (3, 3), (3, 4);

-- AVALIAÇÕES
INSERT INTO avaliacoes (nota, comentario, id_jogo, id_user) VALUES 
(10.0, 'Simplesmente o GOTY, não tem como.', 5, 1), -- Kaynan avaliou Elden Ring
(9.5, 'Gráficos lindos, mas a história cansa e eu zerei pelo youtube muito paia.', 3, 2), -- Bia avaliou RDR2
(10.0, 'Zelda mudou minha vida.', 2, 4), -- Larinha avaliou Zelda
(8.0, 'Bom, mas prefiro o antigo e nao gostei do romance que adicionaram.', 1, 3); -- Felipe avaliou RE4