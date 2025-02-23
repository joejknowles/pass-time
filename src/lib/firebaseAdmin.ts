import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";

const serviceAccountPath = "/app/src/lib/firebase-service-account.json";

if (!admin.apps.length && existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.error("Firebase service account file is missing or invalid.");
}

export { admin };
