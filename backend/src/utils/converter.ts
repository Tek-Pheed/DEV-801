import { IProducts } from "../models/products.model";

/**
 * Convert products from interface to product for stripe API
 * @param {IProducts[]} products list of products
 * @returns
 */
export async function convertIntoStripeProduct(products: IProducts[]) {
    const items: any[] = [];

    products.map((product) => [
        items.push({
            quantity: product.quantity,
            price_data: {
                currency: product.currency,
                product_data: {
                    name: product.name,
                    images: [product.imageURL],
                },
                unit_amount: product.price,
            },
        }),
    ]);
    return items;
}
