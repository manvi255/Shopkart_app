import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useCart } from "../context/useCart";
import api from "../services/api";
import formatCurrency from "../utils/formatCurrency";

const initialShippingAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
};

const loadRazorpay = () => {
    if (window.Razorpay) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(Boolean(window.Razorpay));
        script.onerror = () => {
            script.remove();
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, loading, clearCart } = useCart();
    const [shippingAddress, setShippingAddress] = useState(initialShippingAddress);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState("");
    const subtotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            navigate("/cart", { replace: true });
        }
    }, [cartItems.length, loading, navigate]);

    const validateShipping = () => {
        const errors = {};

        Object.entries(shippingAddress).forEach(([field, value]) => {
            if (!value.trim()) {
                errors[field] = "This field is required.";
            }
        });

        const phoneDigits = shippingAddress.phone.replace(/\D/g, "");
        if (
            shippingAddress.phone.trim() &&
            (!/^\+?[0-9\s()-]+$/.test(shippingAddress.phone) ||
                phoneDigits.length < 10 ||
                phoneDigits.length > 15)
        ) {
            errors.phone = "Enter a valid phone number.";
        }

        if (shippingAddress.pincode.trim() && !/^\d{6}$/.test(shippingAddress.pincode.trim())) {
            errors.pincode = "Pincode must contain exactly 6 digits.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (processing || !validateShipping()) {
            return;
        }

        setProcessing(true);
        setStatus("Creating your payment order...");

        try {
            const orderResponse = await api.post("/orders/create-payment-order", {
                shippingAddress
            });
            const paymentOrder = orderResponse.data;

            setStatus("Loading secure payment checkout...");
            const razorpayLoaded = await loadRazorpay();

            if (!razorpayLoaded) {
                throw new Error("Unable to load Razorpay Checkout. Please try again.");
            }

            const payment = new window.Razorpay({
                key: paymentOrder.key,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: paymentOrder.razorpayOrderId,
                prefill: {
                    name: shippingAddress.fullName,
                    contact: shippingAddress.phone
                },
                handler: async (paymentResponse) => {
                    setStatus("Verifying your payment...");

                    try {
                        await api.post("/orders/verify-payment", {
                            shopKartOrderId: paymentOrder.shopKartOrderId,
                            ...paymentResponse
                        });

                        clearCart();
                        navigate(`/order-success/${paymentOrder.shopKartOrderId}`);
                    } catch (verificationError) {
                        setError(
                            verificationError.response?.data?.message ||
                            "Payment verification failed. Your cart has not been cleared."
                        );
                        setStatus("");
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setStatus("");
                        setProcessing(false);
                    }
                }
            });

            payment.on("payment.failed", (paymentFailure) => {
                setError(
                    paymentFailure.error?.description ||
                    "Payment failed. Your cart is unchanged; you can try again."
                );
                setStatus("");
                setProcessing(false);
            });

            payment.open();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Unable to start checkout. Please try again."
            );
            setStatus("");
            setProcessing(false);
        }
    };

    if (loading || cartItems.length === 0) {
        return (
            <div>
                <Navbar />
                <main className="checkout-page">
                    <p className="product-status">Loading checkout...</p>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <main className="checkout-page">
                <h1>Checkout</h1>

                <div className="checkout-layout">
                    <form className="shipping-form" onSubmit={handleSubmit} noValidate>
                        <h2>Shipping Details</h2>
                        {[
                            ["fullName", "Full Name"],
                            ["phone", "Phone"],
                            ["addressLine1", "Address Line"],
                            ["city", "City"],
                            ["state", "State"],
                            ["pincode", "Pincode"]
                        ].map(([name, label]) => (
                            <label className="checkout-field" key={name}>
                                <span>{label}</span>
                                <input
                                    name={name}
                                    type={name === "phone" ? "tel" : "text"}
                                    value={shippingAddress[name]}
                                    onChange={handleChange}
                                    autoComplete={name === "addressLine1" ? "street-address" : name}
                                    aria-invalid={Boolean(fieldErrors[name])}
                                    aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
                                />
                                {fieldErrors[name] && (
                                    <span className="error-message" id={`${name}-error`}>
                                        {fieldErrors[name]}
                                    </span>
                                )}
                            </label>
                        ))}

                        {error && <p className="error-message checkout-error" role="alert">{error}</p>}
                        {status && <p className="checkout-status" role="status">{status}</p>}

                        <button type="submit" disabled={processing}>
                            {processing ? "Processing..." : "Place Order"}
                        </button>
                    </form>

                    <aside className="order-summary">
                        <h2>Order Summary</h2>
                        {cartItems.map((item) => (
                            <div className="checkout-summary-item" key={item.product._id}>
                                <span>{item.product.name} × {item.quantity}</span>
                                <span>
                                    {formatCurrency(item.product.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                        <p className="summary-subtotal">Total: {formatCurrency(subtotal)}</p>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Checkout;
