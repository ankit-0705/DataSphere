import { useState } from "react";
import { auth } from "@/lib/firebase/client";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export const useUpdateUserRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserRole = async (userId: string, role: UserRole) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken();

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update user role");
      }

      const updatedUser = await res.json();
      return updatedUser;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
        throw e;
      } else {
        setError("An unknown error occurred");
        throw new Error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return { updateUserRole, loading, error };
};
