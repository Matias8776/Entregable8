const socket = io();

const productsContainer = document.getElementById("productsList");
const addForm = document.getElementById("addForm");
const deleteForm = document.getElementById("deleteForm");

let form = document.getElementById("addForm");

socket.on("server:updatedProducts", async () => {
    await fetch("/api/products", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((response) => {
            let products = response;
            products = products.payload.docs;
            productsContainer.innerHTML = "";
            products.forEach((a) => {
                const newLiProduct = document.createElement("li");
                newLiProduct.innerHTML = `
            <strong>Id:</strong> ${a._id}<br>
            <strong>Título:</strong> ${a.title}<br>
            <strong>Descripción:</strong> ${a.description}<br>
            <strong>Precio:</strong> ${a.price}<br>
            <strong>Código:</strong> ${a.code}<br>
            <strong>Stock:</strong> ${a.stock}<br>
            <strong>Categoria:</strong> ${a.category}<br>
            <strong>Status:</strong> ${a.status}<br>
            `;
                productsContainer.appendChild(newLiProduct);
            });
        });
});

addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);

    const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
    });
    const data = await response.json();

    const errorElement = document.getElementById("errorAdd");
    if (response.status === 200 && data.status === "success") {
        addForm.reset();
        socket.emit("client:updateProduct");
        errorElement.textContent = "";
    } else if (data.status === "error") {
        if (errorElement) {
            errorElement.textContent = data.message;
        }
    }
});

deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(deleteForm);
    const pid = formData.get("id");
    const response = await fetch(`/api/products/${pid}`, {
        method: "DELETE",
        body: formData,
    });
    const data = await response.json();

    const errorElement = document.getElementById("errorDelete");
    if (response.status === 200 && data.status === "success") {
        deleteForm.reset();
        socket.emit("client:updateProduct");
        errorElement.textContent = "";
    } else if (data.status === "error") {
        if (errorElement) {
            errorElement.textContent = data.message;
        }
    }
});
