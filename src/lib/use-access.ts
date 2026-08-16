import { useEffect, useState } from "react";
import { getAccessState } from "./billing";
import { useCurrentUserState } from "./auth/use-current-user";

export function useAccess() {
  const { user, isPending } = useCurrentUserState();
  const [paid, setPaid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (isPending) return;
    if (!user) {
      setPaid(false);
      setChecking(false);
      return;
    }
    if (user.isDevFallback) {
      setPaid(true);
      setChecking(false);
      return;
    }
    setChecking(true);
    void getAccessState()
      .then((state) => {
        if (!cancelled) setPaid(Boolean(state.paid));
      })
      .catch(() => {
        if (!cancelled) setPaid(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isPending]);

  return {
    user,
    signedIn: Boolean(user),
    paid,
    isPending: isPending || checking,
  };
}
