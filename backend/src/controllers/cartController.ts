import { Request, Response } from 'express';
import { Cart, CartItem } from '../models/Сart';
import { Product } from '../models/Product';

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface FullCart extends Cart {
  items: CartItemWithProduct[];
}

interface CartResponse {
  cart: FullCart | null;
  total: number;
  items: Array<{
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    priceAtAddition: number;
    createdAt: Date;
    updatedAt: Date;
    product: Product;
    currentPrice: number;
  }>;
}

export class CartController {
  async getCart(req: Request, res: Response<CartResponse | { error: string }>) {
    try {
      const userId = (req as any).user.id;

      const cart = await Cart.findOne({
        where: { userId },
        include: [
          {
            model: CartItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
      }) as unknown as FullCart | null;

      if (!cart) {
        return res.json({ cart: null, total: 0, items: [] });
      }

      const total = cart.items.reduce(
        (sum: number, item: CartItemWithProduct) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
        0
      );

      const response: CartResponse = {
        cart,
        total,
        items: cart.items.map((item: CartItemWithProduct) => ({
          ...item.toJSON(),
          product: item.product,
          currentPrice: item.product.price,
        })),
      };

      res.json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An error occurred' });
      }
    }
  }

  async addToCart(req: Request, res: Response<CartResponse | { error: string }>) {
    try {
      const userId = (req as any).user.id;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const [cart] = await Cart.findOrCreate({
        where: { userId },
        defaults: { userId },
      });

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
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
      }) as unknown as FullCart;

      if (!updatedCart) {
        return res.status(404).json({ error: 'Updated cart not found' });
      }

      const total = updatedCart.items.reduce(
        (sum: number, item: CartItemWithProduct) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
        0
      );

      const response: CartResponse = {
        cart: updatedCart,
        total,
        items: updatedCart.items.map((item: CartItemWithProduct) => ({
          ...item.toJSON(),
          product: item.product,
          currentPrice: item.product.price,
        })),
      };

      res.json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An error occurred' });
      }
    }
  }

  async removeFromCart(req: Request, res: Response<CartResponse | { error: string }>) {
    try {
      const userId = (req as any).user.id;
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
      }) as unknown as FullCart | null;

      const total = updatedCart?.items?.reduce(
        (sum: number, item: CartItemWithProduct) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
        0
      ) || 0;

      const response: CartResponse = {
        cart: updatedCart || null,
        total,
        items: updatedCart?.items?.map((item: CartItemWithProduct) => ({
          ...item.toJSON(),
          product: item.product,
          currentPrice: item.product.price,
        })) || []
      };

      res.json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An error occurred' });
      }
    }
  }

  async clearCart(req: Request, res: Response<CartResponse | { error: string }>) {
    try {
      const userId = (req as any).user.id;

      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      await CartItem.destroy({ where: { cartId: cart.id } });

      const response: CartResponse = {
        cart: { ...cart.toJSON(), items: [] } as unknown as FullCart,
        total: 0,
        items: []
      };

      res.json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An error occurred' });
      }
    }
  }

  async updateCartItem(req: Request, res: Response<CartResponse | { error: string }>) {
    try {
      const userId = (req as any).user.id;
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
      }) as unknown as FullCart;

      if (!updatedCart) {
        return res.status(404).json({ error: 'Updated cart not found' });
      }

      const total = updatedCart.items.reduce(
        (sum: number, item: CartItemWithProduct) => sum + (item.priceAtAddition || item.product.price) * item.quantity,
        0
      );

      const response: CartResponse = {
        cart: updatedCart,
        total,
        items: updatedCart.items.map((item: CartItemWithProduct) => ({
          ...item.toJSON(),
          product: item.product,
          currentPrice: item.product.price,
        }))
      };

      res.json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An error occurred' });
      }
    }
  }
}