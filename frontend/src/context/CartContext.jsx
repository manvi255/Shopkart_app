import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../services/api";
import CartContext from "./cartContext";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || fallback;
};

const getValidCartItems = (items) => {
    return (Array.isArray(items) ? items : []).filter((item) => item.product);
};

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState("");
    const [addingProductIds, setAddingProductIds] = useState([]);
    const [updatingProductIds, setUpdatingProductIds] = useState([]);
    const [removingProductIds, setRemovingProductIds] = useState([]);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/cart");
            setCartItems(getValidCartItems(response.data.cart));
            return true;
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Unable to load your cart."));
            return false;
        } finally {
            setLoading(false);
            setHasLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = useCallback(async (productId) => {
        setAddingProductIds((current) => [...current, productId]);
        setError("");

        try {
            const response = await api.post(`/cart/${productId}`);
            setCartItems(getValidCartItems(response.data.cart));
            return response.data.cart;
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Unable to add this product to your cart."));
            throw requestError;
        } finally {
            setAddingProductIds((current) => current.filter((id) => id !== productId));
        }
    }, []);

    const updateQuantity = useCallback(async (productId, quantity) => {
        setUpdatingProductIds((current) => [...current, productId]);
        setError("");

        try {
            const response = await api.patch(`/cart/${productId}`, { quantity });
            setCartItems(getValidCartItems(response.data.cart));
            return response.data.cart;
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Unable to update the cart quantity."));
            throw requestError;
        } finally {
            setUpdatingProductIds((current) => current.filter((id) => id !== productId));
        }
    }, []);

    const removeFromCart = useCallback(async (productId) => {
        setRemovingProductIds((current) => [...current, productId]);
        setError("");

        try {
            const response = await api.delete(`/cart/${productId}`);
            setCartItems(getValidCartItems(response.data.cart));
            return response.data.cart;
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Unable to remove this product from your cart."));
            throw requestError;
        } finally {
            setRemovingProductIds((current) => current.filter((id) => id !== productId));
        }
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setError("");
        setHasLoaded(false);
    }, []);

    const totalQuantity = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        loading,
        hasLoaded,
        error,
        addingProductIds,
        updatingProductIds,
        removingProductIds,
        totalQuantity,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    }), [
        cartItems,
        loading,
        hasLoaded,
        error,
        addingProductIds,
        updatingProductIds,
        removingProductIds,
        totalQuantity,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    ]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
