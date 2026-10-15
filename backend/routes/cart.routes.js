import express from "express";

import {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:productId", protect, addToCart);
router.get("/", protect, getCart);
router.patch("/:productId", protect, updateCartQuantity);
router.delete("/:productId", protect, removeFromCart);

export default router;
