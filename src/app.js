import express from "express";
import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";
import viewsRouter from "./routes/views.js";
import path from "path";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import MessagesManager from "./dao/mongoDb/MessageManager.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import sessionsRouter from "./routes/sessions.js";
import passport from "passport";
import initializePassport from "./config/passport.js";

const messagesManager = new MessagesManager();

const db = mongoose.connection;
const mongoURL =
    "mongodb+srv://Matty:zzz456@socketsdb.n3ygexn.mongodb.net/ecommerce";
const PORT = process.env.PORT || 8080;
const app = express();
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "/public")));
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname + "/views"));
app.set("view engine", "handlebars");
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: mongoURL,
            ttl: 1800,
        }),
        secret: "CoderSecret",
        resave: false,
        saveUninitialized: false,
    })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/", viewsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/sessions", sessionsRouter);

db.on("error", (error) => {
    console.error("Error de conexión a MongoDB:", error);
});

db.once("open", () => {
    console.log("Conexión a MongoDB establecida correctamente");

    const server = app.listen(PORT, () => {
        console.log(`Servidor ON http://localhost:${PORT}`);
    });

    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("Cliente conectado");
        socket.on("disconnect", () => {
            console.log("Cliente desconectado");
        });

        socket.emit("server:updatedProducts");
        socket.on("client:updateProduct", () => {
            io.emit("server:updatedProducts");
        });

        socket.on("nuevousuario", async (usuario) => {
            socket.broadcast.emit("broadcast", usuario);
            socket.emit("chat", await messagesManager.getMessages());
        });
        socket.on("mensaje", async (info) => {
            await messagesManager.createMessage(info);
            io.emit("chat", await messagesManager.getMessages());
        });
    });
});
