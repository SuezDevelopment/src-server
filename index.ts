import { Application, serve, WebSocketServer, StandardWebSocketClient, WebSocketClient } from "./deps.ts";
import router from "./router.ts";
import {
    bold,
    yellow,
} from "./deps.ts";
const port = 4343;
export const pt = 4303;
const app = new Application();
export const wss = new WebSocketServer(pt);


wss.on("connection", async (ws: WebSocketClient)=>{
  ws.on("message", function (message: any) {
    console.log(message);
    ws.send(message);
  });
});



app.use(async (ctx: { response: { headers: { get: (arg0: string) => any; }; }; request: { method: any; url: any; }; }, next: () => any) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

app.use(async (ctx: { response: { headers: { set: (arg0: string, arg1: string) => void; }; }; }, next: () => any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// serve(handler, { port: 4242,
//   onListen({ port, hostname }) {
//     console.log(`Server started at http://${hostname}:${port}`);
//     // ... more info specific to your server ..
//   },
// });


app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ hostname, port, serverType }:any) => {
    console.log(
      bold("Start listening on ") + yellow(`${hostname}:${port}`),
    );
    console.log(bold("  using HTTP server: " + yellow(serverType)));
});
await app.listen({ hostname: "127.0.0.1", port: port });
console.log(bold("Finished.")||'finshed');