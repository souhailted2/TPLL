import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, userRoles } from "@shared/schema";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "غير مسجل الدخول" });
    }

    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  next();
};

export async function seedUsers() {
  const defaultUsers = [
    { username: "owner", password: "owner123", firstName: "المالك", role: "admin" },
    { username: "factory", password: "factory123", firstName: "موظف المصنع", role: "admin" },
    { username: "alger", password: "alger123", firstName: "نقطة بيع الجزائر", role: "sales_point", salesPointName: "الجزائر" },
    { username: "eloued", password: "eloued123", firstName: "نقطة بيع الوادي", role: "sales_point", salesPointName: "الوادي" },
    { username: "elma", password: "elma123", firstName: "نقطة بيع العلمة", role: "sales_point", salesPointName: "العلمة" },
  ];

  for (const userData of defaultUsers) {
    const [existing] = await db.select().from(users).where(eq(users.username, userData.username));
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [newUser] = await db.insert(users).values({
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
      }).returning();

      await db.insert(userRoles).values({
        userId: newUser.id,
        role: userData.role,
        salesPointName: userData.salesPointName || null,
      }).onConflictDoNothing();
    }
  }
}
