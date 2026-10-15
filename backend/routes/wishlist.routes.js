import express from "express";

import {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.delete("/", protect, removeFromWishlist);

export default router;
