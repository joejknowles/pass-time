const displayMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
};

export const durationOptions = Array.from({ length: 48 }, (_, i) => {
    const minutes = (i + 1) * 15;
    return { label: displayMinutes(minutes), value: minutes };
});
