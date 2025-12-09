
--CRUD COMPLETO DE USUÁRIO

-- 1. CREATE
INSERT INTO users (username, email, password, admin) 
VALUES ('beatriz', 'ultrabia@gmail.com', '1234256', 0);


-- 2. READ:
SELECT * FROM users

SELECT * FROM users WHERE username = 'beatriz';

SELECT email FROM users WHERE username = 'beatriz';

SELECT email,password FROM users WHERE username = 'beatriz';

SELECT * FROM users WHERE admin = 1;

SELECT * FROM users WHERE id = 6;


-- 3. UPDATE:
UPDATE users
SET email = 'guy@gmail.com' 
WHERE id = 6;

UPDATE users
SET username = 'biadasilva' 
WHERE id = 6;

UPDATE users
SET password = 'twice123' 
WHERE id = 6;

SELECT * FROM users WHERE id = 6;


-- 4. DELETE:

SELECT * FROM users

DELETE FROM users WHERE id = 1;

SELECT * FROM users WHERE id = 1;


--CRUD COMPLETO DE JOGOS

-- CREATE (Avaliação)

SELECT * FROM avaliacoes
SELECT * FROM jogos

INSERT INTO avaliacoes (nota, comentario, id_jogo, id_user) 
VALUES (9.0, 'Excelenate mundo aberto, mas o online precisa de balanceamento.', 5, 2);

-- Validação
SELECT 
    j.titulo, 
    u.username,
    a.nota, 
    a.comentario 
FROM avaliacoes a
JOIN users u ON a.id_user = u.id
JOIN jogos j ON a.id_jogo = j.id_jogo
WHERE a.id_jogo = 5;


-- UPDATE (Avaliação)
-- Kaynan muda de ideia e sobe a nota de 9.0 para 9.9
UPDATE avaliacoes 
SET nota = 9.9, comentario = 'O online está melhorando! Nota máxima merecida.'
WHERE id_user = 1 AND id_jogo = 5;

-- Validação 
SELECT nota, comentario FROM avaliacoes WHERE id_user = 1 AND id_jogo = 5;


--  DELETE
-- Kaynan decide remover a review permanentemente.
DELETE FROM avaliacoes 
WHERE id_user = 1 AND id_jogo = 5;

-- Validação (Deve vir vazio):
SELECT * FROM avaliacoes WHERE id_user = 1 AND id_jogo = 5;
SELECT * FROM avaliacoes;


-- WATCHLISTS (CRUD e Consulta)


-- READ (Consulta de Agregação): Média de notas de um jogo (RDR2)

SELECT 
    j.titulo, 
    AVG(a.nota) AS media_geral, 
    COUNT(a.id_avaliacao) AS total_avaliacoes
FROM jogos j
LEFT JOIN avaliacoes a ON j.id_jogo = a.id_jogo
WHERE j.id_jogo = 3;


-- 5. CREATE (Adicionar à Watchlist)
-- Bia (dona da lista 1) adiciona RDR2 (ID 3) à sua lista.
INSERT INTO watchlist_jogo (id_watchlist, id_jogo) 
VALUES (1, 3);

-- Validação: Mostrar os itens da Lista 1
SELECT w.nome AS Lista, j.titulo 
FROM watchlists w
JOIN watchlist_jogo wj ON w.id_watchlist = wj.id_watchlist
JOIN jogos j ON wj.id_jogo = j.id_jogo
WHERE w.id_watchlist = 1;


-- 6. UPDATE (Atualizar Nome da Lista)
-- Bia muda o nome da lista de 'favoritos' para 'Melhores do Ano'.
UPDATE watchlists 
SET nome = 'Melhores do Ano' 
WHERE id_watchlist = 1;

-- Validação:
SELECT * FROM watchlists WHERE id_watchlist = 1;


-- 7. DELETE (Remover Item da Lista)
-- Bia remove RDR2 (ID 3) da sua lista 1.
DELETE FROM watchlist_jogo 
WHERE id_watchlist = 1 AND id_jogo = 3;

-- Validação:
SELECT * FROM watchlist_jogo WHERE id_watchlist = 1;


-- CONSULTAs AVANÇADAs


SELECT 
    j.titulo,
    e_dev.nome AS Desenvolvedora,
    e_pub.nome AS Publicadora,
    e_dev.pais_origem AS País_Origem_Dev,
    GROUP_CONCAT(g.nome_genero, ', ') AS Generos,
    GROUP_CONCAT(p.nome, ', ') AS Plataformas_Lançamento
FROM jogos j
LEFT JOIN empresas e_dev ON j.id_desenvolvedor = e_dev.id_empresa
LEFT JOIN empresas e_pub ON j.id_publicadora = e_pub.id_empresa
LEFT JOIN jogo_genero jg ON j.id_jogo = jg.id_jogo
LEFT JOIN generos g ON jg.id_genero = g.id_genero
LEFT JOIN jogo_plataformas jp ON j.id_jogo = jp.id_jogo
LEFT JOIN plataformas p ON jp.id_plataforma = p.id_plataforma
WHERE j.id_jogo = 5
GROUP BY j.id_jogo;

-- CONSULTA QUE UNE INFORMACOES DE TODAS AS TABELAS

SELECT 
    j.titulo AS Jogo, 
    j.nota_metacritic,

    e_dev.nome AS Desenvolvedora,
    e_pub.nome AS Publicadora,

    -- Associações
    GROUP_CONCAT(DISTINCT g.nome_genero) AS Generos_Lista,
    GROUP_CONCAT(DISTINCT p_names.nome) AS Plataformas_Lançadas,
    
    GROUP_CONCAT(dlc.nome_dlc, ' | ') AS Conteúdo_Adicional_DLC,
    
    GROUP_CONCAT(DISTINCT u.username) AS Usuarios_Que_Avaliaram,
    GROUP_CONCAT(DISTINCT w.nome) AS Watchlists_Ativas,
    
    AVG(a.nota) AS Média_Avaliações_User,
    COUNT(DISTINCT a.id_avaliacao) AS Total_Reviews
    
FROM jogos j

-- 1. Desenvolvedora e Publicadora
LEFT JOIN empresas e_dev ON j.id_desenvolvedor = e_dev.id_empresa
LEFT JOIN empresas e_pub ON j.id_publicadora = e_pub.id_empresa

-- 2. Gêneros
LEFT JOIN jogo_genero jg ON j.id_jogo = jg.id_jogo
LEFT JOIN generos g ON jg.id_genero = g.id_genero

-- 3. Plataformas
LEFT JOIN jogo_plataformas jp ON j.id_jogo = jp.id_jogo
LEFT JOIN plataformas p_names ON jp.id_plataforma = p_names.id_plataforma

-- 4. DLCs
LEFT JOIN dlcs dlc ON j.id_jogo = dlc.id_jogo

-- 5. Avaliações E USUÁRIOS
LEFT JOIN avaliacoes a ON j.id_jogo = a.id_jogo
LEFT JOIN users u ON a.id_user = u.id 

-- 6. Watchlists E Nome da Lista
LEFT JOIN watchlist_jogo wj ON j.id_jogo = wj.id_jogo
LEFT JOIN watchlists w ON wj.id_watchlist = w.id_watchlist 

GROUP BY 
    j.id_jogo, j.titulo, j.nota_metacritic, 
    e_dev.nome, e_pub.nome;