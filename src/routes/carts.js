import { Router } from "express";
import CartManager from "../dao/mongoDb/CartManager.js";
import ProductManager from "../dao/mongoDb/ProductManager.js";

const router = Router();

const cartManager = new CartManager();
const productManager = new ProductManager();

router.post("/", async (req, res) => {
    const cart = await cartManager.addCart();

    res.send({ status: "success", message: `Creado con el id: ${cart._id}` });
});

router.get("/", async (req, res) => {
    const carts = await cartManager.getCarts();

    if (carts.length == 0) {
        res.status(404).send({
            status: "error",
            message: `No existen carritos`,
        });
        return;
    }

    res.send(carts);
});

router.get("/:cid", async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);

    if (!cart) {
        res.status(404).send({
            status: "error",
            message: `No existe el carrito con el id ${cid}`,
        });
        return;
    } else if (cart.products.length == 0) {
        res.send("El carrito esta vacío");
    } else {
        res.send(cart);
    }
});

router.post("/:cid/product/:pid", async (req, res) => {
    const pid = req.params.pid;
    const cid = req.params.cid;
    const product = await productManager.getProductById(pid);
    const cart = await cartManager.getCartById(cid);

    if (!product) {
        res.status(404).send({
            status: "error",
            message: `No existe el producto con el id ${pid}`,
        });
        return;
    }

    if (!cart) {
        res.status(404).send({
            status: "error",
            message: `No existe el carrito con el id ${cid}`,
        });
        return;
    }
    await cartManager.addProductToCart(cid, pid);

    res.send({ status: "success" });
});

router.delete("/:cid/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    const cid = req.params.cid;
    const product = await productManager.getProductById(pid);
    const cart = await cartManager.getCartById(cid);

    if (!product) {
        res.status(404).send({
            status: "error",
            message: `No existe el producto con el id ${pid}`,
        });
        return;
    }

    if (!cart) {
        res.status(404).send({
            status: "error",
            message: `No existe el carrito con el id ${cid}`,
        });
        return;
    }

    const productIndex = cart.products.findIndex(
        (product) => product._id._id == pid
    );

    if (productIndex === -1) {
        res.status(404).send({
            status: "error",
            message: `Producto no encontrado en el carrito`,
        });
        return;
    }

    await cartManager.deleteProductInCart(cart._id, product._id);

    res.send({ status: "success" });
});

router.put("/:cid", async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
        res.status(404).send({
            status: "error",
            message: `No existe el carrito con el id ${cid}`,
        });
        return;
    }

    const updateCart = req.body;
    const errors = [];

    for (const prod of updateCart) {
        const existProd = await productManager.getProductById(prod._id._id);
        if (!existProd) {
            errors.push({
                status: "error",
                message: `No existe el producto con el id ${prod._id._id}`,
            });
        }
    }

    if (errors.length > 0) {
        res.status(404).send(errors);
        return;
    }

    await cartManager.updateCart(cart._id, updateCart);
    const updatedCart = await cartManager.getCartById(cid);
    res.send(updatedCart);
});

router.put("/:cid/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    const cid = req.params.cid;
    const product = await productManager.getProductById(pid);
    const cart = await cartManager.getCartById(cid);

    if (!product) {
        res.status(404).send({
            status: "error",
            message: `No existe el producto con el id ${pid}`,
        });
        return;
    }

    if (!cart) {
        res.status(404).send({
            status: "error",
            message: `No existe el carrito con el id ${cid}`,
        });
        return;
    }

    const productIndex = cart.products.findIndex(
        (product) => product._id._id == pid
    );

    if (productIndex === -1) {
        res.status(404).send({
            status: "error",
            message: `Producto no encontrado en el carrito`,
        });
        return;
    }

    const updateQuantity = req.body;
    await cartManager.updateProductQuantityInCart(
        cart._id,
        product._id,
        updateQuantity
    );
    const updatedCart = await cartManager.getCartById(cid);
    res.send(updatedCart);
});

router.delete("/:cid", async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);

    if (!cart) {
        res.status(404).send({
            status: "error",
            message: `No existe el carrito con el id ${cid}`,
        });
        return;
    }

    await cartManager.deleteProductsInCart(cart._id);

    res.send({ status: "success" });
});

export default router;
