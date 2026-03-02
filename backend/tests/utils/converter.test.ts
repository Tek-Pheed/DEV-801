import {
    convertIntoStripeProduct,
    convertIntoPaypalProduct,
    sumOfProducts,
} from "../../src/utils/converter";
import { IProducts } from "../../src/schemas/products.schema";

describe("convertIntoStripeProduct", () => {
    it("should convert a single product into Stripe format", async () => {
        const products: IProducts[] = [
            {
                name: "Croissant",
                price: 150,
                quantity: 2,
                currency: "EUR",
                imageURL: "https://example.com/croissant.jpg",
            },
        ];

        const result = await convertIntoStripeProduct(products);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            quantity: 2,
            price_data: {
                currency: "EUR",
                product_data: {
                    name: "Croissant",
                    images: ["https://example.com/croissant.jpg"],
                },
                unit_amount: 150,
            },
        });
    });

    it("should convert multiple products into Stripe format", async () => {
        const products: IProducts[] = [
            {
                name: "Pain",
                price: 100,
                quantity: 1,
                currency: "EUR",
                imageURL: "https://example.com/pain.jpg",
            },
            {
                name: "Baguette",
                price: 120,
                quantity: 3,
                currency: "EUR",
                imageURL: "https://example.com/baguette.jpg",
            },
        ];

        const result = await convertIntoStripeProduct(products);

        expect(result).toHaveLength(2);
        expect(result[0].price_data.product_data.name).toBe("Pain");
        expect(result[1].price_data.product_data.name).toBe("Baguette");
        expect(result[1].quantity).toBe(3);
    });

    it("should return an empty array for no products", async () => {
        const result = await convertIntoStripeProduct([]);
        expect(result).toEqual([]);
    });
});

describe("convertIntoPaypalProduct", () => {
    it("should convert a single product into PayPal format", async () => {
        const products: IProducts[] = [
            {
                name: "Croissant",
                price: 150,
                quantity: 2,
                currency: "EUR",
                imageURL: "https://example.com/croissant.jpg",
            },
        ];

        const result = await convertIntoPaypalProduct(products);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            name: "Croissant",
            unit_amount: {
                currency_code: "EUR",
                value: "150",
            },
            quantity: "2",
            image_url: "https://example.com/croissant.jpg",
        });
    });

    it("should convert multiple products into PayPal format", async () => {
        const products: IProducts[] = [
            {
                name: "Pain",
                price: 100,
                quantity: 1,
                currency: "EUR",
                imageURL: "https://example.com/pain.jpg",
            },
            {
                name: "Baguette",
                price: 250,
                quantity: 5,
                currency: "USD",
                imageURL: "https://example.com/baguette.jpg",
            },
        ];

        const result = await convertIntoPaypalProduct(products);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Pain");
        expect(result[1].unit_amount.currency_code).toBe("USD");
        expect(result[1].quantity).toBe("5");
    });

    it("should return an empty array for no products", async () => {
        const result = await convertIntoPaypalProduct([]);
        expect(result).toEqual([]);
    });
});

describe("sumOfProducts", () => {
    it("should calculate the sum of a single product", async () => {
        const products: IProducts[] = [
            {
                name: "Croissant",
                price: 150,
                quantity: 2,
                currency: "EUR",
                imageURL: "https://example.com/croissant.jpg",
            },
        ];

        const result = await sumOfProducts(products);
        expect(result).toBe(300);
    });

    it("should calculate the sum of multiple products", async () => {
        const products: IProducts[] = [
            {
                name: "Pain",
                price: 100,
                quantity: 1,
                currency: "EUR",
                imageURL: "",
            },
            {
                name: "Baguette",
                price: 120,
                quantity: 3,
                currency: "EUR",
                imageURL: "",
            },
        ];

        const result = await sumOfProducts(products);
        expect(result).toBe(100 + 360);
    });

    it("should return 0 for an empty array", async () => {
        const result = await sumOfProducts([]);
        expect(result).toBe(0);
    });

    it("should handle quantity of 0", async () => {
        const products: IProducts[] = [
            {
                name: "Pain",
                price: 100,
                quantity: 0,
                currency: "EUR",
                imageURL: "",
            },
        ];

        const result = await sumOfProducts(products);
        expect(result).toBe(0);
    });
});
