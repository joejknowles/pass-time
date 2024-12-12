"use client";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import { Dashboard } from "./components/Dashboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut(auth);
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "white", color: "black" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            PassTime
          </Typography>
          {user ? (
            <>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                aria-controls="user-menu"
                aria-haspopup="true"
                sx={{
                  display: "inline-block",
                  maxWidth: "200px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </Button>
              <Menu
                id="user-menu"
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/login">
                Log in
              </Button>
              <Button color="inherit" component={Link} href="/signup">
                Sign up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {user ? (
        <Dashboard />
      ) : (
        <Container>
          <Typography variant="h5" gutterBottom>
            Please log in or sign up.
          </Typography>
        </Container>
      )}
    </>
  );
}
