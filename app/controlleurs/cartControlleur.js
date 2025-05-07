import { Cart } from '../models/cartModel.js';
import { Jewel } from '../models/jewelModel.js';
import { JewelImage } from '../models/jewelImage.js';
import { Category } from '../models/categoryModel.js';
import {Sequelize, Op } from 'sequelize';

export const cartController = {

  // Afficher le panier d'un utilisateur
  async renderCart(req, res) {
      try {
        let cart = { items: [], totalPrice: 0 };
        let recommendations = [];
        
        // Récupérer les recommandations (5 bijoux populaires)
        try {
          recommendations = await Jewel.findAll({
            order: [['popularity_score', 'DESC']],
            limit: 4
          });
        } catch (err) {
          console.error("Erreur lors de la récupération des recommandations:", err);
        }
  
        // Si utilisateur connecté
        if (req.session && req.session.userId) {
          const customerId = req.session.userId;
          
          // Récupérer les items du panier depuis la base de données
          const cartItems = await Cart.findAll({
            where: { customer_id: customerId },
            include: [{ model: Jewel }]
          });
          
          // Formatage des items pour l'affichage
          cart.items = cartItems.map(item => ({
            jewel: item.Jewel,
            quantity: item.quantity
          }));
          
          // Calcul du total
          cart.totalPrice = cart.items.reduce(
            (total, item) => total + (item.jewel.price_ttc * item.quantity), 0
          );
        } 
        // Si utilisateur non connecté, utiliser le panier de session
        else if (req.session && req.session.cart) {
          cart = req.session.cart;
          
          // S'assurer que le panier est bien formaté
          if (!Array.isArray(cart.items)) {
            cart.items = [];
            cart.totalPrice = 0;
          }
          
          // Mettre à jour les infos des bijoux (en cas de changement de prix)
          for (let i = 0; i < cart.items.length; i++) {
            const item = cart.items[i];
            if (item.jewel && item.jewel.id) {
              try {
                const updatedJewel = await Jewel.findByPk(item.jewel.id);
                if (updatedJewel) {
                  item.jewel = {
                    id: updatedJewel.id,
                    name: updatedJewel.name,
                    price_ttc: updatedJewel.price_ttc,
                    image: updatedJewel.image,
                    stock: updatedJewel.stock,
                    matiere: updatedJewel.matiere,
                    carat: updatedJewel.carat,
                    taille: updatedJewel.taille
                  };
                }
              } catch (err) {
                console.error(`Erreur lors de la mise à jour du bijou ${item.jewel.id}:`, err);
              }
            }
          }
          
          // Recalculer le total
          cart.totalPrice = cart.items.reduce(
            (total, item) => total + (item.jewel.price_ttc * item.quantity), 0
          );
        }
        
        // Afficher la page du panier
        res.render('cart', { 
          cart, 
          recommendations,
          title: 'Mon panier', 
          user: req.session.user 
        });
      } catch (error) {
        console.error('Erreur lors de l\'affichage du panier:', error);
        res.status(500).render('error', { 
          message: 'Une erreur est survenue lors du chargement du panier',
          error: process.env.NODE_ENV === 'development' ? error : {} 
        });
      }
    },
  
  // Ajouter un article au panier
 /**
 * Ajouter un bijou au panier
 */
 async addToCart(req, res) {
  try {
    console.log('Requête d\'ajout au panier reçue:', req.body);
    const { jewelId, quantity = 1 } = req.body;
    
    // Validation de l'ID du bijou
    if (!jewelId) {
      return res.status(400).json({
        success: false,
        message: 'ID du bijou manquant'
      });
    }
    
    // Recherche du bijou
    const jewel = await Jewel.findByPk(jewelId);
    console.log('Bijou trouvé:', jewel ? jewel.name : 'Non trouvé');
    
    if (!jewel) {
      return res.status(404).json({
        success: false,
        message: 'Bijou non trouvé'
      });
    }
    
    // Vérification du stock
    if (jewel.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Il reste seulement ${jewel.stock} exemplaire(s)`,
        availableStock: jewel.stock
      });
    }
    
    // Si utilisateur connecté
    if (req.session && req.session.userId) {
      const customerId = req.session.userId;
      console.log('Utilisateur connecté ID:', customerId);
      
      // Vérifier si l'article existe déjà dans le panier
      const existingItem = await Cart.findOne({
        where: { customer_id: customerId, jewel_id: jewelId }
      });
      
      if (existingItem) {
        // Mettre à jour la quantité
        const newQuantity = existingItem.quantity + parseInt(quantity);
        
        // Vérifier à nouveau le stock avec la nouvelle quantité
        if (newQuantity > jewel.stock) {
          return res.status(400).json({
            success: false,
            message: `Stock insuffisant. Il reste seulement ${jewel.stock} exemplaire(s)`,
            availableStock: jewel.stock
          });
        }
        
        await existingItem.update({ 
          quantity: newQuantity, 
          updated_at: new Date() 
        });
        console.log('Article mis à jour dans le panier');
      } else {
        // Ajouter un nouvel article
        await Cart.create({
          customer_id: customerId,
          jewel_id: jewelId,
          quantity: parseInt(quantity)
        });
        console.log('Nouvel article ajouté au panier');
      }
    } 
    // Si utilisateur non connecté, utiliser le panier de session
    else {
      console.log('Utilisateur non connecté, utilisation du panier de session');
      
      // Initialiser le panier si nécessaire
      if (!req.session.cart) {
        req.session.cart = { items: [], totalPrice: 0 };
        console.log('Panier de session initialisé');
      } else if (!Array.isArray(req.session.cart.items)) {
        req.session.cart.items = [];
        req.session.cart.totalPrice = 0;
        console.log('Structure du panier corrigée');
      }
      
      console.log('État actuel du panier:', JSON.stringify(req.session.cart));
      
      // Rechercher l'article dans le panier
      const existingItemIndex = req.session.cart.items.findIndex(
        item => item.jewel && item.jewel.id === parseInt(jewelId)
      );
      
      if (existingItemIndex !== -1) {
        // Mettre à jour la quantité
        const newQuantity = req.session.cart.items[existingItemIndex].quantity + parseInt(quantity);
        
        // Vérifier à nouveau le stock avec la nouvelle quantité
        if (newQuantity > jewel.stock) {
          return res.status(400).json({
            success: false,
            message: `Stock insuffisant. Il reste seulement ${jewel.stock} exemplaire(s)`,
            availableStock: jewel.stock
          });
        }
        
        req.session.cart.items[existingItemIndex].quantity = newQuantity;
        console.log('Quantité mise à jour dans le panier de session');
      } else {
        // Ajouter un nouvel article
        req.session.cart.items.push({
          jewel: {
            id: jewel.id,
            name: jewel.name,
            price_ttc: jewel.price_ttc,
            image: jewel.image,
            stock: jewel.stock,
            matiere: jewel.matiere,
            carat: jewel.carat,
            taille: jewel.taille,
            slug: jewel.slug || `jewel-${jewel.id}` // Ajouter un slug pour les liens
          },
          quantity: parseInt(quantity)
        });
        console.log('Nouvel article ajouté au panier de session');
      }
      
      // Recalculer le total
      req.session.cart.totalPrice = req.session.cart.items.reduce(
        (total, item) => total + (item.jewel.price_ttc * item.quantity), 0
      );
      
      console.log('Total du panier mis à jour:', req.session.cart.totalPrice);
      console.log('Contenu du panier après ajout:', JSON.stringify(req.session.cart));
    }
    
    // Sauvegarder la session
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error('Erreur lors de la sauvegarde de la session:', err);
          reject(err);
        } else {
          console.log('Session sauvegardée avec succès');
          resolve();
        }
      });
    });
    
    return res.json({
      success: true,
      message: 'Article ajouté au panier avec succès',
      jewelName: jewel.name,
      cartSize: req.session.cart ? req.session.cart.items.length : 0
    });
  } catch (error) {
    console.error('ERREUR DÉTAILLÉE LORS DE L\'AJOUT AU PANIER:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'ajout au panier'
    });
  }
},

// Mettre à jour la quantité d'un article
async updateCart(req, res) {
  try {
    const { jewelId, quantity } = req.body;
    
    if (!jewelId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides'
      });
    }
    
    const jewel = await Jewel.findByPk(jewelId);
    
    if (!jewel) {
      return res.status(404).json({
        success: false,
        message: 'Bijou non trouvé'
      });
    }
    
    // Vérifier le stock
    if (jewel.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Il reste seulement ${jewel.stock} exemplaire(s)`,
        originalQuantity: req.session.cart.items.find(item => item.jewel.id === parseInt(jewelId))?.quantity
      });
    }
    
    // Mettre à jour pour utilisateur connecté
    if (req.session && req.session.userId) {
      const customerId = req.session.userId;
      
      const cartItem = await Cart.findOne({
        where: { customer_id: customerId, jewel_id: jewelId }
      });
      
      if (cartItem) {
        if (quantity <= 0) {
          await cartItem.destroy();
        } else {
          await cartItem.update({ quantity, updated_at: new Date() });
        }
      }
    } 
    // Mettre à jour pour utilisateur non connecté
    else if (req.session && req.session.cart) {
      const itemIndex = req.session.cart.items.findIndex(
        item => item.jewel && item.jewel.id === parseInt(jewelId)
      );
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          req.session.cart.items.splice(itemIndex, 1);
        } else {
          req.session.cart.items[itemIndex].quantity = quantity;
        }
        
        // Recalculer le total
        req.session.cart.totalPrice = req.session.cart.items.reduce(
          (total, item) => total + (item.jewel.price_ttc * item.quantity), 0
        );
        
        // Sauvegarder la session
        await new Promise((resolve, reject) => {
          req.session.save(err => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    return res.json({
      success: true,
      message: 'Panier mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour du panier'
    });
  }
},

// Supprimer un article du panier
async removeItem(req, res) {
  try {
    const { jewelId } = req.body;
    
    if (!jewelId) {
      return res.status(400).json({
        success: false,
        message: 'ID du bijou manquant'
      });
    }
    
    // Supprimer pour utilisateur connecté
    if (req.session && req.session.userId) {
      const customerId = req.session.userId;
      
      await Cart.destroy({
        where: { customer_id: customerId, jewel_id: jewelId }
      });
    } 
    // Supprimer pour utilisateur non connecté
    else if (req.session && req.session.cart) {
      const itemIndex = req.session.cart.items.findIndex(
        item => item.jewel && item.jewel.id === parseInt(jewelId)
      );
      
      if (itemIndex !== -1) {
        req.session.cart.items.splice(itemIndex, 1);
        
        // Recalculer le total
        req.session.cart.totalPrice = req.session.cart.items.reduce(
          (total, item) => total + (item.jewel.price_ttc * item.quantity), 0
        );
        
        // Sauvegarder la session
        await new Promise((resolve, reject) => {
          req.session.save(err => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    return res.json({
      success: true,
      message: 'Article supprimé du panier'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression de l\'article'
    });
  }
},

// Vider le panier
async clearCart(req, res) {
  try {
    // Vider pour utilisateur connecté
    if (req.session && req.session.userId) {
      const customerId = req.session.userId;
      
      await Cart.destroy({
        where: { customer_id: customerId }
      });
    } 
    // Vider pour utilisateur non connecté
    else if (req.session && req.session.cart) {
      req.session.cart.items = [];
      req.session.cart.totalPrice = 0;
      
      // Sauvegarder la session
      await new Promise((resolve, reject) => {
        req.session.save(err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    return res.json({
      success: true,
      message: 'Le panier a été vidé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du vidage du panier:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors du vidage du panier'
    });
  }
}
}

;