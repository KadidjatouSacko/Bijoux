import "dotenv/config";
import express from "express";
// import session from "express-session";
// import cookieParser from "cookie-parser";
import { router } from "./app/router.js";
// import { authMiddleware } from "./app/middlewares/authMiddleware.js";
// import { sessionMiddleware } from "./app/middlewares/sessionMiddleware.js"; 



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

// app.use(authMiddleware);
app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);    
})