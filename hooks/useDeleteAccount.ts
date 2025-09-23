import { useState } from "react";
import { auth } from "@/lib/firebase/client";

export const useDeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete account");
      }
      // Optional: sign out user on success
      await auth.signOut();
      return true;
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

  return { deleteAccount, loading, error };
};
