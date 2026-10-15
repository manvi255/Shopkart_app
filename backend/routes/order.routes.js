import express from "express";

import {
    createPaymentOrder,
    getMyOrders,
    getOrderById,
    verifyPayment
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

export default router;
