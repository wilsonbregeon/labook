-- Active: 1678631983358@@127.0.0.1@3306

CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO users (id, name, email, password, role)
VALUES
 ("u001", "Fulano", "fulano@email.com", "fulano30", "NORMAL"),
 ("u002", "Ciclano", "ciclano@email.com", "ciclano90", "NORMAL"),
 ("u003", "Beltrano", "beltrano@email.com", "beltrano10", "ADMIN");

 CREATE TABLE posts (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    creator_id TEXT NOT NULL,
    name TEXT NOT NULL,
    likes INTEGER DEFAULT (0) NOT NULL,
    dislikes INTEGER DEFAULT (0) NOT NULL,
    created_at TEXT DEFAULT(DATETIME()) NOT NULL,
    updated_at TEXT DEFAULT(DATETIME()) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
 );

 INSERT INTO posts (id, creator_id, name)
 VALUES
 ("p001", "u001", "Futebol"),
 ("p002", "u002", "Política"),
 ("p003", "u002", "Música");

CREATE TABLE likes_dislikes (
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO likes_dislikes (user_id, post_id, like)
VALUES
    ("u002", "p001", 1),
    ("u003", "p002", 1),
    ("u001", "p001", 1),
    ("u001", "p002", 0);

UPDATE posts
SET likes = 2
WHERE id = "p001";

UPDATE posts
SET likes = 1
WHERE id = "p002";

UPDATE posts
SET dislikes = 1
WHERE id = "p002";


SELECT * FROM  posts;

SELECT * from users;

-- Comando para deletar um usuário da tabela users. Obs: não esquecer de preencher o nome entre as aspas
DELETE FROM users
WHERE name = ""