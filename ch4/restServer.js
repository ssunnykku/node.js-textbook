const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const users = {}; // 데이터 저장

http
  .createServer(async (req, res) => {
    try {
      console.log(req.method, req.url);
      //   HTTP 요청 메서드를 구분
      if (req.method === "GET") {
        // 주소
        if (req.url === "/") {
          const data = await fs.readFile(
            path.join(__dirname, "restFront.html")
          );
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(data);
          //   "/about이면"
        } else if (req.url === "/about") {
          // "about.html"을 제공
          const data = await fs.readFile(path.join(__dirname, "about.html"));
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(data);
        } else if (req.url === "/users") {
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end(JSON.stringify(users));
        }
        // 주소가 /도 /about도 /users도 아니면
        try {
          const data = await fs.readFile(path.join(__dirname, req.url));
          return res.end(data);
        } catch (err) {
          // 주소에 해당하는 라우트를 찾지 못했다는 404 Not Found error 발생
        }
      } else if (req.method === "POST") {
        if (req.url === "/user") {
          let body = "";
          // 요청의 body를 stream 형식으로 받음
          req.on("data", (data) => {
            body += data;
          });

          //   요청의 body를 다 받은 후 실행됨
          return req.on("end", () => {
            console.log("POST 본문(Body):", body);
            const { name } = JSON.parse(body);
            const id = Date.now();
            users[id] = name;
            res.writeHead(201, { "Content-Type": "text/html; charset=utf-8" });
            res.end("등록 성공");
          });
        }
      } else if (req.method === "PUT") {
        if (req.url.startsWith("/user/")) {
          const key = req.url.split("/")[2];
          let body = "";
          req.on("data", (data) => {
            body += data;
          });
          return req.on("end", () => {
            console.log("PUT 본문(Body):", body);
            users[key] = JSON.parse(body).name;
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            return res.end(JSON.stringify(users));
          });
        }
      } else if (req.method === "DELETE") {
        if (req.url.startsWith("/user/")) {
          const key = req.url.split("/")[2];
          delete users[key];
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(JSON.stringify(users));
        }
      }
      res.writeHead(404);
      //   return 을 작성하지 않으면 res.end()메서드더라도 함수가 종료되지 않는다.
      return res.end("NOT FOUND");
    } catch (err) {
      console.error(err);
      //   예기치 못한 에러, 실무에선 500 전송은 드물다
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(err.message);
    }
  })
  .listen(8082, () => {
    console.log("8082번 포트에서 서버 대기 중입니다");
  });
