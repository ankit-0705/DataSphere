import admin from "firebase-admin";

if (!admin.apps.length) {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_CLIENT_ID,
    FIREBASE_AUTH_URI,
    FIREBASE_TOKEN_URI,
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    FIREBASE_CLIENT_X509_CERT_URL,
    FIREBASE_UNIVERSE_DOMAIN,
  } = process.env;

  if (
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_PRIVATE_KEY_ID ||
    !FIREBASE_PRIVATE_KEY ||
    !FIREBASE_CLIENT_EMAIL ||
    !FIREBASE_CLIENT_ID ||
    !FIREBASE_AUTH_URI ||
    !FIREBASE_TOKEN_URI ||
    !FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
    !FIREBASE_CLIENT_X509_CERT_URL ||
    !FIREBASE_UNIVERSE_DOMAIN
  ) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      privateKeyId: FIREBASE_PRIVATE_KEY_ID,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: FIREBASE_CLIENT_EMAIL,
      clientId: FIREBASE_CLIENT_ID,
      authUri: FIREBASE_AUTH_URI,
      tokenUri: FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientC509CertUrl: FIREBASE_CLIENT_X509_CERT_URL,
    } as admin.ServiceAccount), // ✅ Type cast for TS safety
  });
}

export const adminAuth = admin.auth();
