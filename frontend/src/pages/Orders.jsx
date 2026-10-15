import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../services/api";
import formatCurrency from "../utils/formatCurrency";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/orders");
            setOrders(response.data.orders || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load your orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div>
            <Navbar />
            <main className="order-page">
                <h1>My Orders</h1>

                {loading && <p>Loading your orders...</p>}
                {error && (
                    <div>
                        <p className="error-message">{error}</p>
                        <button onClick={fetchOrders} disabled={loading}>Try Again</button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="order-empty-state">
                        <p>You have not placed any orders yet.</p>
                        <Link className="back-link" to="/products">Start Shopping</Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <section className="orders-list">
                        {orders.map((order) => (
                            <article className="order-list-card" key={order._id}>
                                <h2>Order {order._id}</h2>
                                <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                                <ul>
                                    {order.items.map((item) => (
                                        <li key={`${order._id}-${item.product}`}>
                                            {item.name} × {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                                <p>Total: {formatCurrency(order.totalAmount)}</p>
                                <p>Status: {order.status}</p>
                                <Link className="back-link" to={`/orders/${order._id}`}>
                                    View Details
                                </Link>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Orders;
