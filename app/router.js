import { Router } from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import multer from "multer";
const storagejewel = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../public/uploads/jewels'));
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      cb(null, uniqueName);
    }
  });
  
const upload = multer({ storage: storagejewel })

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../../public/uploads/jewels'));
//   },
  // filename: (req, file, cb) => {
  //   const uniqueName = Date.now() + '-' + file.originalname;
  //   cb(null, uniqueName);
  // }
// });

import { mainControlleur } from "./controlleurs/mainControlleur.js";
import { jewelControlleur } from "./controlleurs/jewelControlleur.js";
import { braceletsControlleur } from "./controlleurs/braceletsControlleur.js";
import { baguesControlleur } from "./controlleurs/baguesControlleur.js";
import {materialControlleur} from './controlleurs/materialControlleur.js';
import {loginLimiter, authController } from "./controlleurs/authControlleur.js";
import { isAdmin, isAuthenticated } from './middleware/authMiddleware.js';
import { cartController } from "./controlleurs/cartControlleur.js";
import { favoritesController } from "./controlleurs/favoritesControlleur.js";
import { adminStatsController } from "./controlleurs/adminStatsControlleur.js";

export const router = Router();

// Route pour la page d'accueil
router.get("/", mainControlleur.homePage);



// VOIR LES BIJOUX : 

// Route pour afficher les colliers
router.get('/bijoux/colliers', jewelControlleur.showCollars);

// Route pour afficher les bracelets
router.get('/bijoux/bracelets', braceletsControlleur.showBracelets);

// Route pour afficher les bagues
router.get('/bijoux/bagues', baguesControlleur.showRings);

//SUPRIMER UN BIJOUX :
router.post('/bijoux/:slug/supprimer', jewelControlleur.deleteJewel)

//route detail page
router.get("/bijoux/:slug", jewelControlleur.showJewelDetails)






// ADMINISTRATEUR :

// Routes d'authentification
router.get('/connexion-inscription', authController.LoginPage);
router.post('/connexion', loginLimiter, authController.login);
router.get('/deconnexion', authController.logout);
router.post('/inscription', authController.signUp);

// Routes de profil utilisateur
router.get('/profil', isAuthenticated, authController.renderCustomerProfile);
router.get('/profil/modifier', isAuthenticated, authController.renderEditProfilePage);
router.post('/profil/modifier', isAuthenticated, authController.updateUserProfile);

// Routes de suppression de compte
router.get('/profil/supprimer', isAuthenticated, authController.showDeleteConfirmation);
router.post('/profil/supprimer', isAuthenticated, authController.deleteAccount);

// Routes de mot de passe oublié
router.get('/mot-de-passe-oublie', authController.forgotPasswordPage);
router.post('/mot-de-passe-oublie', authController.processForgotPassword);



// PANIER
router.get('/panier', cartController.renderCart);
// Ajouter un bijou au panier
router.post('/panier/ajouter', cartController.addToCart);
// router.post('/panier/ajouter', braceletsControlleur.addToCart);
// Mettre à jour la quantité d'un article
router.post('/panier/modifier', cartController.updateCart);
// Supprimer un article du panier
router.post('/panier/supprimer/:itemId', cartController.removeItem);
// Vider le panier
router.post('/panier/vider', cartController.clearCart);



//FAVORIS 
 // Afficher les favoris
router.get('/favoris', favoritesController.renderFavorites);
// Ajouter un bijou aux favoris
router.post('/favoris/ajouter', favoritesController.addToFavorites);
// Supprimer un bijou des favoris
router.post('/favoris/supprimer/:jewelId', favoritesController.removeFromFavorites);


router.get('/admin/stats',  adminStatsController.dashboard);
router.get('/admin/suivi-client',  adminStatsController.getClientStats)

// Route pour afficher le formulaire
router.get("/ajouter-bijou", jewelControlleur.showAddJewelForm);

// Route POST pour ajouter un bijou (avec image)
// Route pour ajouter un bijou dans la base de données
router.post("/ajouter-bijou",  upload.array('images', 5), jewelControlleur.addJewel);
router.get('/bijoux/:slug', jewelControlleur.addJewel)
// Route pour ajouter une nouvelle catégorie
router.post("/ajouter-categorie", jewelControlleur.addCategory);
router.post('/ajouter-type', jewelControlleur.addType);

// Route pour le dashboard administrateur
router.get('/admin/stats', adminStatsController.dashboard);


router.get("/produits", adminStatsController.ShowPageProducts)
// Route pour les statistiques personnelles d'un client connecté
router.get('/mon-compte/mes-statistiques', adminStatsController.getClientStats);

// Route pour lister tous les bijoux (ex: en backoffice avec filtres)
router.get('/admin/bijoux', adminStatsController.findAll);

router.get('/admin/ajouter-bijou', adminStatsController.create)

router.get("/commandes", adminStatsController.ShowPageOrders)




export default router;
