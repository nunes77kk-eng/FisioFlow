const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Arquivos estáticos (css, js, imagens, etc.)
app.use(express.static(path.join(__dirname)));

// Página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "html", "index.html"));
});

// Página 404
app.use((req, res) => {
    res.status(404).send(`
        <h1>404</h1>
        <p>Página não encontrada.</p>
    `);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado!`);
    console.log(`http://localhost:${PORT}`);
});