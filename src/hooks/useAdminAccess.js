import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAdminAccess() {
  const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const syncFromClerk = useMutation(api.auth.syncUserFromClerk);
  const syncStarted = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const convexUser = useQuery(
    api.users.getCurrentUser,
    clerkLoaded && isSignedIn ? {} : "skip",
  );

  const clerkAdmin = clerkUser?.publicMetadata?.role === "admin";
  const convexAdmin = convexUser?.role === "admin";
  const isAdmin = isSignedIn && (clerkAdmin || convexAdmin);

  useEffect(() => {
    if (!isSignedIn) {
      syncStarted.current = false;
      return;
    }

    if (
      !clerkLoaded ||
      !clerkUser ||
      convexUser !== null ||
      syncStarted.current
    ) {
      return;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) return;

    syncStarted.current = true;

    void (async () => {
      setIsSyncing(true);
      try {
        await syncFromClerk({
          clerkUserId: clerkUser.id,
          email,
          name:
            [clerkUser.firstName, clerkUser.lastName]
              .filter(Boolean)
              .join(" ") ||
            clerkUser.fullName ||
            email,
        });
      } catch (err) {
        console.error("syncUserFromClerk failed:", err);
        syncStarted.current = false;
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [isSignedIn, clerkLoaded, clerkUser, convexUser, syncFromClerk]);

  const isLoading =
    !clerkLoaded ||
    (isSignedIn && (convexUser === undefined || isSyncing));

  return { isLoading, isSignedIn, isAdmin, clerkUser, convexUser };
}
