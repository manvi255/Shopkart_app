import Razorpay from "razorpay";

let razorpayClient;

export const getRazorpayClient = () => {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

    if (
        !RAZORPAY_KEY_ID?.startsWith("rzp_test_") ||
        !RAZORPAY_KEY_SECRET
    ) {
        throw new Error("Valid Razorpay test credentials are not configured");
    }

    if (!razorpayClient) {
        razorpayClient = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET
        });
    }

    return razorpayClient;
};
