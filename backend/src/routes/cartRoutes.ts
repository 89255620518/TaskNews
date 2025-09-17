import express, { Request, Response } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();
const cartController = new CartController();

// Get user's cart
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    await cartController.getCart(req, res);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add item to cart
router.post('/add', authenticate, async (req: Request, res: Response) => {
  try {
    await cartController.addToCart(req, res);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    await cartController.removeFromCart(req, res);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update cart item quantity
router.put('/update', authenticate, async (req: Request, res: Response) => {
  try {
    await cartController.updateCartItem(req, res);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear entire cart
router.delete('/clear', authenticate, async (req: Request, res: Response) => {
  try {
    await cartController.clearCart(req, res);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;