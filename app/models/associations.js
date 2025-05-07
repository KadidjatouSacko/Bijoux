import { Category } from "./categoryModel.js";
import { Jewel } from "./jewelModel.js";
import { Customer } from "./customerModel.js";
import { Order } from "./orderModel.js";
import { OrderHasJewel } from "./OrderHasJewelModel.js";
import { Payment } from "./paymentModel.js";
import { Role } from "./roleModel.js";

import { Material } from "./MaterialModel.js";
import { JewelImage } from "./jewelImage.js";
import { Favorite } from "./favoritesModel.js";
import { Cart } from "./cartModel.js";
import { JewelView } from "./jewelViewModel.js";
import { OrderItem } from "./orderItem.js";
import { Type } from "./TypeModel.js";
import { Activity } from "./activityModel.js";


import { sequelize } from "./sequelize-client.js";
// Définir les relations entre les modèles

Order.belongsToMany(Jewel, {
  through: OrderHasJewel,
  foreignKey: 'order_id',
  otherKey: 'jewel_id',
});

Jewel.belongsToMany(Order, {
  through: OrderHasJewel,
  foreignKey: 'jewel_id',
  otherKey: 'order_id',
});


// 1. Category <-> Jewel
// Une catégorie a plusieurs bijoux
Category.hasMany(Jewel, {
    foreignKey: 'category_id',
});
Jewel.belongsTo(Category, {
    foreignKey: 'category_id',
});

// 2. Customer <-> Order
// Un client a plusieurs commandes
Customer.hasMany(Order, {
    foreignKey: 'customer_id',
});
Order.belongsTo(Customer, {
    foreignKey: 'customer_id',
});

// Association : Une commande a plusieurs items
Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'items',
  });
  OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });
  
  // Association : Un item concerne un bijou
  Jewel.hasMany(OrderItem, {
    foreignKey: 'jewel_id',
    as: 'order_items',
  });
  OrderItem.belongsTo(Jewel, {
    foreignKey: 'jewel_id',
    as: 'jewel',
  });

// 3. Order <-> OrderHasJewel
// Une commande peut avoir plusieurs bijoux (via la table de liaison OrderHasJewel)
Order.hasMany(OrderHasJewel, {
    foreignKey: 'order_id',
});
OrderHasJewel.belongsTo(Order, {
    foreignKey: 'order_id',
});

// 4. Jewel <-> OrderHasJewel
// Un bijou peut être dans plusieurs commandes (via la table de liaison OrderHasJewel)
Jewel.hasMany(OrderHasJewel, {
    foreignKey: 'jewel_id',
});
OrderHasJewel.belongsTo(Jewel, {
    foreignKey: 'jewel_id',
});

// 5. Order <-> Payment
// Une commande peut avoir un paiement
Order.hasOne(Payment, {
    foreignKey: 'order_id',
});
Payment.belongsTo(Order, {
    foreignKey: 'order_id',
});


// Jewel <-> Type
Jewel.belongsTo(Type, {
  foreignKey: 'type_id', // La clé étrangère dans la table Jewel
});
Type.hasMany(Jewel, {
  foreignKey: 'type_id', // La clé étrangère dans la table Jewel
});

Type.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasMany(Type, { foreignKey: 'category_id' });




Customer.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Role.hasMany(Customer, {
     foreignKey: "role_id",
     onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
});

// Définir la relation entre Jewel et Material
Jewel.belongsToMany(Material, {
    through: "jewel_has_material",
    foreignKey: "jewel_id",
});
Material.belongsToMany(Jewel, {
    through: "jewel_has_material",
    foreignKey: "material_id",
});

// Association one-to-many entre Jewel et JewelImage
Jewel.hasMany(JewelImage, { foreignKey: 'jewel_id', as: 'images' });
JewelImage.belongsTo(Jewel, { foreignKey: 'jewel_id' });

Customer.hasMany(Favorite, { foreignKey: 'customer_id' });
Jewel.hasMany(Favorite, { foreignKey: 'jewel_id' });


// Définir les associations après l'initialisation du modèle

    // Un panier appartient à un client
    Cart.belongsTo(Customer, {
      foreignKey: 'customer_id',
      as: 'customer',
    });
  
    // Un panier appartient à un bijou
    Cart.belongsTo(Jewel, {
      foreignKey: 'jewel_id',
      as: 'jewel',
    });


    Jewel.hasMany(JewelView, {
        foreignKey: 'jewel_id',
        as: 'views'
      });
    JewelView.belongsTo(Jewel, {
        foreignKey: 'jewel_id',
        as: 'jewel'
      });

      Favorite.belongsTo(Jewel, { foreignKey: 'jewel_id', as: 'jewel' });
Favorite.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Jewel.hasMany(Favorite, { foreignKey: 'jewel_id', as: 'favorites' });
Customer.hasMany(Favorite, { foreignKey: 'customer_id', as: 'favorites' });


  Activity.belongsTo(Customer, { foreignKey: 'customer_id' });
  
  Customer.belongsTo(Role, {
       foreignKey: "role_id" 
  });
  Role.hasMany(Customer, {
       foreignKey: "role_id"
  });
export { Category, Jewel, Customer, Order, OrderHasJewel, Payment, JewelImage, OrderItem, Cart, JewelView, Favorite, Material, Type, Role };
