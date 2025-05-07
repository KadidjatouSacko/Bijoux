import { Order } from '../models/orderModel.js';
import { OrderItem } from '../models/orderItem.js';
import { OrderHasJewel } from '../models/OrderHasJewelModel.js';
import { Payment } from '../models/paymentModel.js';
import { Jewel } from '../models/jewelModel.js';
import { Customer } from '../models/customerModel.js';
import { Material } from '../models/MaterialModel.js';
import { Cart } from '../models/cartModel.js';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../models/sequelize-client.js';
import { Category } from '../models/categoryModel.js';
import { Favorite } from '../models/favoritesModel.js';
import { Activity } from '../models/activityModel.js';
import Sequelize from 'sequelize';
import Op from 'sequelize';

// Définir les fonctions en dehors de l'objet `adminStatsController`

export const getCategorySalesData = async () => {
    const salesData = await Jewel.findAll({
        attributes: [
            'category_id',
            [Sequelize.fn('sum', Sequelize.col('price_ttc')), 'total_sales']
        ],
        group: ['category_id', 'Category.id', 'Category.name'], // Ajout de Category.id et Category.name dans le GROUP BY
        include: [
            {
                model: Category,
                attributes: ['id', 'name']
            }
        ]
    });
    

    return salesData;
};

export const getSalesTrendData = async () => {
    const trendData = await Jewel.findAll({
        attributes: [
            [Sequelize.fn('date_trunc', 'month', Sequelize.col('created_at')), 'month'],
            [Sequelize.fn('sum', Sequelize.col('price_ttc')), 'total_sales']
        ],
        group: ['month'],
        order: [[Sequelize.col('month'), 'ASC']]
    });

    return trendData;
};

export const getMostSoldJewels = async () => {
    const mostSoldJewels = await Jewel.findAll({
        attributes: ['id', 'name', [Sequelize.fn('sum', Sequelize.col('price_ttc')), 'total_sales']],
        group: ['id', 'name'],
        order: [[Sequelize.fn('sum', Sequelize.col('price_ttc')), 'DESC']],
        limit: 5  // Limiter aux 5 bijoux les plus vendus
    });

    return mostSoldJewels;
};

export const getMaterialsDistributionData = async () => {
    const materialsData = await Jewel.findAll({
        attributes: ['matiere', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
        group: ['matiere']
    });

    return materialsData;
};

// Ensuite, tu peux appeler ces fonctions directement dans ton contrôleur `adminStatsController`

export const adminStatsController = {

    async dashboard(req, res) {
        try {
            const totalRevenue = await Payment.sum('amount', { where: { status: 'réussi' } });
            const totalOrders = await Order.count();
            const totalCustomers = await Customer.count();
            const totalJewels = await Jewel.count();
            const categories = await Category.findAll();
            const totalInCarts = await Cart.sum('quantity');

            const averageOrderValue = await Payment.findAll({
                attributes: [[sequelize.fn('AVG', sequelize.col('amount')), 'average']],
                where: { status: 'réussi' },
                raw: true,
            });

            const mostViewedJewels = await sequelize.query(
                `SELECT j.id, j.name, COUNT(jv.id) AS views 
                 FROM jewel j 
                 LEFT JOIN jewel_views jv ON j.id = jv.jewel_id 
                 GROUP BY j.id ORDER BY views DESC LIMIT 5`,
                { type: QueryTypes.SELECT }
            );

            const visitsLast7Days = await sequelize.query(
                `SELECT TO_CHAR(visited_at, 'YYYY-MM-DD') as date, COUNT(*) AS visits 
                 FROM site_visits 
                 WHERE visited_at >= NOW() - INTERVAL '7 days'
                 GROUP BY date ORDER BY date ASC`,
                { type: QueryTypes.SELECT }
            );

            const newCustomersCount = await Customer.count({
                where: {
                    createdAt: {
                        [Sequelize.Op.gte]: Sequelize.literal('NOW() - INTERVAL \'30 days\'')
                    }
                }
            });

            const stockThreshold = Number(req.query.stock || 10);
            if (isNaN(stockThreshold)) {
                throw new Error("La valeur du seuil de stock n'est pas un nombre valide.");
            }
            
            const lowStockJewels = await Jewel.findAll({
                where: { stock: stockThreshold }
            });

            // Appel des fonctions directement, sans `this`
            const categorySales = await getCategorySalesData();
            const salesTrend = await getSalesTrendData();
            const mostSoldJewels = await getMostSoldJewels();
            const materialsDistribution = await getMaterialsDistributionData();

            // Passage des données à la vue
            res.render('admin-stats', {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalJewels,
                totalInCarts,
                averageOrderValue: parseFloat(averageOrderValue[0].average || 0).toFixed(2),
                mostViewedJewels,
                mostSoldJewels,
                visitsLast7Days,
                categories,
                newCustomersCount,
                lowStockJewels,
                categorySales,
                salesTrend,
                materialsDistribution
            });

        } catch (err) {
            console.error(err);
            res.status(500).send("Erreur interne du serveur");
        }
    },
    
    async getClientStats(req, res) {
        // Vérifie si le customer_id est présent dans la session
        const customerId = req.session.customerId;
    
        if (!customerId) {
            console.error("customerId manquant dans la session", req.session);
            return res.status(400).send("Client non authentifié. Veuillez vous connecter.");
        }
    
        try {

            const customer = await Customer.findByPk(customerId);

            // Récupère les stats de commandes du client
            const totalOrders = await Order.count({
                where: { customer_id: customerId }
            });
    
            const totalSpent = await Order.sum('total', {
                where: { customer_id: customerId }
            });
    
            const averageBasket = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
            const totalFavorites = await Favorite.count({
                where: { customer_id: customerId }
            });
    
            const orders = await Order.findAll({
                where: { customer_id: customerId },
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Jewel, as: 'jewel' }]
                }],
                order: [['created_at', 'DESC']]
            });

            const favorites = await Favorite.findAll({
                where: { customer_id: customerId },
                include: [{ model: Jewel, as: 'jewel' }]
            });
            
            const activities = await Activity.findAll({
                where: { customer_id: customerId },
                order: [['created_at', 'DESC']] // Tri par date
              });
            
    
            res.render('follow-customer', {
                activities,
                orders,
                stats: {
                    totalOrders,
                    totalSpent: totalSpent !== null ? totalSpent.toFixed(2) : '0.00',
                    averageBasket: totalOrders > 0 && totalSpent !== null ? (totalSpent / totalOrders).toFixed(2) : '0.00',
                    totalFavorites
                },
                customer,
                favorites
            });
    
        } catch (error) {
            console.error("Erreur lors du calcul des statistiques client:", error);
            res.status(500).send("Erreur interne du serveur.");
        }
    },
    
    /**
 * Contrôleur pour la gestion des bijoux avec Sequelize
 * Ce fichier contient toutes les fonctions nécessaires pour gérer les bijoux
 * dans l'application d'administration de la bijouterie.
 */

    async ShowPageProducts(req, res) {
        const [categories, materials] = await Promise.all([
            Category.findAll(),
            Material.findAll()
        ]);
    
        // Exemples de calculs, à adapter selon ta DB :
        const totalProducts = await Jewel.count();
        const totalStock = await Jewel.sum('stock');
        const lowStock = await Jewel.count({
            where: {
              stock: 3
            }
          });
        const popularProducts = await Jewel.count({
            where: {
              stock: 0
            }
          });

        

        res.render('product', {
            categories,
            materials,
            totalProducts,
            totalStock,
            lowStock,
            popularProducts
        });
    },

// Obtenir tous les bijoux avec pagination et filtres
    async findAll (req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Construction du where pour les filtres
        const whereConditions = {};
        
        // Filtre par recherche (nom ou description)
        if (req.query.search) {
            whereConditions[Op.or] = [
                { name: { [Op.iLike]: `%${req.query.search}%` } },
                { description: { [Op.iLike]: `%${req.query.search}%` } }
            ];
        }
        
        // Filtre par catégorie
        if (req.query.category) {
            whereConditions.category_id = req.query.category;
        }
        
        // Filtre par matière
        if (req.query.material) {
            // Si on filtre par matière, on doit utiliser une jointure via include
            // Cette logique est gérée dans les includes ci-dessous
        }
        
        // Filtre par état du stock
        if (req.query.stock) {
            switch (req.query.stock) {
                case 'low':
                    whereConditions.stock = { [Op.lte]: 5 };
                    break;
                case 'medium':
                    whereConditions.stock = { [Op.between]: [6, 20] };
                    break;
                case 'high':
                    whereConditions.stock = { [Op.gt]: 20 };
                    break;
            }
        }
        
        // Filtre par prix
        if (req.query.minPrice) {
            whereConditions.price_ttc = {
                ...(whereConditions.price_ttc || {}),
                [Op.gte]: parseFloat(req.query.minPrice)
            };
        }
        
        if (req.query.maxPrice) {
            whereConditions.price_ttc = {
                ...(whereConditions.price_ttc || {}),
                [Op.lte]: parseFloat(req.query.maxPrice)
            };
        }
        
        // Configuration des includes pour les jointures
        const includes = [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }
        ];
        
        // Si on filtre par matière, on ajoute l'include pour les matériaux
        if (req.query.material) {
            includes.push({
                model: Material,
                as: 'materials',
                attributes: ['id', 'name'],
                through: { attributes: [] }, // Ne pas inclure les attributs de la table de jonction
                where: { id: req.query.material }
            });
        }
        
        // Requête principale avec compte total pour pagination
        const { count, rows } = await Jewel.findAndCountAll({
            where: whereConditions,
            include: includes,
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']]
        });
        
        // Formater la réponse
        res.send({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            jewels: rows
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des bijoux:', error);
        res.status(500).send({
            message: error.message || 'Une erreur est survenue lors de la récupération des bijoux.'
        });
    }
},

// Obtenir un bijou par son ID
async findOne  (req, res) {
    try {
        const id = req.params.id;
        
        const jewel = await Jewel.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Material,
                    as: 'materials',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!jewel) {
            return res.status(404).send({
                message: `Bijou avec ID ${id} non trouvé.`
            });
        }
        
        res.send(jewel);
    } catch (error) {
        console.error('Erreur lors de la récupération du bijou:', error);
        res.status(500).send({
            message: error.message || `Une erreur est survenue lors de la récupération du bijou avec ID ${req.params.id}.`
        });
    }
},

// Créer un nouveau bijou
async create  (req, res) {
    try {
        // Validation des champs obligatoires
        if (!req.body.name || !req.body.price_ttc || !req.body.category_id) {
            return res.status(400).send({
                message: 'Le nom, le prix et la catégorie sont obligatoires!'
            });
        }
        
        // Le prix HT est calculé automatiquement par un trigger dans la base de données
        const jewelData = {
            name: req.body.name,
            description: req.body.description,
            price_ttc: req.body.price_ttc,
            tva: req.body.tva || 20, // TVA par défaut à 20%
            taille: req.body.taille,
            poids: req.body.poids,
            matiere: req.body.matiere,
            carat: req.body.carat,
            image: req.body.image,
            stock: req.body.stock || 0,
            category_id: req.body.category_id,
            popularity_score: 0 // Score de popularité initial
        };
        
        // Création du bijou
        const newJewel = await Jewel.create(jewelData);
        
        // Si des matériaux sont spécifiés, les associer au bijou
        if (req.body.materials && Array.isArray(req.body.materials)) {
            // On attend que toutes les associations soient créées
            await Promise.all(req.body.materials.map(materialId => {
                return JewelHasMaterial.create({
                    jewel_id: newJewel.id,
                    material_id: materialId
                });
            }));
        }
        
        // Récupérer le bijou créé avec ses relations
        const jewel = await Jewel.findByPk(newJewel.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Material,
                    as: 'materials',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
        
        res.status(201).send(jewel);
    } catch (error) {
        console.error('Erreur lors de la création du bijou:', error);
        res.status(500).send({
            message: error.message || 'Une erreur est survenue lors de la création du bijou.'
        });
    }
},

// Mettre à jour un bijou
async update (req, res) {
    try {
        const id = req.params.id;
        
        // Vérifier si le bijou existe
        const jewel = await Jewel.findByPk(id);
        if (!jewel) {
            return res.status(404).send({
                message: `Bijou avec ID ${id} non trouvé.`
            });
        }
        
        // Mise à jour des champs
        await Jewel.update(req.body, {
            where: { id: id }
        });
        
        // Si des matériaux sont spécifiés, mettre à jour les associations
        if (req.body.materials && Array.isArray(req.body.materials)) {
            // Supprimer les anciennes associations
            await JewelHasMaterial.destroy({
                where: { jewel_id: id }
            });
            
            // Créer les nouvelles associations
            await Promise.all(req.body.materials.map(materialId => {
                return JewelHasMaterial.create({
                    jewel_id: id,
                    material_id: materialId
                });
            }));
        }
        
        // Récupérer le bijou mis à jour avec ses relations
        const updatedJewel = await Jewel.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Material,
                    as: 'materials',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
        
        res.send(updatedJewel);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du bijou:', error);
        res.status(500).send({
            message: error.message || `Une erreur est survenue lors de la mise à jour du bijou avec ID ${req.params.id}.`
        });
    }
},

// Supprimer un bijou
async delete (req, res)  {
    try {
        const id = req.params.id;
        
        // Vérifier si le bijou existe
        const jewel = await Jewel.findByPk(id);
        if (!jewel) {
            return res.status(404).send({
                message: `Bijou avec ID ${id} non trouvé.`
            });
        }
        
        // Supprimer les associations avec les matériaux
        await JewelHasMaterial.destroy({
            where: { jewel_id: id }
        });
        
        // Supprimer le bijou
        await Jewel.destroy({
            where: { id: id }
        });
        
        res.send({
            message: 'Bijou supprimé avec succès!'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du bijou:', error);
        res.status(500).send({
            message: error.message || `Une erreur est survenue lors de la suppression du bijou avec ID ${req.params.id}.`
        });
    }
},

// Obtenir les statistiques des bijoux
async getStatistics  (req, res) {
    try {
        // Nombre total de produits
        const totalProducts = await Jewel.count();
        
        // Nombre total d'articles en stock
        const totalStockResult = await Jewel.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('stock')), 'total']
            ]
        });
        const totalStock = totalStockResult.getDataValue('total') || 0;
        
        // Nombre de produits en stock faible
        const lowStock = await Jewel.count({
            where: {
                stock: { [Op.lte]: 5 },
                stock: { [Op.gt]: 0 }
            }
        });
        
        // Nombre de produits populaires (score de popularité > 50)
        const popularProducts = await Jewel.count({
            where: {
                popularity_score: { [Op.gt]: 50 }
            }
        });
        
        res.send({
            totalProducts,
            totalStock,
            lowStock,
            popularProducts
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).send({
            message: error.message || 'Une erreur est survenue lors de la récupération des statistiques.'
        });
    }
},

// Obtenir le stock par catégorie
async getStockByCategory  (req, res) {
    try {
        const stockByCategory = await Category.findAll({
            attributes: [
                'id',
                'name',
                [Sequelize.fn('SUM', Sequelize.col('jewels.stock')), 'stock']
            ],
            include: [{
                model: Jewel,
                as: 'jewels',
                attributes: []
            }],
            group: ['Category.id', 'Category.name'],
            raw: true
        });
        
        // Formater la réponse pour le graphique
        const formattedData = stockByCategory.map(item => ({
            category: item.name,
            stock: parseInt(item.stock || 0)
        }));
        
        res.send(formattedData);
    } catch (error) {
        console.error('Erreur lors de la récupération du stock par catégorie:', error);
        res.status(500).send({
            message: error.message || 'Une erreur est survenue lors de la récupération du stock par catégorie.'
        });
    }
},

// Obtenir les produits les plus populaires
async getMostPopular  (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const popularProducts = await Jewel.findAll({
            attributes: ['id', 'name', 'price_ttc', 'image', 'popularity_score'],
            order: [['popularity_score', 'DESC']],
            limit: limit,
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });
        
        res.send(popularProducts);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits populaires:', error);
        res.status(500).send({
            message: error.message || 'Une erreur est survenue lors de la récupération des produits populaires.'
        });
    }
},

// Obtenir les produits récemment ajoutés
async getRecent  (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const recentProducts = await Jewel.findAll({
            attributes: ['id', 'name', 'price_ttc', 'image', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: limit,
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }]
        });
        
        res.send(recentProducts);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits récents:', error);
        res.status(500).send({
            message: error.message || 'Une erreur est survenue lors de la récupération des produits récents.'
        });
    }
},


async ShowPageOrders(req, res) {
    try {
        const commandes = await Order.findAll({
          include: [
            { model: Customer }, 
            { model: Jewel }
          ]
        });
        commandes.forEach(commande => {
            // Si `total` n'existe pas, vous pouvez le calculer ici, par exemple :
            commande.total = commande.nb_articles * commande.prix_unitaire; // Exemple, à ajuster selon votre logique
        });
        commandes.forEach(commande => {
            commandes.forEach(commande => {
                commande.sous_total = commande.sous_total || 0; // Valeur par défaut si non définie
                commande.tva = commande.tva || 0; // Valeur par défaut
                commande.frais_livraison = commande.frais_livraison || 0; // Valeur par défaut
                commande.total = commande.total || 0; // Valeur par défaut
            })});

        
        const currentStatut = req.query.statut || 'all';  // Récupérer le statut de la requête (ou par défaut 'all')
        const currentDateFilter = req.query.date || 'all'; 
        const currentSearch = req.query.search || '';  // Récupérer le texte de recherche ou une chaîne vide par défaut

        res.render('commandes', {
             commandes : commandes ,
            currentStatut : currentStatut,
            currentDateFilter : currentDateFilter,
            currentSearch : currentSearch,

        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de l'affichage des commandes");
      }
}
}