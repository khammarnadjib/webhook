const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const simpleGit = require("simple-git");
//TEST 
const app = express();
const PORT = 3000; 
const GITHUB_SECRET = "arkoss"; // secret key to your github setting

app.use(bodyParser.json());

function verifyGithubSignature(req, res, buf, encoding) {
    const signature = req.headers["x-hub-signature-256"];
    const hmac = crypto.createHmac("sha256", GITHUB_SECRET);
    const digest = `sha256=${hmac.update(buf).digest("hex")}`;

    if (signature !== digest) {
        return res.status(401).send("Invalid signature");
    }
}

app.use(bodyParser.json({ verify: verifyGithubSignature }));

app.post("/webhook", (req, res) => {
    const event = req.body;

    if (event.ref === "refs/heads/main") { 
        console.log("Push event received for branch main");

        // Cloner ou mettre à jour le dépôt localement
        const git = simpleGit();
        git.pull("origin", "main")
            .then(() => {
                console.log("Repository updated successfully");
            })
            .catch(err => console.error("Failed to update repository:", err));
    }

    res.status(200).send("Event received");
});

// star serv
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

