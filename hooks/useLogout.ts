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

      // Redirect after logout (to login or home)
      router.push("/landing");
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

  return { logout, loading, error };
}
