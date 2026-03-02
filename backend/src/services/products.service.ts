import mongoose from "mongoose";
import { productModel } from "../schemas/products.schema";
import Logger from "../utils/logger";

class ProductsService {
    /**
     * Fetch all products from database
     * @returns list of products
     */
    async getProducts() {
        try {
            const data = await productModel.find({});
            return data;
        } catch (err) {
            Logger.error(err);
            throw Error("Erreur lors de la récupération des produits : " + err);
        }
    }

    /**
     * Get one specific product by the unique identifier
     * @param {string} productID Unique identifier of product
     * @returns product information
     */
    async getProductByID(productID: string) {
        try {
            const data = await productModel.find({
                _id: productID,
            });
            return data;
        } catch (err) {
            Logger.error(err);
            throw Error("Erreur lors de la récupération des produits : " + err);
        }
    }

    /**
     * Get one specific product by code
     * @param {string} code code of the product
     * @returns product information
     */
    async getProductByCode(code: string) {
        try {
            const data = await productModel.findOne({ code });
            return data;
        } catch (err) {
            Logger.error(err);
            throw Error("Erreur lors de la récupération du produit par code : " + err);
        }
    }
}

export default ProductsService;
