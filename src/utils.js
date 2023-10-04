import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);
const PRIVATE_KEY = "coderSecret";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/public/img`);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const uploader = multer({
    storage,
    onError: function (err, next) {
        console.error(err);
        next();
    },
});

export const createHash = (password) =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
    bcrypt.compareSync(password, user.password);

export const generateToken = (user) => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "15m" });
    return token;
};

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({ error: info.messages ? info.messages : info.toString() });
            }
            req.user = user;
            next();
        })(req, res, next);
    };
};

export default __dirname;
