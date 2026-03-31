import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";
import { users, userRoles, authTokens } from "@shared/schema";
import { eq, lt } from "drizzle-orm";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function cleanExpiredTokens() {
  try {
    await db.delete(authTokens).where(lt(authTokens.expiresAt, new Date()));
  } catch (error) {
    console.error("Error cleaning expired tokens:", error);
  }
}

setInterval(cleanExpiredTokens, 60 * 60 * 1000);

export async function setupAuth(app: Express) {
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

      const token = generateToken();
      const ttl = 7 * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + ttl);

      await db.insert(authTokens).values({
        token,
        userId: user.id,
        expiresAt,
      });

      const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, user.id));

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        role: role || null,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      try {
        await db.delete(authTokens).where(eq(authTokens.token, token));
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    res.json({ success: true });
  });

  app.get("/api/auth/user", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "غير مسجل الدخول" });
    }

    try {
      const [session] = await db.select().from(authTokens).where(eq(authTokens.token, token));

      if (!session || session.expiresAt < new Date()) {
        if (session) {
          await db.delete(authTokens).where(eq(authTokens.token, token));
        }
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, session.userId));

      if (!user) {
        await db.delete(authTokens).where(eq(authTokens.token, token));
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

export async function getUserIdFromRequest(req: any): Promise<string | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const [session] = await db.select().from(authTokens).where(eq(authTokens.token, token));
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await db.delete(authTokens).where(eq(authTokens.token, token));
      }
      return null;
    }
    return session.userId;
  } catch (error) {
    console.error("Token lookup error:", error);
    return null;
  }
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  req.userId = userId;
  next();
};

export async function seedUsers() {
  const defaultUsers = [
    { username: "المدير العام", password: "5555", firstName: "المدير العام", role: "admin", salesPointName: null },
    { username: "reception1", password: "1111", firstName: "طارق", role: "reception", salesPointName: null },
    { username: "reception2", password: "1111", firstName: "العيد", role: "reception", salesPointName: null },
    { username: "walid", password: "1111", firstName: "وليد", role: "factory_monitor", salesPointName: null },
    { username: "shipping", password: "1111", firstName: "فريق الشحن", role: "shipping", salesPointName: null },
    { username: "alger", password: "0000", firstName: "نقطة بيع الجزائر", role: "sales_point", salesPointName: "الجزائر" },
    { username: "eloued", password: "0000", firstName: "نقطة بيع الوادي", role: "sales_point", salesPointName: "الوادي" },
    { username: "elma", password: "0000", firstName: "نقطة بيع العلمة", role: "sales_point", salesPointName: "العلمة" },
  ];

  for (const userData of defaultUsers) {
    const [existing] = await db.select().from(users).where(eq(users.username, userData.username));
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    if (!existing) {
      const [newUser] = await db.insert(users).values({
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
      }).returning();

      await db.insert(userRoles).values({
        userId: newUser.id,
        role: userData.role,
        salesPointName: userData.salesPointName,
      }).onConflictDoNothing();
    } else {
      await db.update(users).set({ password: hashedPassword, firstName: userData.firstName }).where(eq(users.username, userData.username));

      await db.insert(userRoles).values({
        userId: existing.id,
        role: userData.role,
        salesPointName: userData.salesPointName,
      }).onConflictDoUpdate({
        target: userRoles.userId,
        set: {
          role: userData.role,
          salesPointName: userData.salesPointName,
        },
      });
    }
  }

  console.log("Users seeded with correct roles.");
}
