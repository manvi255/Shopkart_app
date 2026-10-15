import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            await api.post("/customers/register", formData);

            setSuccess("Registration successful!");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <Link to="/login" className="auth-brand" aria-label="ShopKart">shopkart</Link>
            <main className="auth-card">
                <p className="eyebrow">Join the edit</p>
                <h1>Create your account</h1>
                <p className="auth-intro">A better way to shop starts here.</p>

                <form onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span>Full name</span>
                        <input
                            type="text"
                            name="fullName"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Email address</span>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Phone number</span>
                        <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    {error && <p className="error-message form-message" role="alert">{error}</p>}
                    {success && <p className="success-message form-message" role="status">{success}</p>}
                    <button className="button-primary auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <button type="button" className="text-link" onClick={() => navigate("/login")}>
                        Sign in
                    </button>
                </p>
            </main>
        </div>
    );
}

export default Register;