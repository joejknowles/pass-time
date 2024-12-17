import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.PASSTIME_FIREBASE_SERVICE_KEY as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
