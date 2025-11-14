/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example:
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
"use strict";
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error(
      "Usage: node prisma/createsu.js <username> <email> <password>"
    );
    process.exit(1);
  }

  const [utorid, email, password] = args;

  if (!/^[a-zA-Z0-9]{7,8}$/.test(utorid)) {
    console.error("Error: utorid must be 7–8 alphanumeric characters.");
    process.exit(1);
  }

  if (!email.endsWith("@mail.utoronto.ca")) {
    console.error(
      "Error: email must be a valid UofT email (@mail.utoronto.ca)."
    );
    process.exit(1);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { utorid: utorid },
    });
    if (existingUser) {
      console.error(`Error: User with utorid '${utorid}' already exists.`);
      process.exit(1);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        utorid,
        email,
        password: hashedPassword,
        name: utorid,
        role: "superuser",
        verified: true,
        suspicious: false,
        points: 0,
        createdAt: new Date(),
      },
    });

    console.log("Super user created successfully");
    console.log({
      id: user.id,
      utorid: user.utorid,
      email: user.email,
      role: user.role,
      verified: user.verified,
    });
  } catch (err) {
    console.error("Error creating super user:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
