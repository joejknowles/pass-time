import {
  Card,
  CardContent,
  SvgIconTypeMap,
  Typography,
  useTheme,
} from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import React from "react";

interface IconCardProps {
  icon: OverridableComponent<SvgIconTypeMap>;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export const IconCard = ({
  icon: Icon,
  name,
  isSelected,
  onClick,
}: IconCardProps) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        width: 100,
        height: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: isSelected
          ? `1px solid ${theme.palette.custom.cardBorderSelected}`
          : `1px solid ${theme.palette.grey[300]}`,
        boxShadow: 3,
        backgroundColor: isSelected
          ? theme.palette.custom.cardBackgroundSelected
          : theme.palette.custom.white,
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          padding: "8px !important",
        }}
      >
        <Icon
          fontSize="large"
          sx={{
            color: isSelected
              ? theme.palette.custom.cardIconSelected
              : theme.palette.grey[600],
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: isSelected
              ? theme.palette.custom.cardTextSelected
              : theme.palette.grey[600],
          }}
        >
          {name}
        </Typography>
      </CardContent>
    </Card>
  );
};
