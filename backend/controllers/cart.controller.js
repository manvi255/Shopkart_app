import mongoose from "mongoose";

import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const populateCart = async (customer) => {
    await customer.populate({
        path: "cart.product",
        select: "name price image category stock description"
    });

    return customer.cart;
};

const getProductId = (value) => {
    return typeof value === "string" && mongoose.Types.ObjectId.isValid(value)
        ? value
        : null;
};

export const addToCart = async (req, res) => {
    try {
        const productId = getProductId(req.params.productId);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "A valid product ID is required"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customerId = req.user._id;
        const updateOptions = { new: true, runValidators: true };
        let customer = await Customer.findOneAndUpdate(
            {
                _id: customerId,
                cart: {
                    $elemMatch: {
                        product: product._id,
                        quantity: { $lt: product.stock }
                    }
                }
            },
            { $inc: { "cart.$.quantity": 1 } },
            updateOptions
        );

        if (!customer && product.stock > 0) {
            customer = await Customer.findOneAndUpdate(
                {
                    _id: customerId,
                    $nor: [{ cart: { $elemMatch: { product: product._id } } }]
                },
                { $push: { cart: { product: product._id, quantity: 1 } } },
                updateOptions
            );
        }

        if (!customer && product.stock > 0) {
            customer = await Customer.findOneAndUpdate(
                {
                    _id: customerId,
                    cart: {
                        $elemMatch: {
                            product: product._id,
                            quantity: { $lt: product.stock }
                        }
                    }
                },
                { $inc: { "cart.$.quantity": 1 } },
                updateOptions
            );
        }

        if (!customer) {
            const existingCustomer = await Customer.findById(customerId);

            if (!existingCustomer) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are available`
            });
        }

        const updatedCart = await populateCart(customer);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const cart = await populateCart(customer);

        return res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const productId = getProductId(req.params.productId);
        const quantity = req.body?.quantity;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "A valid product ID is required"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a whole number greater than zero"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are available`
            });
        }

        const customer = await Customer.findOneAndUpdate(
            {
                _id: req.user._id,
                cart: { $elemMatch: { product: product._id } }
            },
            { $set: { "cart.$.quantity": quantity } },
            { new: true, runValidators: true }
        );

        if (!customer) {
            const existingCustomer = await Customer.findById(req.user._id);

            if (!existingCustomer) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        const updatedCart = await populateCart(customer);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const productId = getProductId(req.params.productId);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "A valid product ID is required"
            });
        }

        const customer = await Customer.findOneAndUpdate(
            {
                _id: req.user._id,
                cart: { $elemMatch: { product: productId } }
            },
            { $pull: { cart: { product: productId } } },
            { new: true }
        );

        if (!customer) {
            const existingCustomer = await Customer.findById(req.user._id);

            if (!existingCustomer) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        const updatedCart = await populateCart(customer);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
