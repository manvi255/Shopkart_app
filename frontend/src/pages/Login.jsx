import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/useCart";

function Login() {
    const navigate = useNavigate();
    const { fetchCart } = useCart();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setError("");
        setSubmitting(true);

        try {
            await api.post("/customers/login", {
                email,
                password
            });

            await fetchCart();
            navigate("/home");

        } catch {
            setError("Invalid Credentials");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <Link to="/login" className="auth-brand" aria-label="ShopKart">shopkart</Link>
            <main className="auth-card">
                <p className="eyebrow">Welcome back</p>
                <h1>Sign in to your account</h1>
                <p className="auth-intro">Pick up right where you left off.</p>

                <form onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span>Email address</span>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    {error && <p className="error-message form-message" role="alert">{error}</p>}
                    <button className="button-primary auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-switch">
                    New to ShopKart?{" "}
                    <button type="button" className="text-link" onClick={() => navigate("/register")}>
                        Create an account
                    </button>
                </p>
            </main>
        </div>
    );
}

export default Login;