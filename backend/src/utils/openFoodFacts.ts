import mongoose from "mongoose";
import Logger from "./logger";
import { productModel } from "../schemas/products.schema";

//https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=France&page_size=500&json=true&fields=code,product_name,brands,categories,nutriscore_grade,image_front_url,quantity,allergens_tags,ingredients_text_fr

/**
 * Load products from openfoodfacts api
 * @returns List of products
 */
export const getProducts = async () => {
    try {
        let products: any[] = [];
        for (let i = 1; i <= 5; i++) {
            const result = await fetch(
                `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=France&page_size=500&json=true&fields=code,product_name,brands,categories,nutriscore_grade,image_front_url,quantity,allergens_tags,ingredients_text_fr&page=${i}`,
            );
            const data = await result.json();

            Logger.warn(result);

            data.products.map((product: any) => {
                const { _id, ...rest } = product;
                rest.price = parseFloat((Math.random() * 5).toFixed(2));
                products.push(rest);
            });
        }
        return products;
    } catch (err) {
        Logger.error(err);
        throw Error("Erreur lors de la récupérations des produits");
    }
};

/**
 * Insert products from OpenFoodFacts in MongoDB
 */
export const insertProducts = async () => {
    try {
        const products = await getProducts();

        productModel.insertMany(products);
    } catch (err) {
        Logger.error(err);
        throw Error("Erreur lors de l'insertion des produits dans MongoDB");
    }
};

/**
 * Init import product from openfoodFact API
 */
export const openFoodFactsMigrationLocal = async () => {
    try {
        const data = await productModel.find({});

        if (data.length > 0) {
            Logger.info("Products already loaded no action needed");
            return;
        }
        await insertProducts();
        Logger.info("Insertion des données dans la collection product");
    } catch (err) {
        Logger.error(err);
        throw Error(
            "Erreur Lors du processus de migration des données OpenFoodFacts vers MongoDB",
        );
    }
};
