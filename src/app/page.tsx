"use client";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Typography, Container, Box, CircularProgress } from "@mui/material";
import Dashboard from "./components/Dashboard";
import { BalanceTargetsModal } from "./components/BalanceTargetsModal";
import EverywhereProviders from "./components/EverywhereProviders";
import AppBar from "./components/AppBar";

// stops press to hold right click. TODO: make it only on mobile
// window.addEventListener('contextmenu', function (e) {
//   e.preventDefault();
// }, true);

export default function Home() {
  const [hasLoadedUser, setHasLoadedUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [balanceTargetsOpen, setBalanceTargetsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setHasLoadedUser(true);
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleBalanceTargetsOpen = () => {
    setBalanceTargetsOpen(true);
  };

  const handleBalanceTargetsClose = () => {
    setBalanceTargetsOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <AppBar
        hasLoadedUser={hasLoadedUser}
        user={user}
        onBalanceTargetsOpen={handleBalanceTargetsOpen}
      />

      {!hasLoadedUser && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <CircularProgress sx={{ mb: "20dvh" }} />
        </Box>
      )}

      {hasLoadedUser && user && (
        <>
          <EverywhereProviders>
            <BalanceTargetsModal
              open={balanceTargetsOpen}
              onClose={handleBalanceTargetsClose}
            />
          </EverywhereProviders>
          <Dashboard />
        </>
      )}
      {hasLoadedUser && !user && (
        <Container sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Please log in or sign up.
          </Typography>
        </Container>
      )}
    </Box>
  );
}
