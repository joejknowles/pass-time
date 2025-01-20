import { AppBar as MuiAppBar, Toolbar, Typography, Button, Menu, MenuItem } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AppBarProps {
  user: User | null;
  onBalanceTargetsOpen: () => void;
}

export default function AppBar({ user, onBalanceTargetsOpen }: AppBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOutAndClose = () => {
    signOut(auth);
    handleMenuClose();
  };

  const handleBalanceTargetsOpenAndClose = () => {
    onBalanceTargetsOpen();
    handleMenuClose();
  };

  return (
    <MuiAppBar position="static" sx={{ bgcolor: "white", color: "black" }}>
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
              <MenuItem onClick={handleBalanceTargetsOpenAndClose}>Targets</MenuItem>
              <MenuItem onClick={handleSignOutAndClose}>Sign out</MenuItem>
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
    </MuiAppBar>
  );
}
