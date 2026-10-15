import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [removeError, setRemoveError] = useState("");
    const [removingProductId, setRemovingProductId] = useState("");

    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        setLoadError("");

        try {
            const response = await api.get("/wishlist");
            setWishlist(response.data.wishlist || []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Something went wrong. We couldn't load your wishlist.";

            setLoadError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemoveProduct = async (productId) => {
        if (removingProductId) {
            return;
        }

        setRemovingProductId(productId);

        setRemoveError("");

        try {
            await api.delete("/wishlist", {
                data: { productId }
            });

            setWishlist((currentWishlist) => {
                return currentWishlist.filter((product) => product._id !== productId);
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to remove this product from your wishlist.";

            setRemoveError(message);
        } finally {
            setRemovingProductId("");
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <main className="wishlist-page">
                    <p className="wishlist-status">Loading your wishlist...</p>
                </main>
            </div>
        );
    }

    if (loadError) {
        return (
            <div>
                <Navbar />
                <main className="wishlist-page">
                    <div className="wishlist-empty-state">
                        <p className="wishlist-status error-message">
                            Something went wrong.
                        </p>
                        <p className="wishlist-empty-text">
                            We couldn't load your wishlist.
                        </p>
                        <button onClick={fetchWishlist}>Try Again</button>
                    </div>
                </main>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div>
                <Navbar />
                <main className="wishlist-page">
                    <div className="wishlist-empty-state">
                        <div className="wishlist-empty-icon">❤️</div>
                        <h1>Your wishlist is empty</h1>
                        <p className="wishlist-empty-text">
                            Save products you love and find them here later.
                        </p>
                        <button onClick={() => navigate("/products")}>Browse Products</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <main className="wishlist-page">
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>
                    <p>{wishlist.length} products saved</p>
                </div>

                {removeError && (
                    <p className="wishlist-message error-message">{removeError}</p>
                )}

                <section className="wishlist-grid">
                    {wishlist.map((product) => (
                        <WishlistCard
                            key={product._id}
                            product={product}
                            onRemove={handleRemoveProduct}
                            isRemoving={removingProductId === product._id}
                        />
                    ))}
                </section>
            </main>
        </div>
    );
}

export default Wishlist;
