
INSERT INTO "category" ("name") VALUES
('Bagues'),
('Bracelets'),
('Colliers'),
('Boucles d''oreilles'),
('Promotions');


INSERT INTO "jewel" (name, description, price_ttc, tva, image, stock, category_id)
VALUES ('Bracelet or rose', 'Superbe bracelet', 120.00, 20.00, 'bracelet.jpg', 10, 1);

INSERT INTO "role" (name) 
VALUES ('client'), ('administrateur');
