BEGIN;

-- Suppression des tables si elles existent déjà (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "order_has_jewel" CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS "jewel" CASCADE;
DROP TABLE IF EXISTS "customer" CASCADE;
DROP TABLE IF EXISTS "role" CASCADE;
DROP TABLE IF EXISTS "category" CASCADE;
DROP TABLE IF EXISTS order_items;

-- 1. Table des catégories (Bagues, Bracelets, etc.)
CREATE TABLE "category" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL
);
CREATE TABLE "jewel_has_material" (
    "jewel_id" INTEGER REFERENCES "jewel"("id"),
    "material_id" INTEGER REFERENCES "material"("id"),
    PRIMARY KEY ("jewel_id", "material_id")
);

-- Table des matériaux
CREATE TABLE "material" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données pour les matériaux
INSERT INTO "material" ("name", "created_at", "updated_at")
VALUES
  ('Or', NOW(), NOW()),
  ('Argent', NOW(), NOW()),
  ('Platine', NOW(), NOW()),
  ('Diamant', NOW(), NOW()),
  ('Perle', NOW(), NOW()),
  ('Cuivre', NOW(), NOW()),
  ('Acier inoxydable', NOW(), NOW()),
  ('Titanium', NOW(), NOW());


CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES order(id) ON DELETE CASCADE,
    jewel_id INTEGER REFERENCES jewels(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);


CREATE TABLE "role" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  activity_type VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NOT NULL,
  customer_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);


CREATE TABLE "role" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Table des bijoux
-- Création de la table jewel
CREATE TABLE "jewel" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price_ttc" DECIMAL(10, 2),
    "tva" DECIMAL(5, 2) DEFAULT 20.00,
    "price_ht" DECIMAL(10, 2), -- calculé automatiquement
    "taille" VARCHAR(50),      -- exemple : "16 cm", "M", etc.
    "poids" DECIMAL(6, 2),     -- en grammes
    "matiere" VARCHAR(50),     -- exemple : "or", "plaqué or", "argent"
    "carat" INTEGER,           -- exemple : 18, 24
    "image" TEXT,
    "stock" INTEGER DEFAULT 0,
    "category_id" INTEGER REFERENCES "category"("id")
    -- Ajoute la date d'ajout
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- Ajoute une colonne pour la popularité (par exemple via un nombre de vues ou de commandes)
    "popularity_score" INTEGER DEFAULT 0;
    "type_id"

    ALTER TABLE "jewel" ADD COLUMN "images" JSON;

);

<<<<<<< HEAD
CREATE TABLE types (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL
);
 
CREATE TABLE jewel_images (
    "id" SERIAL PRIMARY KEY,
    "image_url" TEXT NOT NULL,
    "jewel_id" INTEGER REFERENCES "jewel"("id") ON DELETE CASCADE
);


DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

=======
>>>>>>> c36308dee78a20a9c13e68d7addb716051f8a371

-- 3. Table des clients
CREATE TABLE "customer" (
    "id" SERIAL PRIMARY KEY,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(20)
);

-- 4. Table des commandes
CREATE TABLE "order" (
    "id" SERIAL PRIMARY KEY,
    "order_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'en attente',
    "total" DECIMAL(10,2),
    "customer_id" INTEGER REFERENCES "customer"("id")
);

-- 5. Table de liaison entre commandes et bijoux
CREATE TABLE "order_has_jewel" (
    "order_id" INTEGER REFERENCES "order"("id"),
    "jewel_id" INTEGER REFERENCES "jewel"("id"),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY ("order_id", "jewel_id")
);


CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    jewel_id INTEGER REFERENCES jewels(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);



-- 6. Table des paiements
CREATE TABLE "payment" (
    "id" SERIAL PRIMARY KEY,
    "payment_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(10, 2) NOT NULL,
    "method" VARCHAR(50),
    "status" VARCHAR(50) DEFAULT 'en attente',
    "order_id" INTEGER REFERENCES "order"("id")
);

-- 7. Insertion des catégories de bijoux

-- fonction pour calculer automatiquement le prix HT;
CREATE OR REPLACE FUNCTION calcul_price_ht()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price_ttc IS NOT NULL AND NEW.tva IS NOT NULL THEN
    NEW.price_ht := ROUND(NEW.price_ttc / (1 + NEW.tva / 100), 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
<<<<<<< HEAD
=======

CREATE TRIGGER trg_calcul_price_ht
BEFORE INSERT OR UPDATE ON "jewel"
FOR EACH ROW
EXECUTE FUNCTION calcul_price_ht();

>>>>>>> c36308dee78a20a9c13e68d7addb716051f8a371

CREATE TRIGGER trg_calcul_price_ht
BEFORE INSERT OR UPDATE ON "jewel"
FOR EACH ROW
EXECUTE FUNCTION calcul_price_ht();


-- Créer la table des favoris
CREATE TABLE IF NOT EXISTS "favorites" (
    "customer_id" INTEGER REFERENCES "customer"("id") ON DELETE CASCADE,
    "jewel_id" INTEGER REFERENCES "jewel"("id") ON DELETE CASCADE,
    "added_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("customer_id", "jewel_id")
);

-- Pour suivre la fréquentation
CREATE TABLE site_visits (
    "visited_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50),
    "path" TEXT
);

-- Pour suivre les vues des produits
CREATE TABLE jewel_views (
    "jewel_id" INTEGER REFERENCES jewel(id) ON DELETE CASCADE,
    "viewed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50)
);



-- Créer la table du panier
CREATE TABLE IF NOT EXISTS "cart" (
    "id" SERIAL PRIMARY KEY,
    "customer_id" INTEGER REFERENCES "customer"("id") ON DELETE CASCADE,
    "jewel_id" INTEGER REFERENCES "jewel"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "added_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS "idx_cart_customer" ON "cart" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_favorites_customer" ON "favorites" ("customer_id");



-- 3. Table des clients
CREATE TABLE "customer" (
    "id" SERIAL PRIMARY KEY,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(20)
);

COMMIT; 