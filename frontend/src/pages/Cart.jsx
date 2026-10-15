import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/useCart";
import formatCurrency from "../utils/formatCurrency";

function Cart() {
    const navigate = useNavigate();
    const { cartItems, loading, error, fetchCart } = useCart();
    const subtotal = useMemo(() => {
        return cartItems.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
        );
    }, [cartItems]);

    if (loading) {
        return (
            <div>
                <Navbar />
                <main className="cart-page">
                    <p className="cart-status">Loading your cart...</p>
                </main>
            </div>
        );
    }

    if (error && cartItems.length === 0) {
        return (
            <div>
                <Navbar />
                <main className="cart-page">
                    <div className="cart-empty-state">
                        <p className="error-message">Unable to load your cart.</p>
                        <button onClick={fetchCart} disabled={loading}>
                            {loading ? "Loading..." : "Try Again"}
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div>
                <Navbar />
                <main className="cart-page">
                    <div className="cart-empty-state">
                        <h1>Your cart is empty 🛒</h1>
                        <p>Looks like you haven't added anything yet.</p>
                        <button onClick={() => navigate("/products")}>Browse Products</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <main className="cart-page">
                <h1>My Cart</h1>

                {error && <p className="cart-error error-message">{error}</p>}
                {loading && <p className="cart-status">Updating your cart...</p>}

                <div className="cart-layout">
                    <section className="cart-items" aria-label="Cart items">
                        {cartItems.filter((item) => item.product).map((item) => (
                            <CartItem key={item.product._id} item={item} />
                        ))}
                    </section>

                    <aside className="order-summary">
                        <h2>Order Summary</h2>
                        <p>Items: {cartItems.reduce((total, item) => total + item.quantity, 0)}</p>
                        <p className="summary-subtotal">
                            Subtotal: {formatCurrency(subtotal)}
                        </p>
                        <button type="button" onClick={() => navigate("/checkout")}>
                            Proceed to Checkout
                        </button>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Cart;
