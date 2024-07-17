import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import {
  createBlogInput,
  updateBlogInput,
} from "@vinayakpandey286/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  variables: {
    userId: string;
  };
}>();

blogRouter.use(async (c, next) => {
  let token;

  if (
    c.req.header("authorization") &&
    c.req.header("authorization")?.startsWith("Bearer")
  ) {
    try {
      token = c.req.header("authorization")?.split(" ")[1];
      const userId = await verify(token || "", c.env.JWT_SECRET);
      if (userId) {
        c.set("jwtPayload", userId.id);
        await next();
      } else {
        c.status(403);
        return c.text("Invalid Token");
      }
    } catch (error) {
      c.status(403);
      return c.text("Something went wrong");
    }
  } else {
    c.status(403);
    return c.text("No Token");
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.post.findMany();
    if (blogs) {
      return c.json({
        blogs,
      });
    } else {
      return c.text("No blogs");
    }
  } catch (error) {
    console.log("error", error);

    c.status(403);
    return c.json({
      message: "something went wrong",
    });
  }
});

blogRouter.get("/:id", async (c) => {
  const id = await c.req.param("id");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id,
      },
    });

    if (blog) {
      return c.json({
        blog,
      });
    } else {
      c.status(400);
      return c.text("Something went wrong");
    }
  } catch (error) {
    c.status(400);
    return c.text("Something went wrong");
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { success } = createBlogInput.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      message: "Invalid Parameters",
    });
  }

  const userId = c.get("jwtPayload");

  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        published: body.published,
        authorID: userId,
      },
    });

    if (blog) {
      return c.json({
        id: blog.id,
      });
    } else {
      c.status(400);
      return c.text("Something went wrong");
    }
  } catch (error) {
    c.status(400);
    return c.text("Something went wrong");
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { success } = updateBlogInput.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      message: "Invalid Parameters",
    });
  }

  try {
    const blog = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
        published: body.published,
      },
    });

    if (blog) {
      return c.json({
        id: blog.id,
      });
    } else {
      c.status(400);
      return c.text("Something went wrong");
    }
  } catch (error) {
    c.status(400);
    return c.text("Something went wrong");
  }
});
