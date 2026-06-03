const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/users");
dotenv.config();
//admin 
dotenv.config({ path: ".env.local" }); // 👈 FIX

const seedAdmin = async () => {
  try {
    console.log("URI:", process.env.MONGODB_URI); // debug

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ DB Connected");

    const existingAdmin = await User.findOne({
      email: "admin@example.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    console.log("🎉 Admin Created");

    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedAdmin();