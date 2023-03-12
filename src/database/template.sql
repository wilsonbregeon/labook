
CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    create_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO users (id, name, email, password, role)
VALUES
 ("u001", "Fulano", "fulano@email.com", "fulano30", "NORMAL"),
 ("u002", "Ciclano", "ciclano@email.com", "ciclano90", "NORMAL"),
 ("u003", "Belatrano", "beltrano@email.com", "beltrano10", "ADMIN")