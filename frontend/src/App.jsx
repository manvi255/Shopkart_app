import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import api from "./services/api";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

function RootRedirect() {
    const [destination, setDestination] = useState("");
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        api.get("/customers/me")
            .then(() => {
                if (isMounted) {
                    setDestination("/home");
                }
            })
            .catch((error) => {
                if (!isMounted) {
                    return;
                }

                if (error.response?.status === 401) {
                    setDestination("/login");
                } else {
                    setHasError(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (destination) {
        return <Navigate to={destination} replace />;
    }

    if (hasError) {
        return (
            <main className="home-loading" aria-live="polite">
                <p>We couldn&apos;t verify your sign-in. Check your connection and try again.</p>
                <button className="button-primary" type="button" onClick={() => window.location.reload()}>
                    Retry
                </button>
                {" "}
                <Link to="/login">Go to sign in</Link>
            </main>
        );
    }

    return (
        <main className="home-loading" aria-live="polite">
            <span className="loading-spinner" aria-hidden="true" />
            <p>Checking your account...</p>
        </main>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:id" element={<OrderSuccess />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;