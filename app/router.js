import { Router } from "express";
import { mainControlleur } from "./controlleurs/mainControlleur.js";
import { baguesControlleur } from "./controlleurs/baguesControlleur.js";
import { braceletsControlleur } from "./controlleurs/braceletsControlleur.js";


export const router = Router();

// Route pour la page d'accueil
router.get("/", mainControlleur.homePage);

router.get("/bagues", baguesControlleur.GetAll)

router.get("/bracelets",braceletsControlleur.GetAll)


