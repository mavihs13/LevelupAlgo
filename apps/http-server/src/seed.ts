import mongoose from "mongoose";
import dotenv from "dotenv";
import Connect from "@repo/database/connect";
import { Users } from "@repo/database/db";
import { seedDefaultDsaSheet } from "./utils/sheet/seedDefaultDsaSheet.js";

dotenv.config();

async function seedExistingUsers() {
  const connection = await Connect();
  if (!connection.success) {
    throw new Error(connection.error);
  }

  const users = await Users.find({}, { _id: 1 });
  for (const user of users) {
    await seedDefaultDsaSheet(user._id);
  }

  console.log(
    `Seeded the starter DSA sheet for ${users.length} existing user(s).`
  );
}

seedExistingUsers()
  .catch((error: unknown) => {
    console.error("Failed to seed starter DSA sheets:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
