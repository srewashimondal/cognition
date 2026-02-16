export function formatTimestamp(timestamp: string) {
    if (!timestamp) return 'Unknown';
    
    const secondsMatch = timestamp.match(/seconds=(\d+)/);  
    if (!secondsMatch) return 'Invalid date';
    
    const seconds = parseInt(secondsMatch[1]);
    const date = new Date(seconds * 1000);
    
    return date.toLocaleString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).replace(' at ', ' ').replace(/\s(?=[AP]M$)/, '');
}

export function formatTimestampString(timestamp: string) {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}
