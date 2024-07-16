import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, verify, sign } from "hono/jwt";

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use(async (c, next) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let token;

  if (
    c.req.header("authorization") &&
    c.req.header("authorization")?.startsWith("Bearer")
  ) {
    try {
      token = c.req.header("authorization")?.split(" ")[1];
      const userId = await verify(token || "", c.env.JWT_SECRET);

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
    } catch (error) {}
  }
});

app.post("/api/v1/signup", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: body.password,
      },
    });
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({
      token,
    });
  } catch (error) {
    c.status(400);
    return c.text("Inavlid");
  }
});

app.post("/api/v1/signin", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (user) {
      const token = await sign({ id: user.id }, c.env.JWT_SECRET);
      return c.json({
        token,
      });
    } else {
      c.status(403);
      c.json({
        messsage: "Invalid creds",
      });
    }
  } catch (error) {
    c.status(400);
    return c.text("Inavlid");
  }
});

app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param("id");
  return c.text("get blog route");
});
app.get("/api/v1/blog/bulk", (c) => {
  const id = c.req.param("id");
  return c.text("get blog route");
});

app.post("/api/v1/blog", (c) => {
  return c.text("signin route");
});

app.put("/api/v1/blog", (c) => {
  return c.text("signin route");
});

export default app;
