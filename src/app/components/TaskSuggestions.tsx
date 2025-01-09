import { Box, Card, CardContent, Typography } from "@mui/material";
import { useQuery } from '@apollo/client';
import { GET_TASK_SUGGESTIONS } from "../lib/graphql/queries";
import { OpenDetailsPanelEntity } from "./dayGrid/types";

interface Task {
    id: string;
    title: string;
}

interface BalanceTarget {
    id: string;
    timeWindow: string;
    targetAmount: number;
    progress: number;
    task: Task;
}

interface TaskGroup {
    name: string;
    tasks: Task[];
    type: string;
    data: BalanceTarget;
}

interface TaskSuggestionsProps {
    setOpenDetailsPanelEntity: (newOpenEntity: OpenDetailsPanelEntity | null) => void;
}

export const TaskSuggestions = ({
    setOpenDetailsPanelEntity,
}: TaskSuggestionsProps) => {
    const { data } = useQuery<{ taskSuggestions: TaskGroup[] }>(GET_TASK_SUGGESTIONS);
    const taskSuggestions = data?.taskSuggestions;

    if (!taskSuggestions) {
        return null;
    }

    return (
        <Box sx={{ height: '100%', padding: 1, overflowY: 'auto', scrollbarGutter: 'none' }}>
            {taskSuggestions.map((group, index) => (
                <Box
                    key={index}
                    sx={{
                        mb: 2,
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                    }}
                >
                    <Typography variant="h6">
                        Target: {group.name} ({group.data.progress}/{group.data.targetAmount})
                    </Typography>
                    {group.tasks.map((task) => (
                        <Card
                            key={task.id}
                            onClick={() => {
                                setOpenDetailsPanelEntity({ id: task.id, type: "Task" });
                            }}
                            sx={{
                                backgroundColor: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <CardContent>
                                {task.title}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ))}
        </Box>
    );
};