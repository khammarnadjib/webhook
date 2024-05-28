const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const simpleGit = require("simple-git");

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for port
const key = "arkoss"; // Use environment variable for GitHub secret

// Middleware to parse JSON and verify GitHub signatures
app.use(bodyParser.json({ verify: verifyGithubSignature }));

function verifyGithubSignature(req, res, buf, encoding) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        throw new Error('No signature provided');
    }

    const hmac = crypto.createHmac('sha256', key);
    const digest = `sha256=${hmac.update(buf).digest('hex')}`;

    if (signature !== digest) {
        res.status(401).send("Invalid signature");
        throw new Error('Invalid signature');
    }
}

// Webhook endpoint for GitHub events
app.post("/webhook", async (req, res) => {
    const event = req.body;

    // Process only push events to the 'main' branch
    if (event.ref === "refs/heads/main") {
        console.log("Push event received for the 'main' branch.");

        // Update local repository
        const git = simpleGit();
        try {
            await git.pull('origin', 'main');
            console.log("Repository successfully updated.");
            res.status(200).send("Event received and repository updated.");
        } catch (err) {
            console.error("Failed to update repository:", err);
            res.status(500).send("Internal Server Error: Failed to update repository.");
        }
    } else {
        res.status(200).send("Event received but no action taken.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
