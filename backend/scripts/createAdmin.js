const path = require("path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/mongodb");
const Admin = require("../models/Admin");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const main = async () => {
  const args = process.argv.slice(2);
  const emailArg = args.find((arg) => arg.startsWith("--email="));
  const passwordArg = args.find((arg) => arg.startsWith("--password="));

  const email = emailArg ? emailArg.slice("--email=".length).trim().toLowerCase() : "";
  const password = passwordArg ? passwordArg.slice("--password=".length) : "";

  if (!email || !password) {
    throw new Error("Usage: node scripts/createAdmin.js --email=you@example.com --password=yourpassword");
  }

  if (password.length < 8) {
    throw new Error("Admin password must be at least 8 characters");
  }

  await connectDB();

  const existingCount = await Admin.countDocuments();
  if (existingCount > 0) {
    throw new Error("An admin already exists. Only one admin can be created.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email,
    password: hashedPassword,
  });

  console.log(`Admin created for ${email}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
