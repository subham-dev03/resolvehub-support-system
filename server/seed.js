import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Category from "./models/Category.js";

export async function seedAdmin() {
  const email = "admin@ResolveHub.com";
  const password = "Admin_ResolveHub@26";

  let admin = await User.findOne({ role: "admin" });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "System Admin",
      email,
      password: hashedPassword,
      role: "admin",
      active: true
    });

    console.log(`Seeded admin: ${email} / ${password}`);
  } else {
    admin.email = email;
    admin.password = await bcrypt.hash(password, 10);
    admin.role = "admin";
    admin.active = true;

    await admin.save();

    console.log(`Updated admin: ${email} / ${password}`);
  }

  const count = await Category.countDocuments();

  if (!count) {
    await Category.insertMany([
      {
        name: "Hardware",
        description: "Laptop, desktop, printer and device issues"
      },
      {
        name: "Software",
        description: "Application and operating system issues"
      },
      {
        name: "Account",
        description: "Login, password and account access"
      },
      {
        name: "Billing",
        description: "Payments, invoices and subscriptions"
      },
      {
        name: "Network",
        description: "Internet, Wi-Fi and connectivity"
      }
    ]);
  }
}