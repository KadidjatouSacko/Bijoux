import { Category } from '../models/categoryModel.js';
import { Jewel } from '../models/jewelModel.js';
import { Type } from '../models/TypeModel.js';
import { Sequelize, Op } from 'sequelize';

export const braceletsControlleur = {
  async showBracelets(req, res) {
    try {
      const category = await Category.findOne({ where: { name: 'Bracelets' } });
      if (!category) return res.status(404).send('Catégorie "Bracelets" non trouvée.');

      const where = { category_id: category.id };
      const filters = {}; // Pour stocker les valeurs sélectionnées côté front

      if (req.query.matiere) {
        where.matiere = req.query.matiere;
        filters.matiere = req.query.matiere;
      }

      if (req.query.minPrice || req.query.maxPrice) {
        where.price_ttc = {};
        if (req.query.minPrice) {
          where.price_ttc[Op.gte] = parseFloat(req.query.minPrice);
          filters.minPrice = req.query.minPrice;
        }
        if (req.query.maxPrice) {
          where.price_ttc[Op.lte] = parseFloat(req.query.maxPrice);
          filters.maxPrice = req.query.maxPrice;
        }
      }

      if (req.query.style) {
        where.type = req.query.style;
        filters.style = req.query.style;
      }

      const limit = 12;
      const currentPage = parseInt(req.query.page) || 1;
      const offset = (currentPage - 1) * limit;

      const { count, rows: bracelets } = await Jewel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
      });

      const totalPages = Math.ceil(count / limit);

      const rawMaterials = await Jewel.findAll({
        attributes: [[Sequelize.literal('DISTINCT "matiere"'), 'matiere']],
        where: { category_id: category.id }
      });
      const materials = rawMaterials.map(r => r.get('matiere'));

      const rawTypes = await Type.findAll({
        where: { category_id: category.id }
      });
      const styles = rawTypes.map(t => t.name);

      res.render('bracelets', {
        bracelets,
        filters,
        materials,
        styles,
        currentPage,
        totalPages,
        sizes: [], // à remplir si besoin
        carats: [], // idem
        types: [] // ou rawTypes si besoin
      });

    } catch (error) {
      console.error('Erreur dans showBracelets:', error);
      res.status(500).send('Erreur serveur');
    }
  },
  
};
