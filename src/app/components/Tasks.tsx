import { Box } from "@mui/material";
import { useQuery } from '@apollo/client';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import { GET_TASKS } from "../lib/graphql/mutations";

interface Task {
    id: string;
    title: string;
}

export const Tasks = () => {
    const { data } = useQuery<{ tasks: Task[] }>(GET_TASKS);
    const [taskOrder, setTaskOrder] = useState<Task[]>(data?.tasks || []);

    useEffect(() => {
        if (data) setTaskOrder(data.tasks.map((task) => ({ id: `${task.id}`, title: task.title })));
        console.log(data?.tasks);
    }, [data?.tasks]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const updatedTasks = Array.from(taskOrder);
        const [removed] = updatedTasks.splice(result.source.index, 1);
        updatedTasks.splice(result.destination.index, 0, removed);
        setTaskOrder(updatedTasks);
    };

    return (
        <Box>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks-list">
                    {(provided: any) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps}>
                            {taskOrder.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided: any) => (
                                        <Box
                                            ref={provided.innerRef}
                                            sx={{
                                                ...provided.draggableProps.style,
                                                cursor: 'pointer',
                                            }}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <Card sx={{ mb: 1, backgroundColor: 'white' }}>
                                                <CardContent>
                                                    {task.title}
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        </Box>
    );
};