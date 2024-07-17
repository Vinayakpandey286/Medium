import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@vinayakpandey286/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { success } = signupInput.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      message: "Invalid Parameters",
    });
  }

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
    return c.text("Invalid");
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { success } = signinInput.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      message: "Invalid Parameters",
    });
  }

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
    console.log(error)
    c.status(400);
    return c.text("Invalid");
  }
});
