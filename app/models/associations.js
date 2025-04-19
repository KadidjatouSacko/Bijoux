import { Category } from "./categoryModel.js";
import { Jewel } from "./jewelModel.js";
import { Customer } from "./customerModel.js";
import { Order } from "./orderModel.js";
import { OrderHasJewel } from "./OrderHasJewelModel.js";
import { Payment } from "./paymentModel.js";

// Définir les relations entre les modèles

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

export { Category, Jewel, Customer, Order, OrderHasJewel, Payment };
