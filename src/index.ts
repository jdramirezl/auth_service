import express from "express";
import cors from "cors";

import { routes } from "./routes";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 8081;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
      "http://localhost:8000",
    ],
  })
);

routes(app);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

