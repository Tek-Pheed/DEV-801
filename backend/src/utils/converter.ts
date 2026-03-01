import { IProducts } from "../schemas/products.schema";

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

/**
 * Convert products from interface to product for paypal API
 * @param {IProducts[]} products list of products
 * @returns
 */
export async function convertIntoPaypalProduct(products: IProducts[]) {
    const items: any[] = [];

    products.map((product) => [
        items.push({
            name: product.name,
            unit_amount: {
                currency_code: product.currency,
                value: `${product.price}`,
            },
            quantity: `${product.quantity}`,
            image_url: `${product.imageURL}`,
        }),
    ]);
    return items;
}

/**
 * Make sum of price of total product
 * @param {IProducts[]} products list of products
 * @returns int
 */
export async function sumOfProducts(products: IProducts[]) {
    let total: number = 0;

    products.map((product) => {
        total += product.price * product.quantity;
    });
    return total;
}
