import passport from "passport";
import local from "passport-local";
import usersModel from "../dao/models/users.js";
import { createHash, isValidPassword } from "../utils.js";
import GitHubStrategy from "passport-github2";

const localStrategy = local.Strategy;
const initializePassport = () => {
    passport.use(
        "register",
        new localStrategy(
            { passReqToCallback: true, usernameField: "email" },
            async (req, username, password, done) => {
                const { first_name, last_name, email, age } = req.body;
                try {
                    let user = await usersModel.findOne({ email: username });
                    if (user) {
                        return done(null, false, {
                            message: "El usuario ya existe",
                        });
                    }
                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password: createHash(password),
                    };
                    let result = await usersModel.create(newUser);
                    return done(null, result);
                } catch (error) {
                    return done(`Error al obtener el usuario: ${error}`);
                }
            }
        )
    );

    passport.use(
        "login",
        new localStrategy(
            { passReqToCallback: true, usernameField: "email" },
            async (req, username, password, done) => {
                try {
                    if (
                        username === "adminCoder@coder.com" &&
                        password === "adminCod3r123"
                    ) {
                        const user = {
                            email: username,
                        };
                        return done(null, user);
                    } else if (
                        username === "adminCoder@coder.com" &&
                        password !== "adminCod3r123"
                    ) {
                        return done(null, false, {
                            message: "Contraseña incorrecta",
                        });
                    } else {
                        const user = await usersModel.findOne({
                            email: username,
                        });
                        if (!user) {
                            return done(null, false, {
                                message: "El usuario no existe",
                            });
                        }
                        if (!isValidPassword(user, password)) {
                            return done(null, false, {
                                message: "Contraseña incorrecta",
                            });
                        }
                        return done(null, user);
                    }
                } catch (error) {
                    return done(`Error al obtener el usuario: ${error}`);
                }
            }
        )
    );

    passport.use(
        "github",
        new GitHubStrategy(
            {
                clientID: "Iv1.c9e8ea2640ac7597",
                clientSecret: "2d1c99cdb2d4d506c5626a2dfa085cbc96fa5e35",
                callbackURL:
                    "http://localhost:8080/api/sessions/githubcallback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await usersModel.findOne({
                        email: profile._json.email,
                    });
                    if (!user) {
                        const newUser = {
                            first_name: profile._json.name,
                            last_name: "",
                            age: 18,
                            email: profile._json.email,
                            password: "",
                        };
                        let result = await usersModel.create(newUser);
                        return done(null, result);
                    }
                    return done(null, user);
                } catch (error) {
                    return done(`Error al obtener el usuario: ${error}`);
                }
            }
        )
    );
};

passport.serializeUser((user, done) => {
    if (user.email === "adminCoder@coder.com") {
        done(null, "admin");
    } else {
        done(null, user._id);
    }
});

passport.deserializeUser(async (id, done) => {
    if (id === "admin") {
        const adminUser = {
            email: "adminCoder@coder.com",
        };
        return done(null, adminUser);
    } else {
        try {
            let user = await usersModel.findById(id);
            return done(null, user);
        } catch (error) {
            return done(`Error al obtener el usuario: ${error}`);
        }
    }
});

export default initializePassport;
