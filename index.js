import "dotenv/config";
import express from "express";
import { Sequelize } from "sequelize";
import { QueryTypes } from 'sequelize';
import session from 'express-session';
import multer from 'multer';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import { router } from "./app/router.js"; // Importer les routes
import { SiteVisit } from "./app/models/siteVisiteModel.js";

import { sequelize } from './app/models/sequelize-client.js'; // L'instance Sequelize
import './app/models/associations.js'; // Si tu as un fichier où tu définis toutes les associations
  


// Ce middleware permet de prendre en charge _method dans les requêtes POST

const app = express();

// Middleware pour parser les données venant du client
app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Middleware pour analyser les données JSON et URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Si tu utilises multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: './public/uploads/jewels',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const slug = slugify(req.body.name, { lower: true });
    cb(null, `${slug}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

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

 
    
    // Configuration de la session
    app.use(session({
      
      secret: 'Momo_le_mec_du_93_le_mec_de_Penda',
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: process.env.NODE_ENV === 'production', // true en production si HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
      }
    }));
    
    app.use((req, res, next) => {
      res.locals.user = req.session.user || null; // 'user' peut venir de la session ou de la base de données
      next();
  });
  
// Middleware pour rendre le panier accessible dans tous les templates
app.use((req, res, next) => {
  // Assurer que le panier existe
  if (!req.session.cart) {
    req.session.cart = { items: [], totalPrice: 0 };
  }
  
  // Rendre le panier accessible dans les templates
  res.locals.cartItemCount = req.session.cart.items.length;
  
  next();
});

app.use(flash());

// Permet d'accéder aux messages flash dans toutes les vues EJS
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(async (req, res, next) => {
  try {
    // Enregistrer une visite
    await sequelize.query(
      `INSERT INTO site_visits (visited_at, ip_address, path) VALUES (CURRENT_TIMESTAMP, :ip, :path)`,
      {
        replacements: { ip: req.ip, path: req.path },
        type: QueryTypes.INSERT
      }
    );
    next();
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la visite', error);
    next();
  }
});



app.use(async (req, res, next) => {
    try {
        await SiteVisit.create(); // enregistre la visite automatiquement
    } catch (err) {
        console.error('Erreur enregistrement visite :', err);
    }
    next();
});

// Utilisation des routes importées depuis router.js
app.use(router);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);    
});
