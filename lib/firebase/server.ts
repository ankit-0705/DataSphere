import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!admin.apps.length) {
  if (!serviceAccountPath) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not defined");
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), serviceAccountPath), "utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();