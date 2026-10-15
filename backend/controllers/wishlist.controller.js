import mongoose from "mongoose";

import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const currentWishlist = Array.isArray(customer.wishlist)
            ? customer.wishlist
            : [];

        const alreadyExists = currentWishlist.some(
            (wishlistProductId) => wishlistProductId.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        customer.wishlist = [...currentWishlist, product._id];
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock description"
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const wishlistProducts = Array.isArray(customer.wishlist)
            ? customer.wishlist
            : [];

        return res.status(200).json({
            success: true,
            count: wishlistProducts.length,
            wishlist: wishlistProducts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const currentWishlist = Array.isArray(customer.wishlist)
            ? customer.wishlist
            : [];

        const existsInWishlist = currentWishlist.some(
            (wishlistProductId) => wishlistProductId.toString() === productId
        );

        if (!existsInWishlist) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        customer.wishlist = currentWishlist.filter(
            (wishlistProductId) => wishlistProductId.toString() !== productId
        );

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
