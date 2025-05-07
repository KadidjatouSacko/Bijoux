import { Role } from "../models/roleModel.js";
import { Customer } from "../models/customerModel.js";

// Middleware pour vérifier si l'utilisateur est connecté
export const isAuthenticated = (req, res, next) => {
  if (req.session.customerId) {
    return next();  // Si l'utilisateur est authentifié, passe à la suite
  } else {
    return res.redirect('/connexion-inscription'); // Redirige l'utilisateur vers la page de connexion
  }
};


// middleware/authMiddleware.js

export const isAdmin = async (req, res, next) => {
  if (req.session.customerId) {
    try {
      const customer = await Customer.findByPk(req.session.customerId, {
        include: Role,
      });

      if (customer && customer.Role && customer.Role.name === 'administrateur') {
        return next(); // Le client est admin
      } else {
        return res.redirect('/'); // Pas autorisé
      }
    } catch (error) {
      console.error('Erreur dans isAdmin :', error);
      return res.redirect('/');
    }
  } else {
    return res.redirect('/connexion-inscription');
  }
};

