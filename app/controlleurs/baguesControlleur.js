import { Jewel, Category } from '../models/associations.js';
import { Type } from '../models/TypeModel.js';
import { Material } from '../models/MaterialModel.js';
import Sequelize from 'sequelize';

const { Op } = Sequelize;

export const baguesControlleur = {
  // Méthode pour afficher les bagues
  async showRings(req, res) {
    try {
      const { matiere, type, prix, carat, taille, sort } = req.query;

      // Définir la clause where pour les bijoux
      const whereClause = {};
      
      // Récupérer d'abord l'ID de la catégorie Bagues
      const baguesCategory = await Category.findOne({ where: { name: 'Bagues' } });
      
      if (!baguesCategory) {
        throw new Error('Catégorie Bagues non trouvée');
      }
      
      // Ajouter la condition de catégorie directement dans whereClause
      whereClause.category_id = baguesCategory.id;

      // Configuration des includes sans restriction stricte
      const include = [
        { model: Material },
        { model: Type }
      ];

      // Appliquer les filtres demandés
      if (matiere) {
        whereClause.material_id = Array.isArray(matiere) ? { [Op.in]: matiere } : matiere;
      }

      if (type) {
        whereClause.type_id = Array.isArray(type) ? { [Op.in]: type } : type;
      }

      if (taille) whereClause.taille = taille;
      if (carat) whereClause.carat = carat;

      if (prix) {
        const prixTab = Array.isArray(prix) ? prix : [prix];
        whereClause[Op.or] = prixTab.map(val => {
          if (val === '500+') return { price_ttc: { [Op.gte]: 500 } };
          const [min, max] = val.split('-');
          return { price_ttc: { [Op.between]: [parseFloat(min), parseFloat(max)] } };
        });
      }

      // Définir l'ordre de tri
      let order = [['created_at', 'DESC']];
      if (sort === 'price_asc') order = [['price_ttc', 'ASC']];
      else if (sort === 'price_desc') order = [['price_ttc', 'DESC']];
      else if (sort === 'popularity') order = [['popularity_score', 'DESC']];

      // Exécuter les requêtes en parallèle
      const [jewels, materials, types] = await Promise.all([
        Jewel.findAll({ 
          where: whereClause, 
          include, 
          order 
        }),
        Material.findAll(),
        Type.findAll({ where: { category_id: baguesCategory.id } })
      ]);

      // Log les données récupérées pour déboguer
      console.log(`Nombre de bijoux trouvés: ${jewels.length}`);

      // Envoi des données dans la vue
      res.render('bagues', {
        jewels,
        filters: req.query,
        materials,
        types
      });
    } catch (error) {
      console.error('Erreur dans showRings:', error);
      res.status(500).send('Erreur serveur lors de l\'affichage des bagues.');
    }
  },
}