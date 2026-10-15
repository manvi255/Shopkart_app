import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../services/api";
import formatCurrency from "../utils/formatCurrency";

function OrderDetails() {
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
                "Unable to load this order."
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
            <main className="order-page">
                {loading && <p>Loading order details...</p>}
                {error && (
                    <div>
                        <p className="error-message">{error}</p>
                        <button onClick={fetchOrder} disabled={loading}>Try Again</button>
                    </div>
                )}
                {!loading && !error && order && (
                    <>
                        <h1>Order Details</h1>
                        <p>Order ID: {order._id}</p>
                        <p>Order date: {new Date(order.createdAt).toLocaleString()}</p>
                        <p>Payment status: {order.paymentStatus}</p>
                        <p>Order status: {order.status}</p>

                        <section className="shipping-address">
                            <h2>Shipping Address</h2>
                            <p>{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.phone}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                {order.shippingAddress.pincode}
                            </p>
                        </section>

                        <section className="order-products">
                            <h2>Products</h2>
                            {order.items.map((item, index) => (
                                <article className="order-product" key={`${item.product}-${index}`}>
                                    {item.image && (
                                        <img src={item.image} alt={item.name} />
                                    )}
                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>Price at purchase: {formatCurrency(item.price)}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>
                                            Line total: {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <h2>Total: {formatCurrency(order.totalAmount)}</h2>
                    </>
                )}
            </main>
        </div>
    );
}

export default OrderDetails;
