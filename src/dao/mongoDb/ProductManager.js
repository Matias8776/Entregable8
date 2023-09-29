import productsModel from "../models/products.js";
import mongoose from "mongoose";

export default class ProductManager {
    getProducts = async (limit, page, category, disponibility, sort) => {
        try {
            const options = {
                limit,
                page,
            };

            if (sort === 1 || sort === -1) {
                options.sort = { price: sort };
            }

            const filter = {}

            if (category) {
                filter.$text = { $search: category, $caseSensitive: false, $diacriticSensitive: false };
            }

            if (disponibility == 0) {
                filter.stock = { $eq: disponibility }
            } else if (disponibility == 1) {
                filter.stock = { $gte: disponibility }
            }

            const paginate = await productsModel.paginate(filter, options);
            return paginate;
        } catch (err) {
            return err;
        }
    };

    getProductById = async (id) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return { error: "Id no válido" };
            }

            return await productsModel.findById(id).lean();
        } catch (err) {
            return { error: err.message };
        }
    };

    addProduct = async (product) => {
        const result = {
            success: false,
        };
        if (typeof product.status === "string") product.status = true;
        try {
            const productAdded = await productsModel.create(product);
            result.id = productAdded.id;
            result.success = true;
            return result;
        } catch (err) {
            return err;
        }
    };

    updateProduct = async (id, product) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return { error: "Id no válido" };
            } else {
                return await productsModel.findByIdAndUpdate(id, {
                    $set: product,
                });
            }
        } catch (err) {
            return { error: err.message };
        }
    };

    deleteProduct = async (id) => {
        try {
            return await productsModel.findByIdAndDelete(id);
        } catch (err) {
            return err;
        }
    };
}
