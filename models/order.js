import mongoose from "mongoose";
import { Schema } from "mongoose";

const orderSchema = new Schema({
    items: [
        {
            product: {
                type: Object,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },
});

export default mongoose.model("Order", orderSchema);
