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
    brands: { type: String, required: true },
    categories: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    image_front_url: { type: String, required: true },
    ingredients_text_fr: { type: String, required: true },
    nutriscore_grade: { type: String, required: true },
    product_name: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: Number, required: false },
    allergens_tags: { type: [String], required: false },
});

export const productModel = mongoose.model(
    "products",
    productsSchema,
    "products",
);
