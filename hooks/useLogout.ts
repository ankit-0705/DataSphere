import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Logout failed");
      
      // Clear user context here if applicable, e.g., via a refresh or context method
      // Assuming you have a refreshUser or similar from your UserContext:
      // await refreshUser();

      // Redirect after logout (to login or home)
      router.push("/landing");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
}
