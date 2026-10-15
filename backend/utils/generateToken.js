// Generate JWT token
import jwt from "jsonwebtoken";

const generateToken = (customerId) => {
    const token = jwt.sign(
        { customerId: customerId },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return token;
};

export default generateToken;
