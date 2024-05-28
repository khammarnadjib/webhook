// app.js
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = "arkoss";
const REPO_PATH = "/Users//nadjibkhammar//Documents//Arkoss//EFREI//M1//S8//API//TP//webhook";
const BRANCH = "main";
// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware to verify GitHub signature
function verifyGitHubSignature(req, res, next) {
    const signature = req.headers["x-hub-signature"];
    const payload = JSON.stringify(req.body);
    const hash = `sha1=${crypto
        .createHmac("sha1", SECRET)
        .update(payload)
        .digest("hex")}`;
    if (signature === hash) {
        next();
    } else {
        res.status(401).send("Invalid signature");
} }
// Webhook endpoint
app.post("/webhook", verifyGitHubSignature, (req, res) => {
    const event = req.headers["x-github-event"];
    const branch = req.body.ref.split("/").pop();
    if (event === "push" && branch === BRANCH) {
        // Pull the latest code and build
        exec(
            `cd ${REPO_PATH} && git pull origin ${BRANCH} && npm install && npm run build`,
            (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error: ${stderr}`);
                    res.status(500).send("Internal Server Error");
                    return;
                }
                console.log(`Build Output: ${stdout}`);
                res.status(200).send("Webhook received and processed");
} );
    } else {
        res.status(200).send("Event received but not processed");
} });
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});