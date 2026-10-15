import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            validate: {
                validator: (value) => value > 0,
                message: "Price must be greater than 0"
            }
        },

        category: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: true
        },

        stock: {
            type: Number,
            required: true,
            min: 0
        },

        inventoryReservations: [{
            _id: false,
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }]
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;