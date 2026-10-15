import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import formatCurrency from "../utils/formatCurrency";
import { useCart } from "../context/useCart";

function ProductDetails() {
    const { id } = useParams();
    const { addToCart, addingProductIds } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [wishlistMessage, setWishlistMessage] = useState("");
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load this product."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const isAvailable = product?.stock > 0;
    const isAddingToCart = product && addingProductIds.includes(product._id);

    const handleAddToCart = async () => {
        setActionError("");
        try {
            await addToCart(product._id);
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.message || "Unable to add this product to your cart."
            );
        }
    };

    const handleAddToWishlist = async () => {
        if (wishlistLoading) return;
        setWishlistLoading(true);
        setActionError("");
        setWishlistMessage("");
        try {
            await api.post("/wishlist", { productId: product._id });
            setWishlistMessage("Saved to your wishlist.");
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.message || "Unable to save this product. Please try again."
            );
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <div>
            <Navbar />

            <main className="product-details-page">
                {loading && <p className="product-status">Loading product...</p>}
                {error && <p className="product-status error-message">{error}</p>}

                {!loading && !error && product && (
                    <article className="product-details">
                        <img
                            className="product-details-image"
                            src={product.image}
                            alt={product.name}
                        />

                        <div className="product-details-content">
                            <p className="product-category">{product.category}</p>
                            <h1>{product.name}</h1>
                            <p className="product-description">{product.description}</p>
                            <p className="product-price">
                                {formatCurrency(product.price)}
                            </p>
                            <p className={isAvailable ? "stock available" : "stock unavailable"}>
                                {isAvailable
                                    ? `${product.stock} in stock`
                                    : "Out of stock"}
                            </p>
                            <div className="details-actions">
                                <button
                                    type="button"
                                    className="button-primary"
                                    onClick={handleAddToCart}
                                    disabled={!isAvailable || isAddingToCart}
                                >
                                    {isAddingToCart ? "Adding to bag..." : "Add to bag"}
                                </button>
                                <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={handleAddToWishlist}
                                    disabled={wishlistLoading}
                                >
                                    {wishlistLoading ? "Saving..." : "Add to wishlist"}
                                </button>
                            </div>
                            {actionError && <p className="error-message" role="alert">{actionError}</p>}
                            {wishlistMessage && <p className="success-message" role="status">{wishlistMessage}</p>}

                            <Link className="back-link" to="/products">
                                ← Back to shopping
                            </Link>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}

export default ProductDetails;
