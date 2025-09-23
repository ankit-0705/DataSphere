import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase/client";
import { useUser } from "@/context/UserContext";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  contributions: number;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type FetchUsersResponse = {
  data: User[];
  pagination: Pagination;
};

export const useFetchUsers = (page: number = 1, limit: number = 10) => {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const fetchUsers = useCallback(async () => {
    // Only fetch if user is logged in and has proper role
    if (!user) {
      setUsers([]);
      setPagination(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      setUsers([]);
      setPagination(null);
      setLoading(false);
      setError("User does not have permission");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setError("Firebase user not authenticated");
        setUsers([]);
        setPagination(null);
        setLoading(false);
        return;
      }
      const token = await firebaseUser.getIdToken();

      const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch users");
      }

      const json: FetchUsersResponse = await res.json();
      setUsers(json.data);
      setPagination(json.pagination);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred");
      }
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, reloadFlag]);

  const refreshUsers = () => setReloadFlag((prev) => prev + 1);

  return { users, pagination, loading, error, refreshUsers };
};
