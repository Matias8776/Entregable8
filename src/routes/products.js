import ProductManager from "../dao/mongoDb/ProductManager.js";
import { Router } from "express";
import { uploader } from "../utils.js";
import path from "path";
import __dirname from "../utils.js";

const router = Router();

const productManager = new ProductManager();

router.get("/", async (req, res) => {
    const limit = req.query.limit;
    const page = req.query.page;
    const category = req.query.category;
    const disponibility = req.query.disponibility;
    const sort = +req.query.sort;
    const products = await productManager.getProducts(
        limit || 10,
        page || 1,
        category,
        disponibility,
        sort
    );

    res.send({ status: "success", payload: products });
});

router.get("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);

    if (!product) {
        res.status(404).send({
            status: "error",
            message: `No existe el producto con el id ${pid}`,
        });
        return;
    }

    res.send(product);
});

router.post("/", uploader.array("thumbnails"), async (req, res) => {
    let {
        title,
        description,
        price,
        thumbnails,
        code,
        stock,
        status,
        category,
    } = req.body;

    if (req.files) {
        thumbnails = req.files.map((file) => {
            return path.join(__dirname, "/public/img/", file.filename);
        });
    }

    const validationResult = await productManager.addProduct({
        title,
        description,
        price,
        thumbnails,
        code,
        stock,
        status,
        category,
    });

    if (!validationResult.success) {
        res.status(409).send({
            status: "error",
            message: `Error al crear el producto, ${validationResult.message}`,
        });
        return;
    } else {
        res.send({
            status: "success",
            message: `Creado correctamente con el Id ${validationResult.id}`,
        });
    }
});

router.put("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);

    if (!product) {
        res.status(404).send({
            status: "error",
            message: `No existe el producto con el id ${pid}`,
        });
        return;
    }
    const updateProduct = req.body;
    await productManager.updateProduct(product._id, updateProduct);
    const updatedProduct = await productManager.getProductById(pid);
    res.send(updatedProduct);
});

router.delete("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);

    if (!product) {
        res.status(404).send({
            status: "error",
            message: `No existe el producto con el id ${pid}`,
        });
        return;
    }

    await productManager.deleteProduct(product._id);
    res.send({ status: "success" });
});

export default router;
