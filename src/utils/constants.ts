export const env = process.env.NODE_ENV;
export const port = process.env.PORT;
export const host = process.env.HOST;

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
export const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRED;
export const refreshTokenExpiredIn = process.env.REFRESH_TOKEN_EXPIRED;

export const adminCode = process.env.ADMIN_CODE;

export const emailHost = process.env.EMAIL_HOST;
export const user = process.env.EMAIL_USER;
export const pass = process.env.EMAIL_PASS;
export const service = process.env.SERVICE;

export const feBaseURL = process.env.FE_BASE_URL;
export const adminBaseURL = process.env.ADMIN_BASE_URL;

export const dbNameDevelopment = process.env.DB_NAME_DEVELOPMENT;
export const dbNameTest = process.env.DB_NAME_TEST;
export const dbNameProduction = process.env.DB_NAME_PRODUCTION;

export const dbUser = process.env.DB_USERNAME;
export const dbPassword = process.env.DB_PASSWORD;

export const dbHostDevelopment = process.env.DB_HOST_DEVELOPMENT;
export const dbHostTest = process.env.DB_HOST_TEST;
export const dbHostProduction = process.env.DB_HOST_PRODUCTION;

export const firebaseApiKey = process.env.FIREBASE_API_KEY;
export const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN;
export const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
export const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
export const firebaseMessagingSenderId =
  process.env.FIREBASE_MESSAGING_SENDER_ID;
export const firebaseAppId = process.env.FIREBASE_APP_ID;
export const firebaseMeasurementId = process.env.FIREBASE_MEASUREMENT_ID;
export const firebaseStorageFolderTest =
  process.env.FIREBASE_STORAGE_FOLDER_TEST;
export const firebaseStorageFolderDev = process.env.FIREBASE_STORAGE_FOLDER_DEV;
export const firebaseStorageFolderProd =
  process.env.FIREBASE_STORAGE_FOLDER_PROD;

export const midtransAppURL = process.env.MIDTRANS_APP_URL;
export const midtransApiURL = process.env.MIDTRANS_API_URL;
export const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;

export const PENDING_PAYMENT = 'PENDING_PAYMENT';
export const PAID = 'PAID';
export const CANCELED = 'CANCELED';
export const PROCESSING = 'PROCESSING';
export const SHIPPING = 'SHIPPING';
export const DELIVERED = 'DELIVERED';
export const shippingFlatRate = 15000;
export const cookiesMaxAge = 1000 * 60 * 60 * 24 * 30; // 30 days

export function firebaseStorageFolderEnv(): string | undefined {
  switch (env) {
    case 'development':
      return firebaseStorageFolderDev;
    case 'test':
      return firebaseStorageFolderTest;
    case 'production':
      return firebaseStorageFolderProd;
  }
}
