import { useState, useEffect, useMemo } from "react";
import { isToday } from "./utils";

export const useCurrentTimeAndDay = () => {
    const [currentDay, setCurrentDay] = useState(new Date(new Date().toDateString()));
    const [nowMinuteOfDay, setNowMinuteOfDay] = useState(new Date().getHours() * 60 + new Date().getMinutes());

    const isViewingToday = useMemo(() => isToday(currentDay), [currentDay, nowMinuteOfDay]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        const updateNowMinuteOfDay = () => {
            setNowMinuteOfDay(new Date().getHours() * 60 + new Date().getMinutes());
        };

        const setUpInterval = () => {
            clearInterval(interval);
            updateNowMinuteOfDay();
            interval = setInterval(updateNowMinuteOfDay, 60 * 1000);
        };

        const nextMinuteStartsInMs = (60 - new Date().getSeconds()) * 1000;
        const initialTimeout = setTimeout(setUpInterval, nextMinuteStartsInMs);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (isViewingToday && currentDay.getTime() !== new Date().getTime()) {
                    setCurrentDay(new Date(new Date().toDateString()));
                }
                setUpInterval();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimeout);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isViewingToday]);

    return {
        currentDay,
        setCurrentDay,
        nowMinuteOfDay,
        isViewingToday
    };
};
