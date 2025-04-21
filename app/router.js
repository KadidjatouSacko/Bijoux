import { Router } from "express";
import { mainControlleur } from "./controlleurs/mainControlleur.js";
import { baguesControlleur } from "./controlleurs/jewelControlleur.js";
import { braceletsControlleur } from "./controlleurs/braceletsControlleur.js";


export const router = Router();

// Route pour la page d'accueil
router.get("/", mainControlleur.homePage);

router.get("/bagues", baguesControlleur.GetAll)

router.get("/bracelets",braceletsControlleur.GetAll)

// Route pour afficher le formulaire d'ajout de bijou
router.get("/ajouter-bijou", showAddJewelForm);

// Route pour ajouter un bijou dans la base de données
router.post("/ajouter-bijou", addJewel);

// Route pour ajouter une nouvelle catégorie
router.post("/ajouter-categorie", addNewCategory);

// Route pour ajouter une nouvelle matière
router.post("/ajouter-matiere", addNewMaterial);

export default router;

