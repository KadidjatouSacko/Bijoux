BEGIN;

-- Suppression des tables si elles existent déjà (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "order_has_jewel" CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS "jewel" CASCADE;
DROP TABLE IF EXISTS "customer" CASCADE;
DROP TABLE IF EXISTS "role" CASCADE;
DROP TABLE IF EXISTS "category" CASCADE;

-- 1. Table des catégories (Bagues, Bracelets, etc.)
CREATE TABLE "category" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL
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
);


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

CREATE TRIGGER trg_calcul_price_ht
BEFORE INSERT OR UPDATE ON "jewel"
FOR EACH ROW
EXECUTE FUNCTION calcul_price_ht();


COMMIT;
