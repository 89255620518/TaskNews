// import { Cart, CartItem } from "../models/Cart.js";
// import { Product } from "../models/Products.js";

// export class CartController {
//     async getCart(req, res) {
//         try {
//             const userId = req.user.id;

//             const cart = await Cart.findOne({
//                 where: { userId },
//                 include: [
//                     {
//                         model: CartItem,
//                         as: 'items',
//                         include: [{
//                             model: Product,
//                             as: 'product'
//                         }]
//                     }
//                 ],
//             })

//             if (!cart) {
//                 return res.json({ cart: null, total: 0, items: [] });
//             }

//             const total = cart.items.reduce(
//                 (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity, 0
//             )

//             const response = {
//                 cart,
//                 total,
//                 items: cart.items.map((item) => ({
//                     ...item.toJSON(),
//                     product: item.product,
//                     currentPrice: item.product.price,
//                 })),
//             };

//             res.json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 res.status(500).json({ error: error.message });
//             } else {
//                 res.status(500).json({ error: 'An error occurred' });
//             }
//         }
//     }

//     async addToCart(req, res) {
//         try {
//             const userId = req.user.id;
//             const { productId, quantity = 1 } = req.body;

//             if (!productId) {
//                 return res.status(400).json({ error: 'Product ID is required' });
//             }

//             const [cart] = await Cart.findOrCreate({
//                 where: { userId },
//                 defaults: { userId },
//             });

//             const product = await Product.findByPk(productId)

//             if (!product) {
//                 return res.status(404).json({ error: 'Product not found' })
//             }

//             if (product.quantity < quantity) {
//                 return res.status(400).json({
//                     error: `Not enough stock. Available: ${product.quantity}`,
//                 });
//             }

//             const [cartItem, created] = await CartItem.findOrCreate({
//                 where: { cartId: cart.id, productId },
//                 defaults: {
//                     cartId: cart.id,
//                     productId,
//                     quantity,
//                     priceAtAddition: product.price,
//                 },
//             });

//             if (!created) {
//                 const newQuantity = cartItem.quantity + quantity;

//                 if (product.quantity < newQuantity) {
//                     return res.status(400).json({
//                         error: `Not enough stock. Available: ${product.quantity}, requested: ${newQuantity}`,
//                     });
//                 }

//                 cartItem.quantity = newQuantity;
//                 await cartItem.save();
//             }

//             const updatedCart = await Cart.findOne({
//                 where: { id: cart.id },
//                 include: [
//                     {
//                         model: CartItem,
//                         as: 'items',
//                         include: [{ model: Product, as: 'product' }],
//                     },
//                 ],
//             })

//             if (!updatedCart) {
//                 return res.status(404).json({ error: 'Updated cart not found' });
//             }

//             const total = updatedCart.items.reduce(
//                 (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity, 0
//             );

//             const response = {
//                 cart: updatedCart,
//                 total,
//                 items: updatedCart.items.map((item) => ({
//                     ...item.toJSON(),
//                     product: item.product,
//                     currentPrice: item.product.price,
//                 })),
//             };

//             res.json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 res.status(500).json({ error: error.message });
//             } else {
//                 res.status(500).json({ error: 'An error occurred' });
//             }
//         }
//     }

//     async removeFromCart(req, res) {
//         try {
//             const userId = req.user.id;
//             const { productId } = req.params;

//             if (!productId) {
//                 return res.status(400).json({ error: 'Product ID is required' });
//             }

//             const cart = await Cart.findOne({ where: { userId } });
//             if (!cart) {
//                 return res.status(404).json({ error: 'Cart not found' });
//             }

//             const cartItem = await CartItem.findOne({
//                 where: { cartId: cart.id, productId },
//             });

//             if (!cartItem) {
//                 return res.status(404).json({ error: 'Product not in cart' });
//             }

//             await cartItem.destroy();

//             const updatedCart = await Cart.findOne({
//                 where: { id: cart.id },
//                 include: [
//                     {
//                         model: CartItem,
//                         as: 'items',
//                         include: [{ model: Product, as: 'product' }],
//                     },
//                 ],
//             })

//             const total = updatedCart?.items?.reduce(
//                 (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
//                 0
//             ) || 0;

//             const response = {
//                 cart: updatedCart || null,
//                 total,
//                 items: updatedCart?.items?.map((item) => ({
//                     ...item.toJSON(),
//                     product: item.product,
//                     currentPrice: item.product.price,
//                 })) || []
//             };

//             res.json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 res.status(500).json({ error: error.message });
//             } else {
//                 res.status(500).json({ error: 'An error occurred' });
//             }
//         }
//     }

//     async clearCart(req, res) {
//         try {
//             const userId = req.user.id;

//             const cart = await Cart.findOne({ where: { userId } });
//             if (!cart) {
//                 return res.status(404).json({ error: 'Cart not found' });
//             }

//             await CartItem.destroy({ where: { cartId: cart.id } });

//             const response = {
//                 cart: { ...cart.toJSON(), items: [] },
//                 total: 0,
//                 items: []
//             };

//             res.json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 res.status(500).json({ error: error.message });
//             } else {
//                 res.status(500).json({ error: 'An error occurred' });
//             }
//         }
//     }

//     async updateCartItem(req, res) {
//         try {
//             const userId = req.user.id;
//             const { productId, quantity } = req.body;

//             if (!productId || quantity === undefined) {
//                 return res.status(400).json({
//                     error: 'Product ID and quantity are required'
//                 });
//             }

//             if (quantity < 1) {
//                 return this.removeFromCart(req, res);
//             }

//             const cart = await Cart.findOne({ where: { userId } });
//             if (!cart) {
//                 return res.status(404).json({ error: 'Cart not found' });
//             }

//             const product = await Product.findByPk(productId);
//             if (!product) {
//                 return res.status(404).json({ error: 'Product not found' });
//             }

//             if (product.quantity < quantity) {
//                 return res.status(400).json({
//                     error: `Not enough stock. Available: ${product.quantity}`
//                 });
//             }

//             const [cartItem] = await CartItem.findOrCreate({
//                 where: { cartId: cart.id, productId },
//                 defaults: {
//                     cartId: cart.id,
//                     productId,
//                     quantity: 0,
//                     priceAtAddition: product.price,
//                 },
//             });

//             cartItem.quantity = quantity;
//             await cartItem.save();

//             const updatedCart = await Cart.findOne({
//                 where: { id: cart.id },
//                 include: [
//                     {
//                         model: CartItem,
//                         as: 'items',
//                         include: [{ model: Product, as: 'product' }],
//                     },
//                 ],
//             })

//             if (!updatedCart) {
//                 return res.status(404).json({ error: 'Updated cart not found' });
//             }

//             const total = updatedCart.items.reduce(
//                 (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
//                 0
//             );

//             const response = {
//                 cart: updatedCart,
//                 total,
//                 items: updatedCart.items.map((item) => ({
//                     ...item.toJSON(),
//                     product: item.product,
//                     currentPrice: item.product.price,
//                 }))
//             };

//             res.json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 res.status(500).json({ error: error.message });
//             } else {
//                 res.status(500).json({ error: 'An error occurred' });
//             }
//         }
//     }

// }
const { Cart, CartItem } = require("../models/Cart.cjs");
const { Product } = require("../models/Products.cjs");

class CartController {
    async getCart(req, res) {
        try {
            const userId = req.user.id;

            const cart = await Cart.findOne({
                where: { userId },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product'
                        }]
                    }
                ],
            })

            if (!cart) {
                return res.json({ cart: null, total: 0, items: [] });
            }

            const total = cart.items.reduce(
                (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity, 0
            )

            const response = {
                cart,
                total,
                items: cart.items.map((item) => ({
                    ...item.toJSON(),
                    product: item.product,
                    currentPrice: item.product.price,
                })),
            };

            res.json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An error occurred' });
            }
        }
    }

    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity = 1 } = req.body;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const [cart] = await Cart.findOrCreate({
                where: { userId },
                defaults: { userId },
            });

            const product = await Product.findByPk(productId)

            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }

            if (product.quantity < quantity) {
                return res.status(400).json({
                    error: `Not enough stock. Available: ${product.quantity}`,
                });
            }

            const [cartItem, created] = await CartItem.findOrCreate({
                where: { cartId: cart.id, productId },
                defaults: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    priceAtAddition: product.price,
                },
            });

            if (!created) {
                const newQuantity = cartItem.quantity + quantity;

                if (product.quantity < newQuantity) {
                    return res.status(400).json({
                        error: `Not enough stock. Available: ${product.quantity}, requested: ${newQuantity}`,
                    });
                }

                cartItem.quantity = newQuantity;
                await cartItem.save();
            }

            const updatedCart = await Cart.findOne({
                where: { id: cart.id },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }],
                    },
                ],
            })

            if (!updatedCart) {
                return res.status(404).json({ error: 'Updated cart not found' });
            }

            const total = updatedCart.items.reduce(
                (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity, 0
            );

            const response = {
                cart: updatedCart,
                total,
                items: updatedCart.items.map((item) => ({
                    ...item.toJSON(),
                    product: item.product,
                    currentPrice: item.product.price,
                })),
            };

            res.json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An error occurred' });
            }
        }
    }

    async removeFromCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            const cartItem = await CartItem.findOne({
                where: { cartId: cart.id, productId },
            });

            if (!cartItem) {
                return res.status(404).json({ error: 'Product not in cart' });
            }

            await cartItem.destroy();

            const updatedCart = await Cart.findOne({
                where: { id: cart.id },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }],
                    },
                ],
            })

            const total = updatedCart?.items?.reduce(
                (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
                0
            ) || 0;

            const response = {
                cart: updatedCart || null,
                total,
                items: updatedCart?.items?.map((item) => ({
                    ...item.toJSON(),
                    product: item.product,
                    currentPrice: item.product.price,
                })) || []
            };

            res.json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An error occurred' });
            }
        }
    }

    async clearCart(req, res) {
        try {
            const userId = req.user.id;

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            await CartItem.destroy({ where: { cartId: cart.id } });

            const response = {
                cart: { ...cart.toJSON(), items: [] },
                total: 0,
                items: []
            };

            res.json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An error occurred' });
            }
        }
    }

    async updateCartItem(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            if (!productId || quantity === undefined) {
                return res.status(400).json({
                    error: 'Product ID and quantity are required'
                });
            }

            if (quantity < 1) {
                return this.removeFromCart(req, res);
            }

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (product.quantity < quantity) {
                return res.status(400).json({
                    error: `Not enough stock. Available: ${product.quantity}`
                });
            }

            const [cartItem] = await CartItem.findOrCreate({
                where: { cartId: cart.id, productId },
                defaults: {
                    cartId: cart.id,
                    productId,
                    quantity: 0,
                    priceAtAddition: product.price,
                },
            });

            cartItem.quantity = quantity;
            await cartItem.save();

            const updatedCart = await Cart.findOne({
                where: { id: cart.id },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }],
                    },
                ],
            })

            if (!updatedCart) {
                return res.status(404).json({ error: 'Updated cart not found' });
            }

            const total = updatedCart.items.reduce(
                (sum, item) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
                0
            );

            const response = {
                cart: updatedCart,
                total,
                items: updatedCart.items.map((item) => ({
                    ...item.toJSON(),
                    product: item.product,
                    currentPrice: item.product.price,
                }))
            };

            res.json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An error occurred' });
            }
        }
    }
}

module.exports = { CartController };