"use client";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Box,
} from "@mui/material";
import Dashboard from "./components/Dashboard";
import { BalanceTargetsModal } from "./components/BalanceTargetsModal";
import EverywhereProviders from "./components/EverywhereProviders";
import AppBar from "./components/AppBar";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [balanceTargetsOpen, setBalanceTargetsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        overflow: "hidden"
      }}
    >
      <AppBar
        user={user}
        onBalanceTargetsOpen={handleBalanceTargetsOpen}
      />
      {
        user && (
          <EverywhereProviders>
            <BalanceTargetsModal open={balanceTargetsOpen} onClose={handleBalanceTargetsClose} />
          </EverywhereProviders>
        )
      }
      {
        user ? (
          <Dashboard />
        ) : (
          <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Please log in or sign up.
            </Typography>
          </Container>
        )
      }
    </Box >
  );
}
