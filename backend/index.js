#!/usr/bin/env node
"use strict";

const port = (() => {
  const args = process.argv;
  if (args.length !== 3) {
    console.error("usage: node index.js port");
    process.exit(1);
  }
  const num = parseInt(args[2], 10);
  if (isNaN(num)) {
    console.error("error: argument must be an integer.");
    process.exit(1);
  }
  return num;
})();

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");
const { expressjwt: jwt } = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const AVATAR_DIR = path.join(UPLOAD_ROOT, "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_ROOT));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    const name = (req.me?.utorid || "avatar") + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

const need =
  (...roles) =>
  (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.length || roles.includes(req.auth.role)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };

const isUofT = (email) => /^[^@]+@mail\.utoronto\.ca$/i.test(email || "");
const isUtorid = (u) => /^[a-zA-Z0-9]{7,8}$/.test(u || "");
const pwStrong = (s) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/.test(s || "");
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const toBool = (v) => v === true || v === "true";

const auth = jwt({
  secret: "anylongrandomsecret",
  algorithms: ["HS256"],
}).unless({ path: ["/auth/tokens", /^\/auth\/resets(\/.*)?$/] });
app.use(auth);

app.use(async (req, _res, next) => {
  if (!req.auth) return next();
  try {
    const id = parseInt(req.auth.sub, 10);
    if (!Number.isNaN(id))
      req.me = await prisma.user.findUnique({ where: { id } });
  } catch {}
  next();
});

app.get("/", (_req, res) => res.json({ ok: true }));

app.post("/auth/tokens", async (req, res) => {
  const { utorid, password } = req.body || {};
  if (!utorid || !password)
    return res.status(400).json({ error: "Missing fields" });
  const user = await prisma.user.findUnique({ where: { utorid } });
  if (!user) return res.status(403).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Incorrect password" });

  const expiresInSec = 24 * 60 * 60;
  const token = jsonwebtoken.sign({ role: user.role }, "anylongrandomsecret", {
    algorithm: "HS256",
    subject: String(user.id),
    expiresIn: expiresInSec,
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  res.json({
    token,
    expiresAt: new Date(Date.now() + expiresInSec * 1000).toISOString(),
  });
});

const resetIpWindow = new Map();

app.post("/auth/resets", async (req, res) => {
  const { utorid, ...rest } = req.body || {};
  if (!utorid) {
    return res.status(400).json({ message: "Utorid is required" });
  }
  if (Object.keys(rest).length) {
    return res
      .status(400)
      .json({ message: `Unknown field(s): ${Object.keys(rest).join(", ")}` });
  }

  const user = await prisma.user.findFirst({
    where: { utorid: { equals: String(utorid).trim() } },
    select: { id: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "";
  const now = Date.now();
  const last = resetIpWindow.get(ip) || 0;
  if (now - last < 60_000) {
    return res.status(429).json({ message: "Too Many Requests" });
  }

  const resetToken = uuidv4();
  const expiresAt = new Date(now + 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.passwordReset.updateMany({
      where: { userId: user.id, purpose: "reset", consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    prisma.passwordReset.create({
      data: { token: resetToken, purpose: "reset", expiresAt, userId: user.id },
    }),
  ]);
  resetIpWindow.set(ip, now);

  return res
    .status(202)
    .json({ resetToken, expiresAt: expiresAt.toISOString() });
});

app.post("/auth/resets/:resetToken", async (req, res) => {
  const { resetToken } = req.params;

  const { utorid, password, ...rest } = req.body || {};
  if (!utorid) {
    return res.status(400).json({ message: "Utorid is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Invalid password." });
  }
  if (!pwStrong(password)) {
    return res.status(400).json({ message: "Invalid password." });
  }
  if (Object.keys(rest).length) {
    return res
      .status(400)
      .json({ message: `Unknown field(s): ${Object.keys(rest).join(", ")}` });
  }

  const tokenRow = await prisma.passwordReset.findUnique({
    where: { token: resetToken },
  });
  if (!tokenRow) {
    return res.status(404).json({ message: "Token not found" });
  }

  const now = Date.now();
  if (tokenRow.consumedAt || tokenRow.expiresAt.getTime() <= now) {
    return res.status(410).json({ message: "Token expired" });
  }

  const newerToken = await prisma.passwordReset.findFirst({
    where: {
      userId: tokenRow.userId,
      purpose: "reset",
      consumedAt: null,
      token: { not: resetToken },
      createdAt: { gt: tokenRow.createdAt },
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
  if (newerToken) {
    return res.status(410).json({ message: "Token expired" });
  }

  const user = await prisma.user.findUnique({ where: { id: tokenRow.userId } });
  if (
    !user ||
    user.utorid.toLowerCase() !== String(utorid).trim().toLowerCase()
  ) {
    return res.status(401).json({ message: "Token does not match user" });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    }),
    prisma.passwordReset.update({
      where: { id: tokenRow.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  return res.sendStatus(200);
});

//----------------USER TRANSACTION ENDPOINTS----------------//
// GET /users/me/transactions - my transaction list
app.get(
  "/users/me/transactions",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      let { type, relatedId, promotionId, amount, operator, page, limit } =
        req.query;

      const p = toInt(page, 1);
      const l = toInt(limit, 10);
      const skip = (p - 1) * l;

      const userId = Number(req.auth.sub);

      const where = {
        userId: userId,
      };

      if (promotionId) {
        const promoIdNum = parseInt(promotionId, 10);
        if (isNaN(promoIdNum)) {
          return res.status(400).json({ error: "Invalid promotionId" });
        }
        where.promotions = {
          some: { promotionId: promoIdNum },
        };
      }

      if (amount !== undefined && operator !== undefined) {
        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum)) {
          return res.status(400).json({ error: "Invalid amount" });
        }

        if (operator === "gte") {
          where.amount = { gte: amountNum };
        } else if (operator === "lte") {
          where.amount = { lte: amountNum };
        } else {
          return res.status(400).json({ error: "Invalid operator" });
        }
      }

      if (type) {
        where.type = type;
      }

      if (type && relatedId !== undefined) {
        const relatedIdNum = parseInt(relatedId, 10);
        if (isNaN(relatedIdNum)) {
          return res.status(400).json({ error: "Invalid relatedId" });
        }

        if (type === "adjustment") {
          where.relatedTransactionId = relatedIdNum;
        } else if (type === "transfer") {
          where.relatedUserId = relatedIdNum;
        } else if (type === "redemption") {
          where.processedById = relatedIdNum;
        } else if (type === "event") {
          where.eventId = relatedIdNum;
        }
      }

      const transactions = await prisma.transaction.findMany({
        where: where,
        skip: skip,
        take: l,
        include: {
          promotions: { include: { promotion: true } },
          createdBy: true,
          relatedUser: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const count = await prisma.transaction.count({ where: where });

      const results = transactions.map((t) => {
        const promotionIds = t.promotions.map((p) => p.promotionId);

        let temp = {
          id: t.id,
          type: t.type,
          amount: t.amount,
          promotionIds: promotionIds,
          remark: t.remark,
          createdBy: t.createdBy.utorid,
        };

        if (t.type === "purchase") {
          temp.spent = t.spent;
        } else if (t.type === "redemption") {
          temp.redeemed = t.redeemed;
          temp.relatedId = t.processedById;
        } else if (t.type === "adjustment") {
          temp.relatedId = t.relatedTransactionId;
        } else if (t.type === "transfer") {
          temp.relatedId = t.relatedUserId;
          temp.relatedUtorid = t.relatedUser?.utorid;
        } else if (t.type === "event") {
          temp.relatedId = t.eventId;
        }

        return temp;
      });

      return res.status(200).json({
        count: count,
        results: results,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
// POST /users/me/transactions - create redemption
app.post(
  "/users/me/transactions",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      const { type, amount, remark = "" } = req.body;

      if (type !== "redemption") {
        return res.status(400).json({ error: "Type must be redemption" });
      }
      if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const userId = Number(req.auth.sub);
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.verified) {
        return res.status(403).json({ error: "User not verified" });
      }

      if (user.points < amount) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      const transaction = await prisma.transaction.create({
        data: {
          type: "redemption",
          amount: -amount,
          redeemed: amount,
          remark: remark,
          userId: userId,
          createdById: userId,
          processed: false,
        },
      });

      return res.status(201).json({
        id: transaction.id,
        utorid: user.utorid,
        type: "redemption",
        processedBy: null,
        amount: amount,
        remark: remark,
        createdBy: user.utorid,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /users/:userId/transactions - create transfer
app.post(
  "/users/:userId/transactions",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      const { type, amount, remark = "" } = req.body;
      const recipientId = parseInt(req.params.userId, 10);

      if (isNaN(recipientId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }
      if (!Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      if (type !== "transfer") {
        return res.status(400).json({ error: "Type must be transfer" });
      }

      const senderId = Number(req.auth.sub);
      const sender = await prisma.user.findUnique({ where: { id: senderId } });

      if (!sender) {
        return res.status(404).json({ error: "Sender not found" });
      }

      if (!sender.verified) {
        return res.status(403).json({ error: "User not verified" });
      }

      if (sender.points < amount) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
      });
      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" });
      }

      const senderTx = await prisma.$transaction(async (tx) => {
        const t1 = await tx.transaction.create({
          data: {
            type: "transfer",
            amount: -amount,
            userId: senderId,
            createdById: senderId,
            relatedUserId: recipientId,
            remark: remark,
          },
        });

        await tx.transaction.create({
          data: {
            type: "transfer",
            amount: amount,
            userId: recipientId,
            createdById: senderId,
            relatedUserId: senderId,
            remark: remark,
          },
        });

        await tx.user.update({
          where: { id: senderId },
          data: { points: { decrement: amount } },
        });

        await tx.user.update({
          where: { id: recipientId },
          data: { points: { increment: amount } },
        });

        return t1;
      });

      return res.status(201).json({
        id: senderTx.id,
        sender: sender.utorid,
        recipient: recipient.utorid,
        type: "transfer",
        sent: amount,
        remark: remark,
        createdBy: sender.utorid,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/users",
  need("cashier", "manager", "superuser"),
  async (req, res) => {
    const { utorid, name, email } = req.body || {};
    const nameOk =
      typeof name === "string" &&
      name.trim().length >= 1 &&
      name.trim().length <= 50;
    if (!isUtorid(utorid) || !name || !isUofT(email) || !nameOk)
      return res.status(400).json({ error: "Bad Request" });

    const activationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    try {
      const created = await prisma.user.create({
        data: {
          utorid,
          name,
          email,
          password: await bcrypt.hash(uuidv4(), 10),
          role: "regular",
          verified: false,
          suspicious: false,
          points: 0,
          resets: {
            create: {
              token: activationToken,
              purpose: "activation",
              expiresAt,
            },
          },
        },
        include: { resets: true },
      });

      res.status(201).json({
        id: created.id,
        utorid: created.utorid,
        name: created.name,
        email: created.email,
        verified: created.verified,
        expiresAt: created.resets[0].expiresAt.toISOString(),
        resetToken: created.resets[0].token,
      });
    } catch (e) {
      if (String(e.message).includes("Unique constraint"))
        return res.status(409).json({ error: "Conflict" });
      res.status(400).json({ error: "Bad Request" });
    }
  }
);

app.get("/users", need("manager", "superuser"), async (req, res) => {
  try {
    const { name, role, verified, activated, before } = req.query;

    let page = 1;
    if (req.query.page !== undefined) {
      page = Number.parseInt(String(req.query.page), 10);
      if (!Number.isFinite(page) || page < 1) {
        return res.status(400).json({ error: "Invalid page number" });
      }
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
      limit = Number.parseInt(String(req.query.limit), 10);
      if (!Number.isFinite(limit) || limit < 1) {
        return res.status(400).json({ error: "Invalid limit" });
      }
    }

    const parseBool = (s) => {
      if (s === undefined) return undefined;
      if (s === "true") return true;
      if (s === "false") return false;
      return null;
    };

    const where = {};

    if (name && name.trim().length > 0) {
      const q = String(name).trim();
      where.OR = [{ utorid: { contains: q } }, { name: { contains: q } }];
    }

    if (role !== undefined) {
      const validRoles = ["regular", "cashier", "manager", "superuser"];
      if (!validRoles.includes(String(role))) {
        return res.status(400).json({ error: "Bad Request" });
      }
      where.role = role;
    }

    const v = parseBool(verified);
    if (v === null) return res.status(400).json({ error: "Bad Request" });
    if (v !== undefined) where.verified = v;

    const a = parseBool(activated);
    if (a === null) return res.status(400).json({ error: "Bad Request" });
    if (a === true) where.lastLogin = { not: null };
    if (a === false) where.lastLogin = null;

    if (before !== undefined) {
      const d = new Date(String(before));
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "Bad Request" });
      }
      where.createdAt = { lt: d };
    }

    const count = await prisma.user.count({ where });

    const results = await prisma.user.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        utorid: true,
        name: true,
        email: true,
        birthday: true,
        role: true,
        points: true,
        createdAt: true,
        lastLogin: true,
        verified: true,
        avatarUrl: true,
      },
    });

    return res.status(200).json({ count, results });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Bad Request" });
  }
});

app.get(
  "/users/me",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      const userId = req.me?.id || Number(req.auth?.sub);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          utorid: true,
          name: true,
          email: true,
          birthday: true,
          role: true,
          points: true,
          createdAt: true,
          lastLogin: true,
          verified: true,
          avatarUrl: true,
        },
      });

      if (!u) return res.status(404).json({ error: "Not Found" });

      const now = new Date();
      const availablePromotions = await prisma.promotion.findMany({
        where: {
          type: "onetime",
          startTime: { lte: now },
          endTime: { gt: now },
          usages: { none: { userId: u.id } },
        },
        select: {
          id: true,
          name: true,
          minSpending: true,
          rate: true,
          points: true,
        },
        orderBy: { id: "asc" },
      });

      const birthdayStr = u.birthday
        ? u.birthday.toISOString().slice(0, 10)
        : null;

      res.json({
        id: u.id,
        utorid: u.utorid,
        name: u.name,
        email: u.email,
        birthday: birthdayStr,
        role: u.role,
        points: u.points,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        verified: u.verified,
        avatarUrl: u.avatarUrl,
        promotions: availablePromotions,
      });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Bad Request" });
    }
  }
);

app.patch(
  "/users/me",
  need("regular", "cashier", "manager", "superuser"),
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { name, email, birthday } = req.body || {};

      const present = {
        name: Object.prototype.hasOwnProperty.call(req.body || {}, "name"),
        email: Object.prototype.hasOwnProperty.call(req.body || {}, "email"),
        birthday: Object.prototype.hasOwnProperty.call(
          req.body || {},
          "birthday"
        ),
      };

      const updates = {};

      if (present.name && name !== null) {
        const trimmed = String(name).trim();
        if (trimmed.length < 1 || trimmed.length > 50) {
          return res.status(400).json({ message: "Bad Request" });
        }
        updates.name = trimmed;
      }

      if (present.email && email !== null) {
        if (!isUofT(email)) {
          return res.status(400).json({ message: "Bad Request" });
        }
        updates.email = String(email);
      }

      if (present.birthday && birthday !== null) {
        const s = String(birthday);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          return res.status(400).json({ message: "Bad Request" });
        }
        const d = new Date(`${s}T00:00:00.000Z`);
        const [yy, mm, dd] = s.split("-").map(Number);
        if (
          d.getUTCFullYear() !== yy ||
          d.getUTCMonth() + 1 !== mm ||
          d.getUTCDate() !== dd
        ) {
          return res.status(400).json({ message: "Bad Request" });
        }
        updates.birthday = d;
      }

      if (req.file) {
        const mime = (req.file.mimetype || "").toLowerCase();
        const allowed = new Map([
          ["image/png", ".png"],
          ["image/jpeg", ".jpg"],
          ["image/jpg", ".jpg"],
          ["image/webp", ".webp"],
        ]);
        const ext = allowed.get(mime);
        if (!ext) {
          try {
            fs.unlinkSync(req.file.path);
          } catch {}
          return res.status(400).json({ message: "Bad Request" });
        }
        const target = path.join(AVATAR_DIR, `${req.me.utorid}${ext}`);
        if (req.file.path !== target) {
          try {
            fs.renameSync(req.file.path, target);
          } catch {}
        }
        updates.avatarUrl = `/uploads/avatars/${req.me.utorid}${ext}`;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No update fields provided" });
      }

      const u = await prisma.user.update({
        where: { id: req.me.id },
        data: updates,
        select: {
          id: true,
          utorid: true,
          name: true,
          email: true,
          birthday: true,
          role: true,
          points: true,
          createdAt: true,
          lastLogin: true,
          verified: true,
          avatarUrl: true,
        },
      });

      const birthdayStr = u.birthday
        ? u.birthday.toISOString().slice(0, 10)
        : null;

      return res.json({
        id: u.id,
        utorid: u.utorid,
        name: u.name,
        email: u.email,
        birthday: birthdayStr,
        role: u.role,
        points: u.points,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        verified: u.verified,
        avatarUrl: u.avatarUrl,
      });
    } catch (e) {
      if (e?.code === "P2002") {
        return res.status(409).json({ message: "Conflict" });
      }
      if (
        typeof e?.message === "string" &&
        e.message.includes("Record to update not found")
      ) {
        return res.status(404).json({ message: "Not Found" });
      }
      return res.status(400).json({ message: "Bad Request" });
    }
  }
);

app.get(
  "/users/:userId",

  need("cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.userId)) {
        return res.status(404).json({ error: "Not Found" });
      }
      const id = Number(req.params.userId);

      const u = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          utorid: true,
          name: true,
          email: true,
          birthday: true,
          role: true,
          points: true,
          createdAt: true,
          lastLogin: true,
          verified: true,
          avatarUrl: true,
        },
      });
      if (!u) return res.status(404).json({ error: "Not Found" });

      const now = new Date();
      const availablePromotions = await prisma.promotion.findMany({
        where: {
          type: "onetime",
          startTime: { lte: now },
          endTime: { gt: now },
          usages: { none: { userId: id } },
        },
        select: {
          id: true,
          name: true,
          minSpending: true,
          rate: true,
          points: true,
        },
        orderBy: { id: "asc" },
      });

      const isManagerPlus =
        req.auth &&
        (req.auth.role === "manager" || req.auth.role === "superuser");

      if (!isManagerPlus) {
        return res.json({
          id: u.id,
          utorid: u.utorid,
          name: u.name,
          points: u.points,
          verified: u.verified,
          promotions: availablePromotions,
        });
      }

      const birthdayStr = u.birthday
        ? u.birthday.toISOString().slice(0, 10)
        : null;

      return res.json({
        id: u.id,
        utorid: u.utorid,
        name: u.name,
        email: u.email,
        birthday: birthdayStr,
        role: u.role,
        points: u.points,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        verified: u.verified,
        avatarUrl: u.avatarUrl,
        promotions: availablePromotions,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.patch("/users/:userId", need("manager", "superuser"), async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.userId)) {
      return res.status(404).json({ error: "Not Found" });
    }
    const id = Number(req.params.userId);

    const { email, verified, suspicious, role } = req.body || {};

    const present = {
      email: Object.prototype.hasOwnProperty.call(req.body || {}, "email"),
      verified: Object.prototype.hasOwnProperty.call(
        req.body || {},
        "verified"
      ),
      suspicious: Object.prototype.hasOwnProperty.call(
        req.body || {},
        "suspicious"
      ),
      role: Object.prototype.hasOwnProperty.call(req.body || {}, "role"),
    };

    if (
      !present.email &&
      !present.verified &&
      !present.suspicious &&
      !present.role
    ) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const actorIsSuperuser = req.auth.role === "superuser";

    const current = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        utorid: true,
        name: true,
        suspicious: true,
        role: true,
      },
    });
    if (!current) return res.status(404).json({ error: "Not Found" });

    const updates = {};

    if (present.email && email !== null) {
      if (!isUofT(email)) return res.status(400).json({ error: "Bad Request" });
      updates.email = String(email);
    }

    if (present.verified && verified !== null) {
      if (verified !== true)
        return res.status(400).json({ error: "Bad Request" });
      updates.verified = true;
    }

    if (present.suspicious && suspicious !== null) {
      updates.suspicious = !!suspicious;
    }

    if (present.role && role !== null) {
      const r = String(role);
      if (actorIsSuperuser) {
        if (!["regular", "cashier", "manager", "superuser"].includes(r)) {
          return res.status(400).json({ error: "Bad Request" });
        }
      } else {
        if (!["regular", "cashier"].includes(r)) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      if (
        r === "cashier" &&
        (present.suspicious ? !!suspicious : current.suspicious)
      ) {
        return res.status(400).json({ error: "Bad Request" });
      }
      updates.role = r;
    }

    const u = Object.keys(updates).length
      ? await prisma.user.update({
          where: { id },
          data: updates,
          select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            verified: true,
            suspicious: true,
            role: true,
          },
        })
      : await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            verified: true,
            suspicious: true,
            role: true,
          },
        });

    const resp = { id: u.id, utorid: u.utorid, name: u.name };

    if (present.email) resp.email = email === null ? null : u.email;
    if (present.verified) resp.verified = verified === null ? null : u.verified;
    if (present.suspicious)
      resp.suspicious = suspicious === null ? null : u.suspicious;
    if (present.role) resp.role = role === null ? null : u.role;

    return res.json(resp);
  } catch (e) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Conflict" });
    }
    if (
      typeof e?.message === "string" &&
      e.message.includes("Record to update not found")
    ) {
      return res.status(404).json({ error: "Not Found" });
    }
    return res.status(400).json({ error: "Bad Request" });
  }
});

app.patch(
  "/users/me/password",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      const { old: oldPassword, new: newPassword } = req.body || {};

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Missing fields" });
      }

      if (!pwStrong(newPassword)) {
        return res.status(400).json({ error: "Weak password" });
      }

      const u = await prisma.user.findUnique({ where: { id: req.me.id } });
      if (!u) return res.status(404).json({ error: "Not Found" });

      const ok = await bcrypt.compare(oldPassword, u.password);
      if (!ok) return res.status(403).json({ error: "Forbidden" });

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: u.id },
        data: { password: hashed },
      });

      return res.sendStatus(200);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ error: "Bad Request" });
    }
  }
);

function isISODate(value) {
  if (typeof value !== "string") return false;
  const re =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

//----------------TRANSACTIONS----------------//

// POST /transactions - create purchase or adjustment
app.post(
  "/transactions",
  need("cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      const {
        utorid,
        type,
        spent,
        amount,
        relatedId,
        promotionIds = [],
        remark = "",
      } = req.body || {};

      if (!utorid || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!isUtorid(utorid)) {
        return res.status(400).json({ message: "Bad Request" });
      }

      if (type !== "purchase" && type !== "adjustment") {
        return res.status(400).json({ message: "Bad Request" });
      }

      const customer = await prisma.user.findUnique({
        where: { utorid: String(utorid).trim() },
      });
      if (!customer) {
        return res.status(404).json({ message: "User not found" });
      }

      const creator = await prisma.user.findUnique({
        where: { id: Number(req.auth?.sub ?? req.auth?.id) },
      });
      if (!creator) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (type === "purchase") {
        if (
          typeof spent !== "number" ||
          !Number.isFinite(spent) ||
          spent <= 0
        ) {
          return res.status(400).json({ message: "Bad Request" });
        }

        const basePoints = Math.round(spent / 0.25);

        const now = new Date();
        let extraRatePoints = 0;
        let extraFixedPoints = 0;
        const validPromoIds = [];

        if (!Array.isArray(promotionIds)) {
          return res.status(400).json({ message: "Bad Request" });
        }

        if (promotionIds.length > 0) {
          const promRows = await prisma.promotion.findMany({
            where: {
              id: {
                in: promotionIds.map(Number).filter((n) => Number.isInteger(n)),
              },
            },
          });

          const foundIds = new Set(promRows.map((p) => p.id));
          for (const pid of promotionIds) {
            if (!foundIds.has(Number(pid))) {
              return res.status(400).json({ message: "Promotion not active" });
            }
          }

          for (const pr of promRows) {
            if (!(pr.startTime <= now && now < pr.endTime)) {
              return res.status(400).json({ message: "Promotion not active" });
            }

            if (pr.minSpending != null && spent < pr.minSpending) {
              return res.status(400).json({ message: "Promotion not active" });
            }

            if (pr.type === "onetime") {
              const usage = await prisma.promotionUsage.findUnique({
                where: {
                  userId_promotionId: {
                    userId: customer.id,
                    promotionId: pr.id,
                  },
                },
              });
              if (usage?.usedAt) {
                return res
                  .status(400)
                  .json({ message: "Promotion already used" });
              }
            }

            if (pr.rate != null) {
              extraRatePoints += Math.round(spent * pr.rate * 100);
            }
            if (pr.points != null) {
              extraFixedPoints += pr.points;
            }
            validPromoIds.push(pr.id);
          }
        }

        const totalEarned = basePoints + extraRatePoints + extraFixedPoints;
        const isSuspicious = !!creator.suspicious;

        const txOps = [];
        txOps.push(
          prisma.transaction.create({
            data: {
              type: "purchase",
              amount: totalEarned,
              spent,
              suspicious: isSuspicious,
              remark: String(remark ?? ""),
              userId: customer.id,
              createdById: creator.id,
              promotions: validPromoIds.length
                ? {
                    createMany: {
                      data: validPromoIds.map((pid) => ({ promotionId: pid })),
                    },
                  }
                : undefined,
            },
          })
        );

        if (validPromoIds.length) {
          const appliedOnetime = await prisma.promotion.findMany({
            where: { id: { in: validPromoIds }, type: "onetime" },
            select: { id: true },
          });
          if (appliedOnetime.length) {
            for (const p of appliedOnetime) {
              txOps.push(
                prisma.promotionUsage.upsert({
                  where: {
                    userId_promotionId: {
                      userId: customer.id,
                      promotionId: p.id,
                    },
                  },
                  update: { usedAt: now },
                  create: {
                    userId: customer.id,
                    promotionId: p.id,
                    usedAt: now,
                  },
                })
              );
            }
          }
        }

        const [transaction] = await prisma.$transaction(txOps);

        if (!isSuspicious && totalEarned > 0) {
          await prisma.user.update({
            where: { id: customer.id },
            data: { points: { increment: totalEarned } },
          });
        }

        return res.status(201).json({
          id: transaction.id,
          utorid: customer.utorid,
          type: "purchase",
          spent,
          earned: isSuspicious ? 0 : totalEarned,
          remark: String(remark ?? ""),
          promotionIds: validPromoIds,
          createdBy: creator.utorid,
        });
      }

      if (type === "adjustment") {
        if (!["manager", "superuser"].includes(req.auth.role)) {
          return res.status(403).json({ message: "Permission denied." });
        }

        if (!Number.isInteger(amount)) {
          return res.status(400).json({ message: "Bad Request" });
        }

        if (relatedId === undefined || !Number.isInteger(Number(relatedId))) {
          return res.status(400).json({ message: "Bad Request" });
        }

        const relatedTransaction = await prisma.transaction.findUnique({
          where: { id: Number(relatedId) },
        });
        if (!relatedTransaction) {
          return res
            .status(404)
            .json({ message: "Related transaction not found" });
        }

        const transaction = await prisma.transaction.create({
          data: {
            type: "adjustment",
            amount: Number(amount),
            remark: String(remark ?? ""),
            relatedTransactionId: Number(relatedId),
            userId: customer.id,
            createdById: creator.id,
          },
        });

        if (amount > 0) {
          await prisma.user.update({
            where: { id: customer.id },
            data: { points: { increment: amount } },
          });
        } else if (amount < 0) {
          await prisma.user.update({
            where: { id: customer.id },
            data: { points: { decrement: Math.abs(amount) } },
          });
        }

        return res.status(201).json({
          id: transaction.id,
          utorid: customer.utorid,
          amount: Number(amount),
          type: "adjustment",
          relatedId: Number(relatedId),
          remark: String(remark ?? ""),
          promotionIds: [],
          createdBy: creator.utorid,
        });
      }

      return res.status(400).json({ message: "Bad Request" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET /transactions/:transactionId - get single transaction
app.get(
  "/transactions/:transactionId",
  need("manager", "superuser"),
  async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId, 10);
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transactionId" });
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          createdBy: true,
          promotions: {
            include: { promotion: true },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const promotionIds = transaction.promotions.map((tp) => tp.promotionId);

      let response = {
        id: transaction.id,
        utorid: transaction.user.utorid,
        type: transaction.type,
        amount: transaction.amount,
        promotionIds: promotionIds,
        suspicious: transaction.suspicious,
        remark: transaction.remark,
        createdBy: transaction.createdBy.utorid,
      };

      if (transaction.type === "purchase") {
        response.spent = transaction.spent;
      } else if (transaction.type === "redemption") {
        response.redeemed = transaction.redeemed;
        response.relatedId = transaction.processedById;
      } else if (transaction.type === "adjustment") {
        response.relatedId = transaction.relatedTransactionId;
      } else if (transaction.type === "transfer") {
        response.relatedId = transaction.relatedUserId;
      } else if (transaction.type === "event") {
        response.relatedId = transaction.eventId;
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /transactions/:transactionId/suspicious
app.patch(
  "/transactions/:transactionId/suspicious",
  need("manager", "superuser"),
  async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId, 10);
      const { suspicious } = req.body || {};

      if (typeof suspicious !== "boolean" || isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          createdBy: true,
          promotions: {
            include: { promotion: true },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const oldSuspicious = transaction.suspicious;
      const user = transaction.user;

      if (suspicious) {
        await prisma.user.update({
          where: { id: user.id },
          data: { points: { decrement: transaction.amount } },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { points: { increment: transaction.amount } },
        });
      }

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { suspicious: suspicious },
      });

      const promotionIds = transaction.promotions.map((p) => p.promotionId);

      let response = {
        id: transaction.id,
        utorid: transaction.user.utorid,
        type: transaction.type,
        amount: transaction.amount,
        promotionIds: promotionIds,
        suspicious: suspicious,
        remark: transaction.remark,
        createdBy: transaction.createdBy.utorid,
      };

      if (transaction.type === "purchase") {
        response.spent = transaction.spent;
      } else if (transaction.type === "redemption") {
        response.redeemed = transaction.redeemed;
        response.relatedId = transaction.processedById;
      } else if (transaction.type === "adjustment") {
        response.relatedId = transaction.relatedTransactionId;
      } else if (transaction.type === "transfer") {
        response.relatedId = transaction.relatedUserId;
      } else if (transaction.type === "event") {
        response.relatedId = transaction.eventId;
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /transactions/:transactionId/processed
app.patch(
  "/transactions/:transactionId/processed",
  need("cashier", "manager", "superuser"),
  async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId, 10);

      const { processed } = req.body || {};
      if (processed !== true) {
        return res.status(400).json({ error: "Invalid payload" });
      }
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transactionId" });
      }

      let transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true, createdBy: true },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      if (transaction.type !== "redemption") {
        return res.status(400).json({ error: "Not redemption type" });
      }
      if (transaction.processed) {
        return res.status(400).json({ error: "Already processed" });
      }

      const processedById = Number(req.auth.sub);

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          processed: true,
          processedById: processedById,
          processedAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: transaction.user.id },
        data: { points: { decrement: transaction.redeemed } },
      });

      let processedBy = await prisma.user.findUnique({
        where: { id: processedById },
      });

      const response = {
        id: transaction.id,
        utorid: transaction.user.utorid,
        type: transaction.type,
        redeemed: transaction.redeemed,
        remark: transaction.remark,
        createdBy: transaction.createdBy.utorid,
        processedBy: processedBy.utorid,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /transactions - list all (manager view)
app.get("/transactions", need("manager", "superuser"), async (req, res) => {
  try {
    let {
      name,
      createdBy,
      suspicious,
      promotionId,
      type,
      relatedId,
      amount,
      operator,
      page,
      limit,
    } = req.query;

    const p = toInt(page, 1);
    const l = toInt(limit, 10);
    const skip = (p - 1) * l;

    let where = {};

    if (name) {
      where.user = {
        OR: [{ utorid: { contains: name } }, { name: { contains: name } }],
      };
    }

    if (createdBy) {
      where.createdBy = {
        utorid: createdBy,
      };
    }

    if (suspicious !== undefined) {
      where.suspicious = toBool(suspicious);
    }

    if (promotionId) {
      const promoIdNum = parseInt(promotionId, 10);
      if (isNaN(promoIdNum)) {
        return res.status(400).json({ error: "Invalid promotionId" });
      }
      where.promotions = {
        some: { promotionId: promoIdNum },
      };
    }

    if (type) {
      where.type = type;
    }

    if (type && relatedId) {
      const relatedIdNum = parseInt(relatedId, 10);
      if (isNaN(relatedIdNum)) {
        return res.status(400).json({ error: "Invalid relatedId" });
      }

      if (type === "adjustment") {
        where.relatedTransactionId = relatedIdNum;
      } else if (type === "transfer") {
        where.relatedUserId = relatedIdNum;
      } else if (type === "redemption") {
        where.processedById = relatedIdNum;
      } else if (type === "event") {
        where.eventId = relatedIdNum;
      }
    }

    if (amount !== undefined && operator) {
      const amountNum = parseInt(amount, 10);
      if (isNaN(amountNum)) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      if (operator === "gte") {
        where.amount = { gte: amountNum };
      } else if (operator === "lte") {
        where.amount = { lte: amountNum };
      } else {
        return res.status(400).json({ error: "Invalid operator" });
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: where,
      skip: skip,
      take: l,
      include: {
        user: true,
        createdBy: true,
        relatedUser: true,
        promotions: {
          include: { promotion: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const count = await prisma.transaction.count({ where: where });

    const results = transactions.map((t) => {
      const promotionIds = t.promotions.map((p) => p.promotionId);

      let temp = {
        id: t.id,
        utorid: t.user.utorid,
        type: t.type,
        amount: t.amount,
        promotionIds: promotionIds,
        suspicious: t.suspicious,
        remark: t.remark,
        createdBy: t.createdBy.utorid,
      };
      if (t.type === "purchase") {
        temp.spent = t.spent;
      } else if (t.type === "redemption") {
        temp.redeemed = t.redeemed;
        temp.relatedId = t.processedById;
        // Modifications made here to expose the processed variable
          temp.processed = t.processed;
          temp.processedBy = t.processedBy;
      } else if (t.type === "adjustment") {
        temp.relatedId = t.relatedTransactionId;
      } else if (t.type === "transfer") {
        temp.relatedId = t.relatedUserId;
        temp.relatedUtorid = t.relatedUser?.utorid;
      } else if (t.type === "event") {
        temp.relatedId = t.eventId;
      }

      return temp;
    });

    return res.status(200).json({
      count: count,
      results: results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//----------------EVENTS----------------//

// helper

const isStrictISO = (s) => {
  if (typeof s !== "string") return false;
  const d = new Date(s);
  return (
    !Number.isNaN(d.getTime()) &&
    /[zZ]|[+\-]\d{2}:\d{2}$/.test(s) &&
    d.toISOString() === new Date(d.toISOString()).toISOString()
  );
};
const hasStarted = (ev) => new Date(ev.startTime).getTime() <= Date.now();
const hasEnded = (ev) => new Date(ev.endTime).getTime() <= Date.now();

//
// POST /events - create event (manager+)
//
app.post("/events", need("manager", "superuser"), async (req, res) => {
  let {
    name,
    description,
    location,
    startTime,
    endTime,
    capacity,
    points,
    organizers,
    published,
  } = req.body || {};

  name = typeof name === "string" ? name.trim() : name;
  description =
    typeof description === "string" ? description.trim() : description;
  location = typeof location === "string" ? location.trim() : location;

  if (
    !name ||
    !description ||
    !location ||
    !startTime ||
    !endTime ||
    points === undefined
  )
    return res.status(400).json({ error: "Bad Request" });

  if (!isStrictISO(startTime) || !isStrictISO(endTime))
    return res.status(400).json({ error: "Bad Request" });

  const s = new Date(startTime);
  const e = new Date(endTime);
  const now = Date.now();

  if (s >= e) return res.status(400).json({ error: "Bad Request" });
  if (s.getTime() <= now || e.getTime() <= now)
    return res.status(400).json({ error: "Bad Request" });

  const ptsNum = Number(points);
  if (!Number.isInteger(ptsNum) || ptsNum <= 0)
    return res.status(400).json({ error: "Bad Request" });

  let cap = null;
  if (capacity !== undefined && capacity !== null) {
    const capNum = Number(capacity);
    if (!Number.isInteger(capNum) || capNum <= 0)
      return res.status(400).json({ error: "Bad Request" });
    cap = capNum;
  }

  if (published && s.getTime() < now)
    return res.status(400).json({ error: "Bad Request" });

  try {
    let organizerCreate;
    if (Array.isArray(organizers) && organizers.length > 0) {
      const ids = [];
      for (const o of organizers) {
        if (typeof o === "string") {
          const u = await prisma.user.findUnique({ where: { utorid: o } });
          if (!u) return res.status(400).json({ error: "Bad Request" });
          ids.push(u.id);
        } else if (
          typeof o === "number" ||
          (typeof o === "string" && /^\d+$/.test(o))
        ) {
          const id = Number(o);
          if (!Number.isInteger(id))
            return res.status(400).json({ error: "Bad Request" });
          const u = await prisma.user.findUnique({ where: { id } });
          if (!u) return res.status(400).json({ error: "Bad Request" });
          ids.push(id);
        } else {
          return res.status(400).json({ error: "Bad Request" });
        }
      }
      const uniqueIds = [...new Set(ids)];
      organizerCreate = uniqueIds.map((userId) => ({ userId }));
    }

    const created = await prisma.event.create({
      data: {
        name,
        description,
        location,
        startTime: s,
        endTime: e,
        capacity: cap,
        pointsTotal: ptsNum,
        pointsRemain: ptsNum,
        published: !!published,
        organizers: organizerCreate ? { create: organizerCreate } : undefined,
      },
      include: { organizers: true, guests: true },
    });

    return res.status(201).json({
      id: created.id,
      name: created.name,
      description: created.description,
      location: created.location,
      startTime: created.startTime.toISOString(),
      endTime: created.endTime.toISOString(),
      capacity: created.capacity,
      pointsRemain: created.pointsRemain,
      pointsAwarded: created.pointsAwarded,
      published: created.published,
      organizers: [],
      guests: [],
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Bad Request" });
  }
});

//
// GET /events - list events (regular+ with filters). Manager+ gets published filter option
//
app.get(
  "/events",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const { name, location, started, ended, showFull, published } = req.query;

    const toBool = (v) =>
      typeof v === "string"
        ? ["true", "1", "yes"].includes(v.toLowerCase())
        : !!v;

    let page = 1;
    if (req.query.page !== undefined) {
      const n = Number(req.query.page);
      if (!Number.isInteger(n) || n < 1) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      page = n;
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
      const n = Number(req.query.limit);
      if (!Number.isInteger(n) || n < 1) {
        return res.status(400).json({ message: "Invalid limit number" });
      }
      limit = n;
    }

    const isManagerPlus = ["manager", "superuser"].includes(req.auth.role);

    if (started !== undefined && ended !== undefined) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const now = new Date();
    const where = {};

    if (name) where.name = { contains: String(name) };
    if (location) where.location = { contains: String(location) };

    if (started !== undefined) {
      where.startTime = toBool(started) ? { lte: now } : { gt: now };
    }
    if (ended !== undefined) {
      where.endTime = toBool(ended) ? { lte: now } : { gt: now };
    }

    if (isManagerPlus) {
      if (published !== undefined) {
        where.published = toBool(published);
      }
    } else {
      where.published = true;
    }

    try {
      const all = await prisma.event.findMany({
        where,
        orderBy: { startTime: "asc" },
        include: {
          _count: { select: { guests: { where: { confirmed: true } } } },
        },
      });

      const includeFull = toBool(showFull);
      const filtered = all.filter((ev) => {
        if (includeFull) return true;
        if (ev.capacity == null) return true;
        return ev._count.guests < ev.capacity;
      });

      const count = filtered.length;

      const start = (page - 1) * limit;
      const pageItems = filtered.slice(start, start + limit);

      const results = pageItems.map((ev) => {
        const base = {
          id: ev.id,
          name: ev.name,
          location: ev.location,
          startTime: ev.startTime.toISOString(),
          endTime: ev.endTime.toISOString(),
          capacity: ev.capacity,
          numGuests: ev._count.guests,
        };
        if (isManagerPlus) {
          return {
            ...base,
            pointsRemain: ev.pointsRemain,
            pointsAwarded: ev.pointsAwarded,
            published: ev.published,
          };
        }
        return base;
      });

      return res.status(200).json({ count, results });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ error: "Bad Request" });
    }
  }
);

//
// GET /events/:id - single event (regular vs manager+ / organizer)
//
app.get(
  "/events/:id",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(404).json({ error: "Not Found" });

    const ev = await prisma.event.findUnique({
      where: { id },
      include: {
        organizers: { include: { user: true } },
        guests: { include: { user: true } },
      },
    });
    if (!ev) return res.status(404).json({ error: "Not Found" });

    const isManagerPlus = ["manager", "superuser"].includes(req.auth.role);
    const currentUserId = Number(req.auth?.sub ?? req.auth?.id);
    const isOrganizer =
      Number.isInteger(currentUserId) &&
      ev.organizers.some((o) => o.userId === currentUserId);

    if (!ev.published && !isManagerPlus && !isOrganizer) {
      return res.status(404).json({ error: "Not Found" });
    }

    const numRsvped = ev.guests.reduce((acc, g) => acc + (g.rsvped ? 1 : 0), 0);
    const isRsvped = ev.guests.some((g) => g.userId === currentUserId);

    if (!isManagerPlus && !isOrganizer) {
      return res.json({
        id: ev.id,
        name: ev.name,
        description: ev.description,
        location: ev.location,
        startTime: ev.startTime.toISOString(),
        endTime: ev.endTime.toISOString(),
        capacity: ev.capacity,
        organizers: ev.organizers.map((o) => ({
          id: o.user.id,
          utorid: o.user.utorid,
          name: o.user.name,
        })),
        numGuests: numRsvped,
        rsvped: isRsvped,
      });
    }

    return res.json({
      id: ev.id,
      name: ev.name,
      description: ev.description,
      location: ev.location,
      startTime: ev.startTime.toISOString(),
      endTime: ev.endTime.toISOString(),
      capacity: ev.capacity,
      pointsRemain: ev.pointsRemain,
      pointsAwarded: ev.pointsAwarded,
      published: ev.published,
      organizers: ev.organizers.map((o) => ({
        id: o.user.id,
        utorid: o.user.utorid,
        name: o.user.name,
      })),
      guests: ev.guests.map((g) => ({
        id: g.userId,
        utorid: g.user?.utorid,
        name: g.user?.name,
        rsvped: g.rsvped,
        confirmed: g.confirmed,
      })),
    });
  }
);

//
// POST /events/:id/guests/me  (regular)
//
app.post(
  "/events/:id/guests/me",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id))
      return res.status(404).json({ error: "Not Found" });

    const ev = await prisma.event.findUnique({
      where: { id },
      include: { organizers: true, guests: true },
    });
    if (!ev) return res.status(404).json({ error: "Not Found" });

    if (!ev.published) return res.status(404).json({ error: "Not Found" });

    if (hasEnded(ev)) return res.status(410).json({ error: "Gone" });

    const uid = req.me.id;
    // cannot RSVP if organizer
    if (ev.organizers.some((o) => o.userId === uid))
      return res.status(400).json({ error: "Bad Request" });

    const confirmed = ev.guests.filter((g) => g.confirmed).length;
    if (
      ev.capacity !== null &&
      ev.capacity !== undefined &&
      confirmed >= ev.capacity
    )
      return res.status(410).json({ error: "Gone" });

    const existing = await prisma.eventGuest.findUnique({
      where: { eventId_userId: { eventId: id, userId: uid } },
    });
    if (existing) return res.status(400).json({ error: "Bad Request" });

    try {
      await prisma.eventGuest.create({
        data: { eventId: id, userId: uid, rsvped: true, confirmed: false },
      });
      return res.status(201).json({
        id: ev.id,
        name: ev.name,
        location: ev.location,
        guestAdded: { id: req.me.id, utorid: req.me.utorid, name: req.me.name },
        numGuests: ev.guests.length + 1,
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ error: "Bad Request" });
    }
  }
);

//
// DELETE /events/:id/guests/me  (regular) - remove yourself
//

app.delete(
  "/events/:id/guests/me",
  need("regular"), // spec: Regular only
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Not Found" });
    }

    const ev = await prisma.event.findUnique({
      where: { id },
      select: { id: true, endTime: true },
    });
    if (!ev) {
      return res.status(404).json({ message: "Not Found" });
    }

    // ended? -> 410 Gone with exact message
    const now = new Date();
    if (ev.endTime && ev.endTime <= now) {
      return res
        .status(410)
        .json({ message: "Cannot delete guest after event end." });
    }

    // current user id from auth (avoid req.me)
    const uid = Number(req.auth?.sub ?? req.auth?.id);
    if (!Number.isInteger(uid)) {
      return res.status(403).json({ message: "Permission denied." });
    }

    const guest = await prisma.eventGuest.findUnique({
      where: { eventId_userId: { eventId: id, userId: uid } },
      select: { eventId: true, userId: true },
    });
    if (!guest) {
      return res.status(404).json({ message: "Not Found" });
    }

    await prisma.eventGuest.delete({
      where: { eventId_userId: { eventId: id, userId: uid } },
    });

    return res.status(204).send();
  }
);

// POST /events/:id/guests  (manager+ or organizer of event)
// body: { utorid }
app.post(
  "/events/:id/guests",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { utorid } = req.body || {};
    if (!Number.isFinite(id) || !utorid)
      return res.status(400).json({ message: "Missing fields" });

    const ev = await prisma.event.findUnique({
      where: { id },
      include: { organizers: true },
    });
    if (!ev) return res.status(404).json({ message: "Not Found" });

    const isManagerPlus = ["manager", "superuser"].includes(req.auth.role);
    const authUserId = Number(req.auth?.sub ?? req.auth?.id);
    const isOrganizer =
      Number.isInteger(authUserId) &&
      ev.organizers.some((o) => o.userId === authUserId);
    if (!isManagerPlus && !isOrganizer)
      return res.status(403).json({ message: "Permission denied." });

    if (!ev.published && !isManagerPlus)
      return res.status(404).json({ message: "Not Found" });

    const now = new Date();
    if (ev.endTime && ev.endTime <= now)
      return res.status(410).json({ message: "Event has ended." });

    const user = await prisma.user.findUnique({
      where: { utorid: String(utorid).trim() },
    });
    if (!user) return res.status(400).json({ message: "Bad Request" });

    if (ev.organizers.some((o) => o.userId === user.id))
      return res.status(400).json({ message: "Bad Request" });

    const totalGuests = await prisma.eventGuest.count({
      where: { eventId: id },
    });
    if (ev.capacity != null && totalGuests >= ev.capacity) {
      return res.status(410).json({ message: "Event is at full capacity." });
    }

    const existing = await prisma.eventGuest.findUnique({
      where: { eventId_userId: { eventId: id, userId: user.id } },
    });
    if (existing) return res.status(409).json({ message: "Conflict" });

    await prisma.eventGuest.create({
      data: { eventId: id, userId: user.id, rsvped: true, confirmed: false },
    });

    const newCount = totalGuests + 1;

    return res.status(201).json({
      id: ev.id,
      name: ev.name,
      location: ev.location,
      guestAdded: { id: user.id, utorid: user.utorid, name: user.name },
      numGuests: newCount,
    });
  }
);

//
// DELETE /events/:id/guests/:userId  (manager only)
// returns 204 on success
//
app.delete(
  "/events/:id/guests/:userId",
  need("manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const uid = parseInt(req.params.userId, 10);
    if (!Number.isFinite(id) || !Number.isFinite(uid))
      return res.status(404).json({ error: "Not Found" });

    try {
      await prisma.eventGuest.delete({
        where: { eventId_userId: { eventId: id, userId: uid } },
      });
      return res.status(204).send();
    } catch (e) {
      return res.status(404).json({ error: "Not Found" });
    }
  }
);

//
// POST /events/:id/organizers  (manager+)
//
app.post(
  "/events/:id/organizers",
  need("manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { utorid } = req.body || {};
    if (!Number.isFinite(id) || !utorid) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const ev = await prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, location: true, endTime: true },
    });
    if (!ev) {
      return res.status(404).json({ message: "Event not found." });
    }

    const now = new Date();
    if (ev.endTime && ev.endTime <= now) {
      return res.status(410).json({ message: "Event has ended." });
    }

    const user = await prisma.user.findUnique({
      where: { utorid: String(utorid).trim() },
      select: { id: true, utorid: true, name: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const guest = await prisma.eventGuest.findUnique({
      where: { eventId_userId: { eventId: id, userId: user.id } },
      select: { eventId: true, userId: true },
    });
    if (guest) {
      return res
        .status(400)
        .json({ message: "User is a guest. Remove user as guest first." });
    }

    try {
      await prisma.eventOrganizer.create({
        data: { eventId: id, userId: user.id },
      });

      const updated = await prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          location: true,
          organizers: {
            include: {
              user: { select: { id: true, utorid: true, name: true } },
            },
            orderBy: { userId: "asc" },
          },
        },
      });

      return res.status(201).json({
        id: updated.id,
        name: updated.name,
        location: updated.location,
        organizers: updated.organizers.map((o) => ({
          id: o.user.id,
          utorid: o.user.utorid,
          name: o.user.name,
        })),
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: "Bad Request" });
    }
  }
);

//
// DELETE /events/:id/organizers/:userId  (manager+)
// returns 204 on success
//
app.delete(
  "/events/:id/organizers/:userId",
  need("manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const uid = parseInt(req.params.userId, 10);
    if (!Number.isFinite(id) || !Number.isFinite(uid))
      return res.status(404).json({ error: "Not Found" });

    try {
      await prisma.eventOrganizer.delete({
        where: { eventId_userId: { eventId: id, userId: uid } },
      });
      return res.status(204).send();
    } catch (e) {
      // if not found -> 404
      if (
        String(e.message).includes("An operation failed") ||
        String(e.message).includes("Record to delete does not exist")
      ) {
        return res.status(404).json({ error: "Not Found" });
      }
      console.error(e);
      return res.status(400).json({ error: "Bad Request" });
    }
  }
);

//
// POST /events/:id/transactions  (manager+ or organizer)
// Body: { type: "event", utorid? , amount, remark? }
// If utorid omitted -> award to ALL guests
//
app.post(
  "/events/:id/transactions",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    // permission: manager+ or organizer for this event (handout). Regular users not allowed unless organizer
    const id = parseInt(req.params.id, 10);
    const { type, utorid, amount, remark } = req.body || {};
    if (!Number.isFinite(id) || !type || amount === undefined)
      return res.status(400).json({ error: "Missing fields" });
    if (type !== "event") return res.status(400).json({ error: "Bad Request" });

    const pts = parseInt(amount, 10);
    if (Number.isNaN(pts) || pts <= 0)
      return res.status(400).json({ error: "Bad Request" });

    const ev = await prisma.event.findUnique({
      where: { id },
      include: { guests: true, organizers: true },
    });
    if (!ev) return res.status(404).json({ error: "Not Found" });

    // permission check
    const isManagerPlus = ["manager", "superuser"].includes(req.auth.role);
    const isOrganizer = ev.organizers.some(
      (o) => o.userId === Number(req.auth.sub)
    );
    if (!isManagerPlus && !isOrganizer)
      return res.status(403).json({ error: "Forbidden" });

    // awarding after event ended is allowed per handout (can be done after event ended)
    // If utorid provided -> award to single guest
    if (utorid) {
      const user = await prisma.user.findUnique({ where: { utorid } });
      if (!user) return res.status(400).json({ error: "Bad Request" });

      // ensure that user is on guest list
      const guest = await prisma.eventGuest.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      });
      if (!guest) return res.status(400).json({ error: "Bad Request" });

      if (ev.pointsRemain < pts)
        return res.status(400).json({ error: "Bad Request" });

      // create transaction + update points + update event atomically
      try {
        const [tx] = await prisma.$transaction([
          prisma.transaction.create({
            data: {
              type: "event",
              amount: pts,
              userId: user.id,
              createdById: Number(req.auth.sub),
              remark: remark || null,
              eventId: ev.id,
              processed: true,
              processedAt: new Date(),
              processedById: Number(req.auth.sub),
            },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: pts } },
          }),
          prisma.event.update({
            where: { id: ev.id },
            data: {
              pointsRemain: { decrement: pts },
              pointsAwarded: { increment: pts },
            },
          }),
        ]);
        return res.status(201).json({
          id: tx.id,
          recipient: utorid,
          awarded: tx.amount,
          type: tx.type,
          relatedId: ev.id,
          remark: tx.remark,
          createdBy: (
            await prisma.user.findUnique({
              where: { id: Number(req.auth.sub) },
            })
          ).utorid,
        });
      } catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Bad Request" });
      }
    }

    // utorid omitted -> award to ALL guests
    // award to all guests; if remaining points < guests*pts -> 400
    const guestList = ev.guests.map((g) => g.userId);
    if (!guestList.length)
      return res.status(400).json({ error: "Bad Request" });

    const totalNeeded = guestList.length * pts;
    if (ev.pointsRemain < totalNeeded)
      return res.status(400).json({ error: "Bad Request" });

    try {
      // build array of creates and user updates
      const ops = [];
      for (const uid of guestList) {
        ops.push(
          prisma.transaction.create({
            data: {
              type: "event",
              amount: pts,
              userId: uid,
              createdById: Number(req.auth.sub),
              remark: remark || null,
              eventId: ev.id,
              processed: true,
              processedAt: new Date(),
              processedById: Number(req.auth.sub),
            },
          })
        );
        ops.push(
          prisma.user.update({
            where: { id: uid },
            data: { points: { increment: pts } },
          })
        );
      }
      // finally update event points
      ops.push(
        prisma.event.update({
          where: { id: ev.id },
          data: {
            pointsRemain: { decrement: totalNeeded },
            pointsAwarded: { increment: totalNeeded },
          },
        })
      );

      const results = await prisma.$transaction(ops);

      // transaction create results are in even positions 0,2,4,... until the event update final
      const createdTxs = results.filter((r) => r && r.type === "event");
      const byUtorid = [];
      for (const t of createdTxs) {
        const u = await prisma.user.findUnique({ where: { id: t.userId } });
        byUtorid.push({
          id: t.id,
          recipient: u.utorid,
          awarded: t.amount,
          type: t.type,
          relatedId: ev.id,
          remark: t.remark,
          createdBy: (
            await prisma.user.findUnique({
              where: { id: Number(req.auth.sub) },
            })
          ).utorid,
        });
      }
      return res.status(201).json(byUtorid);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ error: "Bad Request" });
    }
  }
);

//
// PATCH /events/:id - update event (manager+ or organizer)
//
// app.patch(
//   "/events/:id",
//   need("regular", "cashier", "manager", "superuser"),
//   async (req, res) => {
//     const id = Number(req.params.id);
//     if (!Number.isInteger(id))
//       return res.status(404).json({ message: "Not Found" });

//     const ev = await prisma.event.findUnique({
//       where: { id },
//       include: { organizers: true, guests: true },
//     });
//     if (!ev) return res.status(404).json({ message: "Not Found" });

//     const isManagerPlus = ["manager", "superuser"].includes(req.auth.role);
//     const currentUserId = Number(req.auth?.sub ?? req.auth?.id);
//     const isOrganizer =
//       Number.isInteger(currentUserId) &&
//       ev.organizers.some((o) => o.userId === currentUserId);

//     if (!isManagerPlus && !isOrganizer)
//       return res.status(403).json({ message: "Permission denied." });

//     const {
//       name,
//       description,
//       location,
//       startTime,
//       endTime,
//       capacity,
//       points,
//       published,
//     } = req.body || {};

//     if (points !== undefined && points !== null) {
//       if (!isManagerPlus)
//         return res.status(403).json({ message: "Permission denied." });
//     }
//     if (published !== undefined && published !== null) {
//       if (!isManagerPlus)
//         return res.status(403).json({ message: "Permission denied." });
//     }

//     const provided = (v) => v !== undefined && v !== null;

//     const updates = {};
//     const nowMs = Date.now();
//     const originalStarted = new Date(ev.startTime).getTime() <= nowMs;
//     const originalEnded = new Date(ev.endTime).getTime() <= nowMs;

//     const cannotEditAfterStart = (fieldProvided) =>
//       originalStarted && fieldProvided;

//     if (cannotEditAfterStart(provided(name)))
//       return res.status(400).json({ message: "Bad Request" });
//     if (provided(name)) updates.name = String(name);

//     if (cannotEditAfterStart(provided(description)))
//       return res.status(400).json({ message: "Bad Request" });
//     if (provided(description)) updates.description = String(description);

//     if (cannotEditAfterStart(provided(location)))
//       return res.status(400).json({ message: "Bad Request" });
//     if (provided(location)) updates.location = String(location);

//     if (cannotEditAfterStart(provided(startTime)))
//       return res.status(400).json({ message: "Bad Request" });
//     if (provided(startTime)) {
//       if (!isISODate(startTime))
//         return res.status(400).json({ message: "Bad Request" });
//       const ns = new Date(startTime);
//       if (ns.getTime() < nowMs)
//         return res.status(400).json({ message: "Bad Request" });
//       updates.startTime = ns;
//     }

//     if (provided(endTime)) {
//       if (!isISODate(endTime))
//         return res.status(400).json({ message: "Bad Request" });
//       if (originalEnded)
//         return res.status(400).json({ message: "Bad Request" });
//       const ne = new Date(endTime);
//       if (ne.getTime() < nowMs)
//         return res.status(400).json({ message: "Bad Request" });
//       const baseStart = updates.startTime ?? ev.startTime;
//       if (baseStart.getTime() >= ne.getTime())
//         return res.status(400).json({ message: "Bad Request" });
//       updates.endTime = ne;
//     }

//     if (capacity !== undefined) {
//       if (originalStarted) {
//         return res
//           .status(400)
//           .json({ message: "Cannot update event after start time." });
//       }
//       if (capacity === null) {
//         updates.capacity = null;
//       } else {
//         const cNum = Number(capacity);
//         if (!Number.isInteger(cNum) || cNum <= 0)
//           return res.status(400).json({ message: "Bad Request" });
//         const confirmed = ev.guests.filter((g) => g.confirmed).length;
//         if (cNum < confirmed)
//           return res.status(400).json({ message: "Bad Request" });
//         updates.capacity = cNum;
//       }
//     }

//     if (provided(points)) {
//       const newTotal = Number(points);
//       if (!Number.isInteger(newTotal) || newTotal <= 0)
//         return res.status(400).json({ message: "Bad Request" });

//       const alreadyAwarded = Number(ev.pointsAwarded ?? 0);
//       const newRemain = newTotal - alreadyAwarded;
//       if (newRemain < 0)
//         return res.status(400).json({ message: "Bad Request" });

//       updates.pointsTotal = newTotal;
//       updates.pointsRemain = newRemain;
//     }

//     if (provided(published)) {
//       if (published !== true)
//         return res.status(400).json({ message: "Bad Request" });
//       const effectiveStart = (updates.startTime ?? ev.startTime).getTime();
//       if (effectiveStart <= nowMs)
//         return res.status(400).json({ message: "Bad Request" });
//       updates.published = true;
//     }

//     try {
//       const updated = await prisma.event.update({
//         where: { id },
//         data: updates,
//       });

//       const resp = {
//         id: updated.id,
//         name: updated.name,
//         location: updated.location,
//       };

//       if ("pointsTotal" in updates) {
//         resp.pointsRemain = updated.pointsRemain;
//         resp.pointsAwarded = updated.pointsAwarded ?? 0;
//       }

//       if ("published" in updates) resp.published = updated.published;
//       if ("capacity" in updates) resp.capacity = updated.capacity;
//       if ("startTime" in updates)
//         resp.startTime = updated.startTime.toISOString();
//       if ("endTime" in updates) resp.endTime = updated.endTime.toISOString();

//       return res.status(200).json(resp);
//     } catch (e) {
//       console.error(e);
//       return res.status(400).json({ message: "Bad Request" });
//     }
//   }
// );

// PATCH /events/:id - update event (manager+ or organizer)
app.patch(
  "/events/:id",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(404).json({ message: "Not Found" });

    const ev = await prisma.event.findUnique({
      where: { id },
      include: { organizers: true, guests: true },
    });
    if (!ev) return res.status(404).json({ message: "Not Found" });

    const isManagerPlus = ["manager", "superuser"].includes(req.auth.role);
    const currentUserId = Number(req.auth?.sub ?? req.auth?.id);
    const isOrganizer =
      Number.isInteger(currentUserId) &&
      ev.organizers.some((o) => o.userId === currentUserId);

    if (!isManagerPlus && !isOrganizer)
      return res.status(403).json({ message: "Permission denied." });

    const {
      name,
      description,
      location,
      startTime,
      endTime,
      capacity,
      points,
      published,
    } = req.body || {};

    if (points !== undefined && points !== null) {
      if (!isManagerPlus)
        return res.status(403).json({ message: "Permission denied." });
    }
    if (published !== undefined && published !== null) {
      if (!isManagerPlus)
        return res.status(403).json({ message: "Permission denied." });
    }

    const provided = (v) => v !== undefined && v !== null;

    const updates = {};
    const nowMs = Date.now();
    const originalStarted = new Date(ev.startTime).getTime() <= nowMs;
    const originalEnded = new Date(ev.endTime).getTime() <= nowMs;

    const cannotEditAfterStart = (fieldProvided) =>
      originalStarted && fieldProvided;

    if (cannotEditAfterStart(provided(name)))
      return res.status(400).json({ message: "Bad Request" });
    if (provided(name)) updates.name = String(name);

    if (cannotEditAfterStart(provided(description)))
      return res.status(400).json({ message: "Bad Request" });
    if (provided(description)) updates.description = String(description);

    if (cannotEditAfterStart(provided(location)))
      return res.status(400).json({ message: "Bad Request" });
    if (provided(location)) updates.location = String(location);

    if (cannotEditAfterStart(provided(startTime)))
      return res.status(400).json({ message: "Bad Request" });
    if (provided(startTime)) {
      if (!isISODate(startTime))
        return res.status(400).json({ message: "Bad Request" });
      const ns = new Date(startTime);
      if (ns.getTime() < nowMs)
        return res.status(400).json({ message: "Bad Request" });
      updates.startTime = ns;
    }

    if (provided(endTime)) {
      if (!isISODate(endTime))
        return res.status(400).json({ message: "Bad Request" });
      if (originalEnded)
        return res.status(400).json({ message: "Bad Request" });
      const ne = new Date(endTime);
      if (ne.getTime() < nowMs)
        return res.status(400).json({ message: "Bad Request" });
      const baseStart = updates.startTime ?? ev.startTime;
      if (
        baseStart.getTime() &&
        ne.getTime() &&
        baseStart.getTime() >= ne.getTime()
      )
        return res.status(400).json({ message: "Bad Request" });
      updates.endTime = ne;
    }

    // 🔧 capacity: treat `null` as "no update"; only update when a positive integer is provided
    if (Object.prototype.hasOwnProperty.call(req.body, "capacity")) {
      if (capacity !== null) {
        if (originalStarted) {
          return res
            .status(400)
            .json({ message: "Cannot update event after start time." });
        }
        const cNum = Number(capacity);
        if (!Number.isInteger(cNum) || cNum <= 0)
          return res.status(400).json({ message: "Bad Request" });
        const confirmed = ev.guests.filter((g) => g.confirmed).length;
        if (cNum < confirmed)
          return res.status(400).json({ message: "Bad Request" });
        updates.capacity = cNum;
      }
      // else capacity === null -> ignore (do not change stored capacity)
    }

    if (provided(points)) {
      const newTotal = Number(points);
      if (!Number.isInteger(newTotal) || newTotal <= 0)
        return res.status(400).json({ message: "Bad Request" });

      const alreadyAwarded = Number(ev.pointsAwarded ?? 0);
      const newRemain = newTotal - alreadyAwarded;
      if (newRemain < 0)
        return res.status(400).json({ message: "Bad Request" });

      updates.pointsTotal = newTotal;
      updates.pointsRemain = newRemain;
    }

    if (provided(published)) {
      if (published !== true)
        return res.status(400).json({ message: "Bad Request" });
      const effectiveStart = (updates.startTime ?? ev.startTime).getTime();
      if (effectiveStart <= nowMs)
        return res.status(400).json({ message: "Bad Request" });
      updates.published = true;
    }

    try {
      const updated = await prisma.event.update({
        where: { id },
        data: updates,
      });

      const resp = {
        id: updated.id,
        name: updated.name,
        location: updated.location,
      };

      if ("pointsTotal" in updates) {
        resp.pointsRemain = updated.pointsRemain;
        resp.pointsAwarded = updated.pointsAwarded ?? 0;
      }
      if ("published" in updates) resp.published = updated.published;
      if ("capacity" in updates) resp.capacity = updated.capacity;
      if ("startTime" in updates)
        resp.startTime = updated.startTime.toISOString();
      if ("endTime" in updates) resp.endTime = updated.endTime.toISOString();

      return res.status(200).json(resp);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: "Bad Request" });
    }
  }
);

//
// DELETE /events/:id - manager+ only
// returns 204 No Content on success, 400 if published
//
app.delete("/events/:id", need("manager", "superuser"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(404).json({ error: "Not Found" });

  try {
    const result = await prisma.event.deleteMany({
      where: { id, published: false },
    });

    if (result.count === 0) {
      const exists = await prisma.event.findUnique({ where: { id } });
      if (!exists) return res.status(404).json({ error: "Not Found" });
      return res.status(400).json({ error: "Bad Request" }); // already published
    }

    return res.status(204).end();
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Bad Request" });
  }
});

//------PROMOTIONS-------//

//
// POST /promotions/:id/usage  (manager+ or internal use) - record one-time promo usage for a user
//
app.post(
  "/promotions/:id/usage",
  need("manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { utorid } = req.body || {};
    if (!Number.isFinite(id) || !utorid)
      return res.status(400).json({ error: "Missing fields" });

    const pr = await prisma.promotion.findUnique({ where: { id } });
    if (!pr) return res.status(404).json({ error: "Not Found" });
    if (pr.type !== "onetime")
      return res.status(400).json({ error: "Bad Request" });

    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user) return res.status(400).json({ error: "Bad Request" });

    try {
      const usage = await prisma.promotionUsage.create({
        data: {
          promotionId: id,
          userId: user.id,
          usedAt: new Date(),
        },
      });
      return res.status(201).json({ ok: true });
    } catch (e) {
      // unique constraint -> already used
      if (
        String(e.message).includes("Unique constraint") ||
        String(e.message).includes("constraint failed")
      )
        return res.status(409).json({ error: "Conflict" });
      console.error(e);
      return res.status(400).json({ error: "Bad Request" });
    }
  }
);

//
// GET /promotions/:id  (regular: only active + not-used for onetime; manager+ any)
//
app.get(
  "/promotions/:id",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id))
      return res.status(404).json({ error: "Not Found" });

    const pr = await prisma.promotion.findUnique({ where: { id } });
    if (!pr) return res.status(404).json({ error: "Not Found" });

    const isManagerPlus =
      req.auth && ["manager", "superuser"].includes(req.auth.role);
    if (!isManagerPlus) {
      const now = new Date();
      if (
        !(
          pr.startTime.getTime() <= now.getTime() &&
          pr.endTime.getTime() > now.getTime()
        )
      )
        return res.status(404).json({ error: "Not Found" });

      if (pr.type === "onetime" && req.me) {
        const used = await prisma.promotionUsage.findUnique({
          where: {
            userId_promotionId: { userId: req.me.id, promotionId: pr.id },
          },
        });
        if (used && used.usedAt)
          return res.status(404).json({ error: "Not Found" });
      }
    }

    return res.json({
      id: pr.id,
      name: pr.name,
      description: pr.description,
      type: pr.type,
      startTime: pr.startTime,
      endTime: pr.endTime,
      minSpending: pr.minSpending,
      rate: pr.rate,
      points: pr.points,
      published: pr.published ?? false,
    });
  }
);

// PATCH /promotions/:id  (manager+)
app.patch("/promotions/:id", need("manager", "superuser"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id))
    return res.status(404).json({ message: "Not Found" });

  const pr = await prisma.promotion.findUnique({ where: { id } });
  if (!pr) return res.status(404).json({ message: "Not Found" });

  const has = (k) => Object.prototype.hasOwnProperty.call(req.body || {}, k);

  const {
    name,
    description,
    type,
    startTime,
    endTime,
    minSpending,
    rate,
    points,
    published,
  } = req.body || {};

  const now = new Date();
  const updates = {};

  if (has("name") && name !== null) updates.name = String(name);
  if (has("description") && description !== null)
    updates.description = String(description);

  if (has("type") && type !== null) {
    let t = String(type).trim().toLowerCase();
    if (t === "one-time") t = "onetime";
    if (!["automatic", "onetime"].includes(t)) {
      return res.status(400).json({ message: "Bad Request" });
    }
    updates.type = t;
  }

  if (has("startTime") && startTime !== null) {
    const ns = new Date(startTime);
    if (Number.isNaN(ns.getTime())) {
      return res.status(400).json({ message: "Bad Request" });
    }
    if (ns.getTime() < now.getTime()) {
      return res.status(400).json({ message: "Bad Request" });
    }
    updates.startTime = ns;
  }

  if (has("endTime") && endTime !== null) {
    const ne = new Date(endTime);
    if (Number.isNaN(ne.getTime())) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const baseStart = updates.startTime ?? pr.startTime;
    if (baseStart.getTime() >= ne.getTime()) {
      return res.status(400).json({ message: "Bad Request" });
    }

    if (ne.getTime() < now.getTime()) {
      return res.status(400).json({ message: "Bad Request" });
    }
    updates.endTime = ne;
  }

  if (has("minSpending") && minSpending !== null) {
    const ms = Number(minSpending);

    if (!Number.isFinite(ms) || ms < 0) {
      return res.status(400).json({ message: "Bad Request" });
    }
    updates.minSpending = ms;
  }

  if (has("rate") && rate !== null) {
    const rt = Number(rate);
    if (!Number.isFinite(rt) || rt < 0) {
      return res.status(400).json({ message: "Bad Request" });
    }
    updates.rate = rt;
  }

  if (has("points") && points !== null) {
    const pts = Number(points);
    if (!Number.isInteger(pts) || pts < 0) {
      return res.status(400).json({ message: "Bad Request" });
    }
    updates.points = pts;
  }

  if (has("published") && published !== null) {
    const want = !!published;
    if (want) {
      const effStart = (updates.startTime ?? pr.startTime).getTime();
      if (effStart <= now.getTime()) {
        return res.status(400).json({ message: "Bad Request" });
      }
    }
    updates.published = want;
  }

  try {
    const updated = Object.keys(updates).length
      ? await prisma.promotion.update({ where: { id }, data: updates })
      : pr;

    const resp = {
      id: updated.id,
      name: updated.name,
      type: updated.type,
    };
    if ("description" in updates) resp.description = updated.description;
    if ("startTime" in updates)
      resp.startTime = updated.startTime.toISOString();
    if ("endTime" in updates) resp.endTime = updated.endTime.toISOString();
    if ("minSpending" in updates) resp.minSpending = updated.minSpending;
    if ("rate" in updates) resp.rate = updated.rate;
    if ("points" in updates) resp.points = updated.points;
    if ("published" in updates) resp.published = !!updated.published;

    return res.status(200).json(resp);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

// DELETE /promotions/:id  (manager+)
app.delete(
  "/promotions/:id",
  need("manager", "superuser"),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(404).json({ message: "Not Found" });
    }

    try {
      const pr = await prisma.promotion.findUnique({ where: { id } });
      if (!pr) {
        return res.status(404).json({ message: "Not Found" });
      }

      const now = new Date();
      if (pr.startTime && pr.startTime <= now) {
        return res
          .status(403)
          .json({ message: "Cannot delete started promotion." });
      }

      await prisma.promotion.delete({ where: { id } });
      return res.status(204).send();
    } catch (e) {
      console.error(e);
      return res.status(404).json({ message: "Not Found" });
    }
  }
);

// POST /promotions  (manager+)
// body: { name, description, type, startTime, endTime, minSpending?, rate?, points?, published? }
//
app.post("/promotions", need("manager", "superuser"), async (req, res) => {
  const {
    name,
    description,
    type,
    startTime,
    endTime,
    minSpending,
    rate,
    points,
  } = req.body || {};

  if (!name || !description || !type || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing fields" });
  }

  let normalizedType = String(type).trim().toLowerCase();
  if (normalizedType === "one-time") normalizedType = "onetime";
  if (!["automatic", "onetime"].includes(normalizedType)) {
    return res.status(400).json({ message: "Bad Request" });
  }

  const s = new Date(startTime);
  const e = new Date(endTime);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return res.status(400).json({ message: "Bad Request" });
  }

  if (s.getTime() < Date.now()) {
    return res.status(400).json({ message: "Bad Request" });
  }

  if (s.getTime() >= e.getTime()) {
    return res.status(400).json({ message: "Bad Request" });
  }

  const ms = minSpending !== undefined ? Number(minSpending) : null;
  const rt = rate !== undefined ? Number(rate) : null;
  const pts = points !== undefined ? Number(points) : null;

  if (ms !== null && (Number.isNaN(ms) || ms < 0)) {
    return res.status(400).json({ message: "Bad Request" });
  }
  if (rt !== null && (Number.isNaN(rt) || rt < 0)) {
    return res.status(400).json({ message: "Bad Request" });
  }
  if (
    pts !== null &&
    (!Number.isFinite(pts) || pts < 0 || !Number.isInteger(pts))
  ) {
    return res.status(400).json({ message: "Bad Request" });
  }

  try {
    const created = await prisma.promotion.create({
      data: {
        name: String(name),
        description: String(description),
        type: normalizedType,
        startTime: s,
        endTime: e,
        minSpending: ms,
        rate: rt,
        points: pts,
      },
    });

    return res.status(201).json({
      id: created.id,
      name: created.name,
      description: created.description,
      type: created.type,
      startTime: created.startTime.toISOString(),
      endTime: created.endTime.toISOString(),
      minSpending: created.minSpending,
      rate: created.rate,
      points: created.points,
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

// GET /promotions  (regular+: active promotions; manager+: admin filters)
// query: name, type, published (manager), page, limit
app.get(
  "/promotions",
  need("regular", "cashier", "manager", "superuser"),
  async (req, res) => {
    const { name, type } = req.query;

    let p = 1;
    if (req.query.page !== undefined) {
      const n = Number(req.query.page);
      if (!Number.isInteger(n) || n < 1) {
        return res
          .status(400)
          .json({ message: "Page must be greater than 0." });
      }
      p = n;
    }

    let l = 10;
    if (req.query.limit !== undefined) {
      const n = Number(req.query.limit);
      if (!Number.isInteger(n) || n < 1) {
        return res
          .status(400)
          .json({ message: "Limit must be greater than 0." });
      }
      l = n;
    }

    const isManagerPlus =
      req.auth && ["manager", "superuser"].includes(req.auth.role);

    const baseWhere = {};
    if (name) baseWhere.name = { contains: String(name) };

    if (type) {
      let t = String(type).trim().toLowerCase();
      if (t === "one-time") t = "onetime";
      baseWhere.type = t;
    }

    const parseBool = (v) =>
      v === "true" ? true : v === "false" ? false : undefined;
    const started = parseBool(req.query.started);
    const ended = parseBool(req.query.ended);

    if (isManagerPlus) {
      if (started !== undefined && ended !== undefined) {
        return res
          .status(400)
          .json({ message: "Cannot filter by both started and ended." });
      }
    }

    // if (isManagerPlus) {
    //   const now = new Date();

    //   if (req.query.published !== undefined) {
    //     const pb = parseBool(req.query.published);
    //     if (pb === undefined) {
    //       return res.status(400).json({ message: "Bad Request" });
    //     }
    //     baseWhere.published = pb;
    //   }

    //   if (started === true) {
    //     baseWhere.startTime = { lt: now };
    //   } else if (started === false) {
    //     baseWhere.startTime = { gte: now };
    //   } else if (ended === true) {
    //     baseWhere.endTime = { lte: now };
    //   } else if (ended === false) {
    //     baseWhere.endTime = { gt: now };
    //   }

    //   const [count, results] = await Promise.all([
    //     prisma.promotion.count({ where: baseWhere }),
    //     prisma.promotion.findMany({
    //       where: baseWhere,
    //       orderBy: { startTime: "desc" },
    //       skip: (p - 1) * l,
    //       take: l,
    //       select: {
    //         id: true,
    //         name: true,
    //         type: true,
    //         startTime: true,
    //         endTime: true,
    //         minSpending: true,
    //         rate: true,
    //         points: true,
    //       },
    //     }),
    //   ]);
    if (isManagerPlus) {
      const now = new Date();

      if (req.query.published !== undefined) {
        const pb = parseBool(req.query.published);
        if (pb === undefined) {
          return res.status(400).json({ message: "Bad Request" });
        }
        baseWhere.published = pb;
      }

      if (started === true) {
        baseWhere.startTime = { lt: now };
      } else if (started === false) {
        baseWhere.startTime = { gte: now };
      } else if (ended === true) {
        baseWhere.endTime = { lte: now };
      } else if (ended === false) {
        baseWhere.endTime = { gt: now };
      }

      const [count, results] = await Promise.all([
        prisma.promotion.count({ where: baseWhere }),
        prisma.promotion.findMany({
          where: baseWhere,
          orderBy: { startTime: "desc" },
          skip: (p - 1) * l,
          take: l,
          select: {
            id: true,
            name: true,
            type: true,
            startTime: true,
            endTime: true,
            minSpending: true,
            rate: true,
            points: true,
          },
        }),
      ]);

      return res.status(200).json({
        count,
        results: results.map((pr) => ({
          id: pr.id,
          name: pr.name,
          type: pr.type,
          startTime: pr.startTime.toISOString(),
          endTime: pr.endTime.toISOString(),
          minSpending: pr.minSpending,
          rate: pr.rate,
          points: pr.points,
        })),
      });
    }

    const now = new Date();
    const whereActive = {
      ...baseWhere,
      startTime: { lte: now },
      endTime: { gt: now },
    };

    const promos = await prisma.promotion.findMany({
      where: whereActive,
      orderBy: { startTime: "desc" },
      skip: (p - 1) * l,
      take: l,
      select: {
        id: true,
        name: true,
        type: true,
        startTime: true,
        endTime: true,
        minSpending: true,
        rate: true,
        points: true,
      },
    });

    const userId = req.me?.id;
    let filtered = promos;
    if (userId) {
      const usageRows = await prisma.promotionUsage.findMany({
        where: { userId, promotionId: { in: promos.map((x) => x.id) } },
        select: { promotionId: true, usedAt: true },
      });
      const usedIds = new Set(
        usageRows.filter((u) => u.usedAt).map((u) => u.promotionId)
      );
      filtered = promos.filter(
        (pr) => !(pr.type === "onetime" && usedIds.has(pr.id))
      );
    }

    return res.status(200).json({
      count: filtered.length,
      results: filtered.map((pr) => ({
        id: pr.id,
        name: pr.name,
        type: pr.type,
        startTime: pr.startTime.toISOString(),
        endTime: pr.endTime.toISOString(),
        minSpending: pr.minSpending,
        rate: pr.rate,
        points: pr.points,
      })),
    });
  }
);

//------------------//

app.use((req, res) => res.status(405).json({ error: "Method Not Allowed" }));

app.use((err, _req, res, _next) => {
  if (err.name === "UnauthorizedError")
    return res.status(401).json({ error: "Unauthorized" });
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
server.on("error", (err) => {
  console.error(`cannot start server: ${err.message}`);
  process.exit(1);
});
