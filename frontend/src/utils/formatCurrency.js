const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

const formatCurrency = (amount) => currencyFormatter.format(Number(amount));

export default formatCurrency;
