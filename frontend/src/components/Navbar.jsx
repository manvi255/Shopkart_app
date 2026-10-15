import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { useCart } from "../context/useCart";

function Navbar() {
    const navigate = useNavigate();
    const { totalQuantity, clearCart } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        setLogoutError("");

        try {
            await api.post("/customers/logout");

            clearCart();
            navigate("/login");
        } catch (error) {
            setLogoutError(
                error.response?.data?.message || "Unable to log out. Please try again."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <header className="site-header">
            <nav className="main-nav" aria-label="Main navigation">
                <Link className="brand" to="/home" aria-label="ShopKart home">
                    <span className="brand-mark" aria-hidden="true">S</span>
                    <span>shopkart</span>
                </Link>

                <button
                    className="menu-toggle"
                    type="button"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                </button>

                <div className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
                    <NavLink to="/home" onClick={() => setMenuOpen(false)}>Home</NavLink>
                    <NavLink to="/products" onClick={() => setMenuOpen(false)}>Shop</NavLink>
                    <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</NavLink>
                    <NavLink to="/orders" onClick={() => setMenuOpen(false)}>My orders</NavLink>
                    <NavLink className="cart-nav-link" to="/cart" onClick={() => setMenuOpen(false)}>
                        Bag <span className="nav-count">{totalQuantity}</span>
                    </NavLink>
                    <button type="button" onClick={handleLogout} disabled={loggingOut}>
                        {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </nav>
            {logoutError && <p className="nav-error" role="alert">{logoutError}</p>}
        </header>
    );
}

export default Navbar;