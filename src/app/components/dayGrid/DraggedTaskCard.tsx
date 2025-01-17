import { Card, CardContent, Typography } from "@mui/material";
import type { DraggedTask } from "../tasksList/types";

interface DraggedTaskCardProps {
    draggedTask: DraggedTask;
}

export const DraggedTaskCard = ({ draggedTask }: DraggedTaskCardProps) => {
    return (
        <Card
            raised
            sx={{
                backgroundColor: 'white',
                cursor: 'grabbing',
                position: 'fixed',
                top: draggedTask.position.y,
                left: draggedTask.position.x,
                transform: 'translate(-50%, -50%) rotate(-1deg)',
                width: draggedTask.width,
            }}
        >
            <CardContent
                sx={{
                    '&:last-child': {
                        pb: 2,
                    },
                }}
            >
                <Typography variant="body1" color="text.primary">
                    {draggedTask.task.title}
                </Typography>
            </CardContent>
        </Card>
    );
};
