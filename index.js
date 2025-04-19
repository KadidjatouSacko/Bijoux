import "dotenv/config";
import express from "express";
// import session from "express-session";
// import cookieParser from "cookie-parser";
import { router } from "./app/router.js";
// import { authMiddleware } from "./app/middlewares/authMiddleware.js";
// import { sessionMiddleware } from "./app/middlewares/sessionMiddleware.js"; 

import { sequelize } from './sequelize-client.js'; // L'instance Sequelize
import { Jewel } from './models/jewel.js'; // Ton modèle Jewel
import { Category } from './models/category.js'; // Ton modèle Category
import { Order } from './models/order.js'; // Ton modèle Order
import { Customer } from './models/customer.js'; // Ton modèle Customer
import { OrderHasJewel } from './models/orderHasJewel.js'; // La table de liaison

// Si tu utilises des associations, assure-toi de les importer aussi
import './associations.js'; // Si tu as un fichier où tu définis toutes les associations


const app = express();

// app.use(sessionMiddleware);

// app.use(cookieParser()); // Permet d’analyser les cookies envoyés par le client


// app.use(session({
//     secret: "monSuperSecret",  // Clé secrète pour signer les cookies (change-la en prod !)
//     resave: false,             // Empêche de sauvegarder la session si elle n'a pas changé
//     saveUninitialized: true,   // Sauvegarde une session même vide (utile pour les visiteurs)
//     cookie: {
//         httpOnly: true,        // Empêche l’accès aux cookies via JavaScript (protège contre XSS)
//         secure: process.env.NODE_ENV === "production", // Active uniquement en HTTPS
//         maxAge: 1000 * 60 * 60 * 24, // Expire après 24h
//         sameSite: "strict"     // Empêche les attaques CSRF (Cross-Site Request Forgery)
//     }
// }));


// app.use(session({
//   secret: 'monSecretSuperSecurisé',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Doit être `true` en production avec HTTPS
// }));

app.set("view engine", "ejs");

app.set("views", "./app/views");

app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Test de la connexion et synchronisation avec la base de données
sequelize.authenticate()
    .then(() => {
        console.log("Connexion à la base de données réussie.");
        return sequelize.sync({ alter: true }); // Met à jour la base sans supprimer les tables
    })
    .then(() => {
        console.log("Base de données synchronisée avec succès !");
    })
    .catch((error) => {
        console.error("Erreur lors de la connexion ou de la synchronisation :", error);
    });
// app.use(authMiddleware);
app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);    
})