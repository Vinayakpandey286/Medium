import { Hono } from "hono";
import { blogRouter } from "./Routes/blogRoutes";
import { userRouter } from "./Routes/userRoutes";
import { cors } from "hono/cors";

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use(cors());

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blogs", blogRouter);

export default app;
