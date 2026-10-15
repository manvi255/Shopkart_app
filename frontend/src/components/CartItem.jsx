import { useState } from "react";
import { useCart } from "../context/useCart";
import formatCurrency from "../utils/formatCurrency";

function CartItem({ item }) {
    const {
        updateQuantity,
        removeFromCart,
        updatingProductIds,
        removingProductIds
    } = useCart();
    const [actionError, setActionError] = useState("");
    const product = item.product;
    const isUpdating = updatingProductIds.includes(product._id);
    const isRemoving = removingProductIds.includes(product._id);
    const busy = isUpdating || isRemoving;

    const changeQuantity = async (quantity) => {
        if (busy || quantity < 1 || quantity > product.stock) {
            return;
        }

        setActionError("");

        try {
            await updateQuantity(product._id, quantity);
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Unable to update this item's quantity."
            );
        }
    };

    const handleRemove = async () => {
        if (busy) {
            return;
        }

        setActionError("");

        try {
            await removeFromCart(product._id);
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Unable to remove this product from your cart."
            );
        }
    };

    return (
        <article className="cart-item">
            <img className="cart-item-image" src={product.image} alt={product.name} />

            <div className="cart-item-details">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="product-price">{formatCurrency(product.price)}</p>
                <p className={product.stock > 0 ? "stock available" : "stock unavailable"}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </p>

                <div className="cart-item-controls">
                    <button
                        type="button"
                        aria-label={`Decrease ${product.name} quantity`}
                        onClick={() => changeQuantity(item.quantity - 1)}
                        disabled={busy || item.quantity <= 1}
                    >
                        <span aria-hidden="true">−</span>
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                        type="button"
                        aria-label={`Increase ${product.name} quantity`}
                        onClick={() => changeQuantity(item.quantity + 1)}
                        disabled={busy || item.quantity >= product.stock}
                    >
                        <span aria-hidden="true">+</span>
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={handleRemove}
                        disabled={busy}
                    >
                        {isRemoving ? "Removing..." : "Remove"}
                    </button>
                </div>

                {actionError && <p className="error-message" role="alert">{actionError}</p>}
            </div>

            <p className="cart-item-total">
                {formatCurrency(Number(product.price) * item.quantity)}
            </p>
        </article>
    );
}

export default CartItem;
