export const displayMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursDisplay = hours > 0 ? `${hours}h` : "";
    const minutesDisplay = remainingMinutes > 0 ? `${remainingMinutes}m` : "";
    return `${hoursDisplay} ${minutesDisplay}`.trim();
}