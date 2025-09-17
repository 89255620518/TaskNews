const { CartController } = require('../controllers/cartController.cjs');
const { authenticate } = require('../middlewares/authMiddleware.cjs');
const express = require('express');

const router = express.Router();
const cartController = new CartController();

router.get('/', authenticate, async (req, res) => {
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

router.post('/add', authenticate, async (req, res) => {
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

router.delete('/remove/:productId', authenticate, async (req, res) => {
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
router.put('/update', authenticate, async (req, res) => {
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
router.delete('/clear', authenticate, async (req, res) => {
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

module.exports = router;