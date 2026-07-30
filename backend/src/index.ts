import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Acente API http://localhost:${env.port} adresinde çalışıyor`);
});
