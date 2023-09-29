import fs from "fs";
import path from "path";
import __dirname from "../../../utils.js";

export default class CartManager {
    constructor() {
        this.path = path.join(__dirname, "/dao/fileSystem/db/carts.json");
        this.carts = [];
        this.readJson();
    }

    readJson = async () => {
        if (fs.existsSync(this.path)) {
            const data = fs.readFileSync(this.path, "utf-8");
            this.carts = JSON.parse(data);
        }
    };

    saveJson = async () => {
        const data = JSON.stringify(this.carts, null, 4);
        fs.writeFileSync(this.path, data);
    };

    addCart = async () => {
        const cart = {
            id: null,
            products: [],
        };

        if (this.carts.length === 0) {
            cart.id = 1;
        } else {
            cart.id = this.carts[this.carts.length - 1].id + 1;
        }
        this.carts.push(cart);
        await this.saveJson();
    };

    getCartById = async (id) => {
        this.readJson();
        const cart = this.carts.find((cart) => cart.id === id);
        return cart;
    };

    addProductToCart = async (cid, pid) => {
        const cartIndex = this.carts.findIndex((cart) => cart.id === cid);

        if (cartIndex !== -1) {
            const cart = this.carts[cartIndex];
            const existingProductIndex = cart.products.findIndex(
                (product) => product.product === pid
            );

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += 1;
            } else {
                const product = {
                    product: pid,
                    quantity: 1,
                };
                cart.products.push(product);
            }
            await this.saveJson();
        }
    };
}
