
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 3000;

async function reply(message) {
    const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.GROQ_API_KEY
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: "You are R&L AI Assistant, a friendly and intelligent general AI assistant. Answer clearly and helpfully."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Groq error:", data);
        throw new Error("AI service error. Please try again.");
    }

    return data.choices[0].message.content;
}

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/chat") {
        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", async () => {
            try {
                const message = JSON.parse(body).message;

                if (!message || !message.trim()) {
                    throw new Error("Please enter a message.");
                }

                const answer = await reply(message);

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({ reply: answer }));

            } catch (error) {
    console.error("Chat error:", error);
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: error.message
                }));
            }
        });

        return;
    }

    let url = req.url.split("?")[0];
    if (url === "/") url = "/index.html";

    const file = path.join(root, url);

    if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end();
    }

    fs.readFile(file, (error, data) => {
        if (error) {
            res.writeHead(404);
            return res.end("Not found");
        }

        res.writeHead(200, {
            "Content-Type": file.endsWith(".css")
                ? "text/css"
                : file.endsWith(".js")
                ? "text/javascript"
                : "text/html"
        });

        res.end(data);
    });
});

server.listen(port, () => {
    console.log("R&L AI Assistant running at http://localhost:" + port);
});
