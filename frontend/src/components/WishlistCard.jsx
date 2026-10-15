import { useNavigate } from "react-router-dom";
import { useState } from "react";
import formatCurrency from "../utils/formatCurrency";
import { useCart } from "../context/useCart";

function WishlistCard({ product, onRemove, isRemoving }) {
    const navigate = useNavigate();
    const { addToCart, addingProductIds } = useCart();
    const [removing, setRemoving] = useState(false);
    const [actionError, setActionError] = useState("");
    const isAdding = addingProductIds.includes(product._id);

    const handleAddToCart = async () => {
        setActionError("");
        try {
            await addToCart(product._id);
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Unable to add this product to your cart."
            );
        }
    };

    const handleRemove = async () => {
        if (!onRemove || removing || isRemoving) {
            return;
        }

        setRemoving(true);

        try {
            await onRemove(product._id);
        } finally {
            setRemoving(false);
        }
    };

    return (
        <article className="wishlist-card">
            <img
                className="wishlist-card-image"
                src={product.image}
                alt={product.name}
            />

            <div className="wishlist-card-content">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="product-price">{formatCurrency(product.price)}</p>
                <p className={product.stock > 0 ? "stock available" : "stock unavailable"}>
                    {product.stock > 0 ? "In stock" : "Out of stock"}
                </p>

                <div className="wishlist-actions">
                    <button type="button" className="secondary-button" onClick={() => navigate(`/products/${product._id}`)}>
                        View Details
                    </button>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock < 1}
                    >
                        {isAdding ? "Adding..." : "Add to Cart"}
                    </button>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={handleRemove}
                        disabled={removing || isRemoving}
                    >
                        {removing || isRemoving ? "Removing..." : "Remove from Wishlist"}
                    </button>
                </div>
                {actionError && <p className="error-message" role="alert">{actionError}</p>}
            </div>
        </article>
    );
}

export default WishlistCard;
