import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/customers/me");

                setUser(response.data);
            } catch {
                navigate("/login");
            }
        };

        fetchProfile();
    }, [navigate]);

    if (!user) {
        return (
            <main className="home-loading" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <p>Loading your account...</p>
            </main>
        );
    }

    return (
        <div className="home-page">
            <Navbar />

            <main className="home-content">
                <section className="home-hero">
                    <p className="eyebrow">A little more considered</p>
                    <h1>Good things, thoughtfully chosen.</h1>
                    <p>Welcome back, {user.fullName}. Find something made for your everyday.</p>
                    <button type="button" className="button-primary" onClick={() => navigate("/products")}>
                        Explore the collection
                    </button>
                </section>

                <section className="profile-panel" aria-labelledby="profile-heading">
                    <div>
                        <p className="eyebrow">Your account</p>
                        <h2 id="profile-heading">Profile details</h2>
                    </div>
                    <dl className="profile-details">
                        <div><dt>Name</dt><dd>{user.fullName}</dd></div>
                        <div><dt>Email</dt><dd>{user.email}</dd></div>
                        <div><dt>Phone</dt><dd>{user.phone}</dd></div>
                    </dl>
                    <button type="button" className="text-link" onClick={() => navigate("/orders")}>
                        View your orders <span aria-hidden="true">→</span>
                    </button>
                </section>
            </main>
        </div>
    );
}

export default Home;