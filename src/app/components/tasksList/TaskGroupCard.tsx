import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";
import TargetIcon from "@mui/icons-material/TrackChanges";
import RecurringIcon from "@mui/icons-material/EventRepeat";
import TodayEvent from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";
import SoonIcon from "@mui/icons-material/HelpOutline";
import RecentsIcon from "@mui/icons-material/WorkHistory";
import UnknownIcon from "@mui/icons-material/Help";

const takGroupIcons = {
    BALANCE_TARGET: TargetIcon,
    RECURRING: RecurringIcon,
    DATE_SOON: EventIcon,
    DATE_TODAY: TodayEvent,
    RECENTS: RecentsIcon,
    SOON: SoonIcon,
    UNKNOWN: UnknownIcon,
};

export type TaskGroupType = keyof typeof takGroupIcons;

interface TaskGroupCardProps {
    title: string;
    type: TaskGroupType;
    children: ReactNode;
    headerExtraSlot?: ReactNode;
}

export const TaskGroupCard = ({ title, type, children, headerExtraSlot }: TaskGroupCardProps) => {
    const Icon = takGroupIcons[type] || takGroupIcons.UNKNOWN;

    return (
        <Box
            sx={{
                backgroundColor: 'grey.100',
                p: 1,
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Icon sx={{ fontSize: 20, marginLeft: '2px' }} />
                <Typography variant="subtitle2" color="textSecondary">
                    {title}
                </Typography>
                {headerExtraSlot}
            </Box>
            {children}
        </Box>
    );
};
