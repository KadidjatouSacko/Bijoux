import { Jewel } from "../models/Jewel.js";
import { Category } from "../models/Category.js";  // Si tu veux récupérer les catégories
import { Material } from "../models/Material.js";  // Si tu veux ajouter la matière dans la base de données

// Afficher la page d'ajout de bijou (avec les catégories disponibles)
export const jewelControlleur ={

 async showAddJewelForm (req, res) {
  try {
    // Récupérer toutes les catégories disponibles pour les afficher dans le formulaire
    const categories = await Category.findAll();

    // Passer les catégories dans la vue (si tu utilises un moteur de template comme EJS)
    res.render("addjewel", { categories });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).send("Erreur interne du serveur.");
  }
},

// Ajouter un bijou à la base de données
async addJewel (req, res)  {
  try {
    const { name, description, taille, poids, matiere, carat, price_ttc, tva, stock, category_id, image } = req.body;

    // Calcul du prix HT à partir du prix TTC et du taux de TVA
    const price_ht = (price_ttc / (1 + tva / 100)).toFixed(2);

    // Créer un nouveau bijou dans la base de données
    const jewel = await Jewel.create({
      name,
      description,
      taille,
      poids,
      matiere,
      carat,
      price: price_ht,  // Utilisation du prix HT calculé
      price_ttc,
      tva,
      stock,
      category_id,
      image,  // Tu devras probablement gérer le traitement d'image en fonction de ce que tu souhaites (upload, etc.)
    });

    res.status(201).send("Bijou ajouté avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout du bijou:", error);
    res.status(500).send("Erreur interne du serveur.");
  }
},

// Ajouter une nouvelle catégorie
async addNewCategory  (req, res)  {
  try {
    const { newCategory } = req.body;
    const category = await Category.create({ name: newCategory });
    res.status(201).json({ message: "Nouvelle catégorie ajoutée avec succès.", category });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la catégorie:", error);
    res.status(500).send("Erreur interne du serveur.");
  }
},

// Ajouter une nouvelle matière
async addNewMaterial  (req, res) {
  try {
    const { newMaterial } = req.body;
    const material = await Material.create({ name: newMaterial });
    res.status(201).json({ message: "Nouvelle matière ajoutée avec succès.", material });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la matière:", error);
    res.status(500).send("Erreur interne du serveur.");
  }
}

}
