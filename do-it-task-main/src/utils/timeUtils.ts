
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDateForDisplay = (date: Date): string => {
  // Format date like "Today", "Tomorrow", or "Mon, Apr 15"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  if (dateToCheck.getTime() === today.getTime()) {
    return "Today";
  } else if (dateToCheck.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
};

export const calculateTotalTimeSpent = (timeEntries: { startTime: Date; endTime: Date | null }[]): number => {
  return timeEntries.reduce((total, entry) => {
    if (!entry.endTime) return total;
    
    const durationMs = entry.endTime.getTime() - entry.startTime.getTime();
    return total + (durationMs / 1000);
  }, 0);
};
