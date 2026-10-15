import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../services/api";
import formatCurrency from "../utils/formatCurrency";

function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data.order);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load your order confirmation."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    return (
        <div>
            <Navbar />
            <main className="order-page order-success-page">
                {loading && <p>Loading your order confirmation...</p>}
                {error && (
                    <div>
                        <p className="error-message">{error}</p>
                        <button onClick={fetchOrder}>Try Again</button>
                    </div>
                )}
                {!loading && !error && order && (
                    <>
                        <h1>Order Placed Successfully</h1>
                        <p>Order ID: {order._id}</p>
                        <p>Total: {formatCurrency(order.totalAmount)}</p>
                        <p>Status: {order.status}</p>
                        <div className="order-page-actions">
                            <Link className="back-link" to="/orders">View My Orders</Link>
                            <Link className="back-link" to="/products">Continue Shopping</Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default OrderSuccess;
