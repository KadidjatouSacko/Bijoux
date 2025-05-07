<<<<<<< HEAD
import { Jewel, Category } from '../models/associations.js'; // Assure-toi que ces modèles existent et sont correctement configurés
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import { Type } from '../models/TypeModel.js';
const { Op } = Sequelize;
import {sequelize} from '../models/sequelize-client.js';
import { JewelView } from '../models/jewelViewModel.js';
import {QueryTypes} from 'sequelize'


import { Material } from '../models/MaterialModel.js';
import { JewelImage } from '../models/jewelImage.js';
import { types } from 'util';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const jewelControlleur = {
  /**
   * Affiche les colliers
   */
  async showCollars(req, res) {
    try {
      const category = await Category.findOne({ where: { name: 'Collier' } });

      if (!category) {
        return res.render('bagues', {
          title: 'Nos Colliers',
          error: 'Aucune catégorie "Collier" trouvée'
        });
      }

      const collars = await Jewel.findAll({
        where: { category_id: category.id },
        order: [['name', 'ASC']]
      });

      res.render('collars', {
        title: 'Nos Colliers',
        jewels: collars
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des colliers:', error);
      return res.render('collars', {
        title: 'Nos Colliers',
        error: 'Une erreur est survenue lors de l\'affichage des colliers'
      });
    }
  },

  // Méthode pour afficher les bracelets
  async showBracelets(req, res) {
    try {
      const category = await Category.findOne({ where: { name: 'Bracelet' } });

      if (!category) {
        return res.render('bracelets', {
          title: 'Nos Bracelets',
          error: 'Aucune catégorie "Bracelet" trouvée'
        });
      }

      const bracelets = await Jewel.findAll({
        where: { category_id: category.id },
        order: [['name', 'ASC']]
      });

      res.render('bracelets', {
        title: 'Nos Bracelets',
        jewels: bracelets
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des bracelets:', error);
      return res.render('bracelets', {
        title: 'Nos Bracelets',
        error: 'Une erreur est survenue lors de l\'affichage des bracelets'
      });
    }
  },

  // Méthode pour afficher les bagues
  async showRings(req, res) {
   
      try {
        const rings = await Jewel.findAll({
          where: { category_id: 1 },
          order: [['name', 'ASC']]
        });
    
        res.render('bagues', {
          title: 'Nos Bagues',
          rings: rings  
        });
      } catch (error) {
        console.error('Erreur lors de l\'affichage des bagues:', error);
        return res.render('bagues', {
          title: 'Nos Bagues',
          rings: [],    
          error: 'Une erreur est survenue lors de l\'affichage des bagues'
        });
      }
    },
      
  

  /**
   * Affiche le formulaire d'ajout de bijou
   */
  async showAddJewelForm  (req, res) {
    try {
      // Essaie une requête simple pour vérifier la connexion
      const categories = await Category.findAll();
      // console.log('Catégories récupérées:', categories);  // Affiche les résultats dans la console
  
      const materials = await Material.findAll()

      const types = await Type.findAll()
      // console.log('Matériaux récupérés:', materials);
      res.render('addjewel', { categories, materials, types });
    } catch (err) {
      console.error('Erreur lors de la récupération des catégories:', err);  // Affiche l'erreur exacte
      res.status(500).send('Erreur serveur');
    }
  },

  async addJewel(req, res) {
    try {
      const {
        name,
        category_id,
        description,
        taille,
        poids,
        matiere,
        carat,
        price_ttc,
        tva,
        stock,
        image,
        additionalImages
      } = req.body;
  
      if (!name || !category_id || !price_ttc || !matiere || !image) {
        const categories = await Category.findAll();
        const materials = await Material.findAll();
        
        return res.render('addjewel', {
          title: 'Ajouter un bijou',
          error: 'Veuillez remplir tous les champs obligatoires et ajouter une image',
          categories,
          materials
        });
      }
  
      // Génère un slug unique à partir du nom
      const baseSlug = slugify(name, { lower: true, strict: true });
      let slug = baseSlug;
      let count = 1;
      
      while (await Jewel.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
  
      // Tableau pour stocker tous les noms de fichiers d'images
      let allImageFiles = [];
  
      // Traitement de l'image principale
      let imageFileName = null;
      if (image) {
        if (image.startsWith('data:image')) {
          const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          const uploadDir = path.join(process.cwd(), 'public/uploads/jewels');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          imageFileName = `${slug}-main-${Date.now()}.jpg`;
          const uploadPath = path.join(uploadDir, imageFileName);
          fs.writeFileSync(uploadPath, buffer);
          
          // Ajouter l'image principale à la liste de toutes les images
          allImageFiles.push(imageFileName);
        } else {
          imageFileName = image;
          allImageFiles.push(imageFileName);
        }
      }
  
      // Traitement des images additionnelles
      let additionalImagesArray = [];
      
      if (additionalImages) {
        try {
          if (typeof additionalImages === 'string') {
            additionalImagesArray = JSON.parse(additionalImages);
          } else {
            additionalImagesArray = additionalImages;
          }
        } catch (e) {
          console.error('Erreur lors du parsing des images additionnelles:', e);
        }
  
        if (Array.isArray(additionalImagesArray)) {
          for (let i = 0; i < additionalImagesArray.length; i++) {
            const imgData = additionalImagesArray[i];
            if (imgData && imgData.startsWith('data:image')) {
              const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              
              const uploadDir = path.join(process.cwd(), 'public/uploads/jewels');
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              
              const additionalImageFileName = `${slug}-additional-${i}-${Date.now()}.jpg`;
              const uploadPath = path.join(uploadDir, additionalImageFileName);
              fs.writeFileSync(uploadPath, buffer);
              
              // Ajouter l'image additionnelle à la liste
              allImageFiles.push(additionalImageFileName);
            }
          }
        }
      }
  
      // Créer le bijou avec l'image principale
      const newJewel = await Jewel.create({
        name,
        description: description || null,
        price_ttc: parseFloat(price_ttc),
        tva: parseFloat(tva || 20),
        taille: taille || null,
        poids: poids ? parseFloat(poids) : null,
        matiere,
        carat: carat ? parseInt(carat) : null,
        image: imageFileName, // Image principale dans la table jewel
        stock: parseInt(stock || 0),
        category_id: parseInt(category_id),
        slug
        // Retirer 'types' car il n'est pas défini dans le code d'origine
      });
  
      // Insérer toutes les images (principale + additionnelles) dans la table jewel_images
      for (const imageFile of allImageFiles) {
        await JewelImage.create({
          image_url: imageFile,
          jewel_id: newJewel.id
        });
      }
      
      console.log('Bijou ajouté avec succès:', newJewel.id);
      res.redirect(`/bijoux/${newJewel.slug}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bijou:', error);
      res.status(500).render('error', { message: "Erreur serveur lors de l'ajout du bijou." });
    }
  },

  /**
   * Affiche les détails d'un bijou
   */
  async showJewelDetails(req, res) {
    try {
      const { slug } = req.params;
      
      // Récupérer le bijou avec sa catégorie et ses images
      const jewel = await Jewel.findOne({
        where: { slug },
        include: [
          { model: Category },
          { model: JewelImage, as: 'images', required: false },
          // Inclure d'autres relations si nécessaire
        ],
        logging: console.log // Pour voir la requête SQL exacte qui est exécutée
      });
      

      // Logs de débogage
    if (jewel) {
      console.log("Bijou trouvé, ID:", jewel.id);
      
      // Vérifier la propriété images
      if (jewel.images) {
        console.log("Images trouvées:", jewel.images.length);
        jewel.images.forEach((img, idx) => {
          console.log(`Image ${idx + 1}:`, img.image_url);
        });
      } else {
        console.log("La propriété 'images' est undefined");
      }
      
      // Afficher l'objet brut pour analyse
      console.log("Objet jewel brut:", JSON.stringify(jewel, null, 2));
    } else {
      console.log("Aucun bijou trouvé avec ce slug");
    }
      
      if (!jewel) {
        return res.status(404).render('error', {
          message: "Ce bijou n'existe pas ou a été supprimé"
        });
      }
      
      // Récupérer les détails spécifiques du bijou (caractéristiques)
      const details = [];
      
      // Ajouter les détails si disponibles
      if (jewel.taille) details.push({ label: 'Taille', value: jewel.taille });
      if (jewel.poids) details.push({ label: 'Poids', value: `${jewel.poids} g` });
      if (jewel.matiere) details.push({ label: 'Matière', value: jewel.matiere });
      if (jewel.carat) details.push({ label: 'Carat', value: jewel.carat });
      
      // Ajouter ces détails à l'objet bijou
      jewel.details = details;
      
      // Récupérer les bijoux similaires (même catégorie)
      const similarJewels = await Jewel.findAll({
        where: {
          category_id: jewel.category_id,
          id: { [Op.ne]: jewel.id } // Exclure le bijou actuel
        },
        limit: 4
      });
      
      // Transformation des données pour plus de clarté dans le template
      // S'assurer que tous les bijoux ont leur image principale définie
      if (jewel.images && jewel.images.length > 0) {
        // Si nous avons des images dans la table jewel_images, les utiliser toutes
        // L'image principale est déjà définie dans jewel.image
      } else if (jewel.image) {
        // Si pas d'images dans jewel_images mais une image principale existe
        // Créer un tableau images factice pour la cohérence
        jewel.images = [{ image_url: jewel.image }];
      }
      
      // Préparer la même structure pour les bijoux similaires
      similarJewels.forEach(sJewel => {
        if (!sJewel.image) {
          sJewel.image = 'no-image.jpg'; // Image par défaut
        }
      });
      
      res.render('detailjewel', {
        jewel,
        similarJewels
      });
    } catch (error) {
      console.error("Erreur lors de l'affichage du bijou:", error);
      res.status(500).render('error', {
        message: "Une erreur est survenue lors du chargement du bijou"
      });
    }
  },
  

  // creer une nouvelle catégorie
  async addCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Le nom de la catégorie est requis' });
      }

      // Vérification si la catégorie existe déjà
      const existingCategory = await executeQuery('SELECT id FROM category WHERE LOWER(name) = LOWER($1)', [name.trim()]);

      if (existingCategory.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cette catégorie existe déjà',
          category: existingCategory.rows[0]
        });
      }

      // Ajout de la nouvelle catégorie
      const result = await executeQuery(
        'INSERT INTO category (name) VALUES ($1) RETURNING id, name',
        [name.trim()]
      );

      res.json({
        success: true,
        message: 'Catégorie ajoutée avec succès',
        category: result.rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de la catégorie' });
    }
  }, 

  async addType(req, res) {
    try {
      const { name, categoryId } = req.body;

      if (!name || !categoryId) {
        return res.status(400).json({ message: 'Nom du type ou catégorie manquant' });
      }

      const newType = await Type.create({
        name,
        category_id: categoryId
      });

      res.status(201).json(newType);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du type:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

 
  async editJewelForm(req, res) {
    try {
      const { slug } = req.params;
      
      // Récupérer le bijou avec ses images
      const jewel = await Jewel.findOne({
        where: { slug },
        include: [
          { model: JewelImage, as: 'images' }
        ]
      });
      
      if (!jewel) {
        return res.status(404).render('error', { 
          message: "Ce bijou n'existe pas ou a été supprimé" 
        });
      }
      
      // Récupérer les catégories et matières pour le formulaire
      const categories = await Category.findAll();
      const materials = await Material.findAll();
      
      res.render('edit-jewel', {
        title: `Modifier ${jewel.name}`,
        jewel,
        categories,
        materials
      });
    } catch (error) {
      console.error("Erreur lors du chargement du formulaire d'édition:", error);
      res.status(500).render('error', { 
        message: "Une erreur est survenue lors du chargement du formulaire d'édition" 
      });
    }
  },
  
  // Méthode pour traiter la mise à jour d'un bijou
  async updateJewel(req, res) {
    try {
      const { slug } = req.params;
      const {
        name,
        category_id,
        description,
        taille,
        poids,
        matiere,
        carat,
        price_ttc,
        tva,
        stock,
        image,
        additionalImages,
        keepExistingImages
      } = req.body;
      
      // Trouver le bijou à modifier
      const jewel = await Jewel.findOne({
        where: { slug },
        include: [
          { model: JewelImage, as: 'images' }
        ]
      });
      
      if (!jewel) {
        return res.status(404).render('error', { 
          message: "Ce bijou n'existe pas ou a été supprimé" 
        });
      }
      
      // Générer un nouveau slug si le nom a changé
      let newSlug = slug;
      if (name !== jewel.name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        newSlug = baseSlug;
        let count = 1;
        
        while (await Jewel.findOne({ where: { slug: newSlug, id: { [Op.ne]: jewel.id } } })) {
          newSlug = `${baseSlug}-${count}`;
          count++;
        }
      }
      
      // Traitement de l'image principale si modifiée
      let imageFileName = jewel.image;
      if (image && image !== jewel.image && image.startsWith('data:image')) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        const uploadDir = path.join(process.cwd(), 'public/uploads/jewels');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        imageFileName = `${newSlug}-${Date.now()}.jpg`;
        const uploadPath = path.join(uploadDir, imageFileName);
        fs.writeFileSync(uploadPath, buffer);
      }
      
      // Mettre à jour les données du bijou
      await jewel.update({
        name,
        description: description || null,
        price_ttc: parseFloat(price_ttc),
        tva: parseFloat(tva || 20),
        taille: taille || null,
        poids: poids ? parseFloat(poids) : null,
        matiere,
        carat: carat ? parseInt(carat) : null,
        image: imageFileName,
        stock: parseInt(stock || 0),
        category_id: parseInt(category_id),
        slug: newSlug
      });
      
      // Gestion des images
      // Si l'utilisateur ne veut pas conserver les images existantes
      if (!keepExistingImages) {
        // Supprimer toutes les images existantes
        await JewelImage.destroy({
          where: { jewel_id: jewel.id }
        });
        
        // Ajouter l'image principale à la table des images
        await JewelImage.create({
          image_url: imageFileName,
          jewel_id: jewel.id
        });
      }
      
      // Traitement des nouvelles images additionnelles
      if (additionalImages) {
        let imagesArray = [];
        try {
          if (typeof additionalImages === 'string') {
            imagesArray = JSON.parse(additionalImages);
          } else {
            imagesArray = additionalImages;
          }
        } catch (e) {
          console.error('Erreur lors du parsing des images additionnelles:', e);
        }
        
        if (Array.isArray(imagesArray)) {
          for (let i = 0; i < imagesArray.length; i++) {
            const imgData = imagesArray[i];
            if (imgData && imgData.startsWith('data:image')) {
              const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              
              const uploadDir = path.join(process.cwd(), 'public/uploads/jewels');
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              
              const additionalImageFileName = `${newSlug}-additional-${i}-${Date.now()}.jpg`;
              const uploadPath = path.join(uploadDir, additionalImageFileName);
              fs.writeFileSync(uploadPath, buffer);
              
              // Ajouter l'image additionnelle à la table des images
              await JewelImage.create({
                image_url: additionalImageFileName,
                jewel_id: jewel.id
              });
            }
          }
        }
      }
      
      res.redirect(`/bijoux/${newSlug}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bijou:", error);
      res.status(500).render('error', { 
        message: "Une erreur est survenue lors de la modification du bijou" 
      });
    }
  },
  
  // Méthode pour supprimer un bijou
  async deleteJewel(req, res) {
    try {
      const { slug } = req.params;
      
      // Trouver le bijou à supprimer
      const jewel = await Jewel.findOne({ where: { slug } });
      
      if (!jewel) {
        return res.status(404).render('error', { 
          message: "Ce bijou n'existe pas ou a déjà été supprimé" 
        });
      }
      
      // Supprimer le bijou (les images seront supprimées en cascade grâce à onDelete: 'CASCADE')
      await jewel.destroy();
      
      // Rediriger vers la liste des bijoux avec message de succès
      req.flash('success', `Le bijou ${jewel.name} a été supprimé avec succès`);
      res.redirect('/');
    } catch (error) {
      console.error("Erreur lors de la suppression du bijou:", error);
      res.status(500).render('error', { 
        message: "Une erreur est survenue lors de la suppression du bijou" 
      });
    }
  },

};
=======
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
>>>>>>> c36308dee78a20a9c13e68d7addb716051f8a371
