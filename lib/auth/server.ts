// lib/auth.ts
import { adminAuth } from '../firebase/server';
import { NextRequest } from 'next/server';

export async function verifyFirebaseToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Unauthorized: Invalid token');
  }
}
