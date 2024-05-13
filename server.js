const { createServer } = require("http");
const PORT = 4000;

const db = [
  { title: "The Office", comedian: "Ricky Gervais", year: 2005, id: 1 },
  { title: "Parks and Recreation", comedian: "Amy Poehler", year: 2009, id: 2 },
  { title: "Brooklyn Nine-Nine", comedian: "Andy Samberg", year: 2013, id: 3 },
  { title: "Friends", comedian: "Jennifer Aniston", year: 1994, id: 4 },
  { title: "The Big Bang Theory", comedian: "Jim Parsons", year: 2007, id: 5 },
];

const parseBody = (req, callback) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const parsedBody = JSON.parse(body);
      callback(parsedBody);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      callback({});
    }
  });
};

const server = createServer((req, res) => {
  const { url, method } = req;

  if (url === "/home") {
    if (method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Available jokes", data: db }));
    } else if (method === "POST") {
      parseBody(req, (body) => {
        db.push(body);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "New joke added", data: db }));
      });
    } else {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
    }
  } else if (url.startsWith("/joke/")) {
    const id = parseInt(url.split("/")[2]);
    const jokeIndex = db.findIndex((joke) => joke.id === id);
    if (jokeIndex === -1) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(JSON.stringify({ error: "Joke not found" }));
    } else {
      if (method === "PATCH") {
        parseBody(req, (body) => {
          db[jokeIndex] = { ...db[jokeIndex], ...body };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ data: db[jokeIndex] }));
        });
      } else if (method === "DELETE") {
        const deletedJoke = db.splice(jokeIndex, 1)[0];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Joke deleted", data: deletedJoke }));
      } else {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
      }
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
