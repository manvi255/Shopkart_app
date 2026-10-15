import crypto from "node:crypto";
import mongoose from "mongoose";

import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { getRazorpayClient } from "../utils/razorpay.js";

const shippingFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode"
];

const validateShippingAddress = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return "Shipping address is required";
    }

    for (const field of shippingFields) {
        if (typeof value[field] !== "string" || !value[field].trim()) {
            return `${field} is required`;
        }
    }

    const phoneDigits = value.phone.replace(/\D/g, "");
    if (!/^\+?[0-9\s()-]+$/.test(value.phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
        return "Enter a valid phone number";
    }

    if (!/^\d{6}$/.test(value.pincode.trim())) {
        return "Pincode must contain exactly 6 digits";
    }

    return "";
};

const getSafeShippingAddress = (address) => {
    return Object.fromEntries(
        shippingFields.map((field) => [field, address[field].trim()])
    );
};

const isValidSignature = (orderId, paymentId, signature) => {
    if (typeof signature !== "string" || !/^[a-f\d]{64}$/i.test(signature)) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest();
    const providedSignature = Buffer.from(signature, "hex");

    return expectedSignature.length === providedSignature.length &&
        crypto.timingSafeEqual(expectedSignature, providedSignature);
};

const reserveOrderInventory = async (order) => {
    const quantitiesByProduct = new Map();

    for (const item of order.items) {
        const productId = item.product.toString();
        quantitiesByProduct.set(
            productId,
            (quantitiesByProduct.get(productId) || 0) + item.quantity
        );
    }

    for (const [productId, quantity] of quantitiesByProduct) {
        const reservedProduct = await Product.findOneAndUpdate(
            {
                _id: productId,
                stock: { $gte: quantity },
                "inventoryReservations.orderId": { $ne: order._id }
            },
            {
                $inc: { stock: -quantity },
                $push: {
                    inventoryReservations: {
                        orderId: order._id,
                        quantity
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (reservedProduct) {
            continue;
        }

        const product = await Product.findById(productId)
            .select("name stock inventoryReservations");
        const existingReservation = product?.inventoryReservations.find(
            (reservation) => reservation.orderId.toString() === order._id.toString()
        );

        if (existingReservation) {
            if (existingReservation.quantity !== quantity) {
                throw new Error("Order inventory reservation quantity does not match");
            }
            continue;
        }

        return {
            success: false,
            productName: product?.name || "A product in this order"
        };
    }

    return { success: true };
};

export const createPaymentOrder = async (req, res) => {
    try {
        const shippingError = validateShippingAddress(req.body?.shippingAddress);

        if (shippingError) {
            return res.status(400).json({
                success: false,
                message: shippingError
            });
        }

        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock"
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!customer.cart.length) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = cartItem.product;

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available"
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });
            totalAmount += product.price * cartItem.quantity;
        }

        totalAmount = Number(totalAmount.toFixed(2));
        const razorpayAmount = Math.round(totalAmount * 100);

        if (razorpayAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Order total must be at least one paise"
            });
        }

        const order = await Order.create({
            customer: customer._id,
            items: orderItems,
            shippingAddress: getSafeShippingAddress(req.body.shippingAddress),
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        let razorpayOrder;

        try {
            const razorpay = getRazorpayClient();
            razorpayOrder = await razorpay.orders.create({
                amount: razorpayAmount,
                currency: "INR",
                receipt: order._id.toString()
            });
        } catch (error) {
            order.paymentStatus = "FAILED";
            await order.save();
            console.error("Razorpay order creation failed:", error.message);

            return res.status(502).json({
                success: false,
                message: "Unable to create payment order. Please try again."
            });
        }

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Create payment order failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create your order"
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
        } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ShopKart order ID"
            });
        }

        if (
            typeof razorpayOrderId !== "string" ||
            typeof razorpayPaymentId !== "string" ||
            typeof razorpaySignature !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are incomplete"
            });
        }

        let order = await Order.findOne({
            _id: shopKartOrderId,
            customer: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        if (!isValidSignature(
            order.razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        )) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        if (order.paymentStatus === "PAID") {
            if (order.razorpayPaymentId !== razorpayPaymentId) {
                return res.status(409).json({
                    success: false,
                    message: "This order has already been paid"
                });
            }
        } else if (order.paymentStatus === "PENDING") {
            order = await Order.findOneAndUpdate(
                {
                    _id: order._id,
                    customer: req.user._id,
                    paymentStatus: "PENDING",
                    razorpayOrderId: order.razorpayOrderId
                },
                {
                    $set: {
                        paymentStatus: "PAID",
                        status: "PLACED",
                        razorpayPaymentId
                    }
                },
                { new: true, runValidators: true }
            );

            if (!order) {
                order = await Order.findOne({
                    _id: shopKartOrderId,
                    customer: req.user._id
                });
            }

            if (
                !order ||
                order.paymentStatus !== "PAID" ||
                order.razorpayOrderId !== razorpayOrderId ||
                order.razorpayPaymentId !== razorpayPaymentId
            ) {
                return res.status(409).json({
                    success: false,
                    message: "This order cannot be marked as paid"
                });
            }
        } else {
            return res.status(409).json({
                success: false,
                message: "This order cannot be verified"
            });
        }

        if (order.inventoryStatus !== "RESERVED") {
            order.inventoryStatus = "RESERVING";
            await order.save();

            const reservation = await reserveOrderInventory(order);

            if (!reservation.success) {
                order.inventoryStatus = "REVIEW";
                await order.save();

                return res.status(409).json({
                    success: false,
                    message: `Payment was verified, but inventory for ${reservation.productName} needs review. Please retry or contact support.`
                });
            }

            order.inventoryStatus = "RESERVED";
            await order.save();
        }

        const customer = await Customer.findByIdAndUpdate(req.user._id, {
            $set: { cart: [] }
        });

        if (!customer) {
            throw new Error("Authenticated customer was not found while clearing cart");
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed",
            order
        });
    } catch (error) {
        console.error("Payment verification failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment"
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Load orders failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load your orders"
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Load order failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load this order"
        });
    }
};
