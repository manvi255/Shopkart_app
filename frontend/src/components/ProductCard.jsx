import { useState } from "react";
import formatCurrency from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useCart } from "../context/useCart";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, addingProductIds } = useCart();
    const isAvailable = product.stock > 0;
    const [cartError, setCartError] = useState("");
    const isAddingToCart = addingProductIds.includes(product._id);
    const [wishlistState, setWishlistState] = useState({
        loading: false,
        added: false,
        error: ""
    });

    const handleWishlistClick = async () => {
        if (wishlistState.loading) {
            return;
        }

        setWishlistState({
            loading: true,
            added: false,
            error: ""
        });

        try {
            await api.post("/wishlist", {
                productId: product._id
            });

            setWishlistState({
                loading: false,
                added: true,
                error: ""
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to save product. Please try again.";

            setWishlistState({
                loading: false,
                added: false,
                error: message
            });
        }
    };

    const handleAddToCart = async () => {
        setCartError("");

        try {
            await addToCart(product._id);
        } catch (error) {
            setCartError(
                error.response?.data?.message || "Unable to add this product to your cart."
            );
        }
    };

    return (
        <article className="product-card">
            <button
                className="product-image-link"
                type="button"
                onClick={() => navigate(`/products/${product._id}`)}
                aria-label={`View ${product.name}`}
            >
                <img
                    className="product-card-image"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                />
            </button>

            <div className="product-card-content">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="product-price">{formatCurrency(product.price)}</p>
                <p className={`stock product-card-stock ${isAvailable ? "available" : "unavailable"}`}>
                    {isAvailable ? "In stock" : "Out of stock"}
                </p>

                <div className="product-card-actions">
                    <button
                        className="cart-button"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || product.stock < 1}
                    >
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </button>

                    <button
                        className="wishlist-button secondary-button"
                        type="button"
                        onClick={handleWishlistClick}
                        disabled={wishlistState.loading}
                    >
                        {wishlistState.loading
                            ? "Saving..."
                            : wishlistState.added
                                ? "Saved"
                                : "Save"}
                    </button>
                </div>

                {cartError && <p className="wishlist-message error-message" role="alert">{cartError}</p>}
                {wishlistState.error && (
                    <p className="wishlist-message error-message" role="alert">
                        {wishlistState.error}
                    </p>
                )}
            </div>
        </article>
    );
}

export default ProductCard;
