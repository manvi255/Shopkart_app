import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError("");

            try {
                const params = {};

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (category) {
                    params.category = category;
                }

                const response = await api.get("/products", { params });
                const fetchedProducts = response.data.products || [];

                setProducts(fetchedProducts);

                if (!search && !category) {
                    const availableCategories = [
                        ...new Set(fetchedProducts.map((product) => product.category))
                    ];
                    setCategories(availableCategories);
                }
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Something went wrong while loading products."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, category]);

    return (
        <div>
            <Navbar />

            <main className="products-page">
                <header className="products-heading">
                    <div>
                        <p className="eyebrow">The ShopKart edit</p>
                        <h1>Find your next favourite.</h1>
                        <p>Considered pieces for everyday living.</p>
                    </div>
                    {!loading && !error && <p>{products.length} items</p>}
                </header>

                <div className="product-filters">
                    <input
                        type="search"
                        placeholder="Search products"
                        aria-label="Search products"
                        autoComplete="off"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        aria-label="Filter products by category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="">All categories</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <p className="product-status" role="status">
                        <span className="loading-spinner" aria-hidden="true" /> Loading products...
                    </p>
                )}
                {error && <p className="product-status error-message" role="alert">{error}</p>}
                {!loading && !error && products.length === 0 && (
                    <div className="wishlist-empty-state">
                        <h2>No products found</h2>
                        <p>Try a different search or choose another category.</p>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <section className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Products;
