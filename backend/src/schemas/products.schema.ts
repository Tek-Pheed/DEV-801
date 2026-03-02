import mongoose, { Schema } from "mongoose";

/**
 * IProducts interface for route post
 * @type {IProducts}
 */
export interface IProducts {
    name: string;
    price: number;
    quantity: number;
    currency: string;
    imageURL: string;
}

export const productSchema = new Schema<IProducts>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    currency: { type: String, required: true, default: "EUR" },
    imageURL: { type: String, required: false },
});

// OPENFOODFACT SCHEMA
const productsSchema = new mongoose.Schema({
    brands: { type: String, required: false },
    categories: { type: String, required: false },
    code: { type: String, required: true, unique: false },
    image_front_url: { type: String, required: false },
    ingredients_text_fr: { type: String, required: false },
    nutriscore_grade: { type: String, required: false },
    product_name: { type: String, required: false },
    quantity: { type: String, required: false },
    price: { type: Number, required: false },
    allergens_tags: { type: [String], required: false },
});

export const productModel = mongoose.model(
    "products",
    productsSchema,
    "products",
);
