import { Card, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";

interface TaskCardProps {
    id?: string;
    onClick?: () => void;
    onMouseDown?: (event: React.MouseEvent) => void;
    children: ReactNode;
}

export const TaskCard = ({ id, onClick, onMouseDown, children }: TaskCardProps) => (
    <Card
        id={id}
        onMouseDown={onMouseDown}
        onClick={onClick}
        sx={{
            backgroundColor: 'white',
            cursor: onClick ? 'pointer' : 'default',
        }}
    >
        <CardContent
            sx={{
                '&:last-child': {
                    pb: 2,
                },
            }}
        >
            {
                typeof children === 'string' ? (
                    <Typography variant="body1" color="text.primary">
                        {children}
                    </Typography>
                ) : children
            }
        </CardContent>
    </Card>
);
