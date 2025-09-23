'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

type Dataset = {
  id: string;
  title: string;
  createdAt: string;
};

type Comment = {
  id: string;
  userId: string;
  datasetId: string;
  text: string;
  createdAt: string;
};

type Like = {
  id: string;
  userId: string;
  datasetId: string;
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  contributions: number;
  datasets: Dataset[];
  comments: Comment[];
  likes: Like[];
};

type Leaderboard = {
  rank: number;
  tier: string;
};

type UserContextType = {
  user: User | null;
  leaderboard: Leaderboard | null;
  loading: boolean;
  refreshUser: () => Promise<void>; // Added refreshUser method here
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user data
  const fetchUserData = async (firebaseUser: any) => {
    try {
      const token = await firebaseUser.getIdToken();

      const res = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error fetching user:', data.error);
        return null;
      }

      const mappedUser: User = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        avatar: data.data.avatar,
        role: data.data.role,
        createdAt: data.data.createdAt,
        contributions: data.data.contributions,
        datasets: data.data.datasets.map((d: any) => ({
          id: d.id,
          title: d.title,
          createdAt: d.createdAt,
        })),
        comments: data.data.comments || [],
        likes: data.data.likes || [],
      };

      return { user: mappedUser, leaderboard: data.leaderboard || null };
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  };

  // refreshUser function to re-fetch user and leaderboard data
  const refreshUser = async () => {
    setLoading(true);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      setLeaderboard(null);
      setLoading(false);
      return;
    }
    const data = await fetchUserData(firebaseUser);
    if (data) {
      setUser(data.user);
      setLeaderboard(data.leaderboard);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        console.warn('No authenticated user');
        setUser(null);
        setLeaderboard(null);
        setLoading(false);
        return;
      }
      const data = await fetchUserData(firebaseUser);
      if (data) {
        setUser(data.user);
        setLeaderboard(data.leaderboard);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, leaderboard, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserProvider;
