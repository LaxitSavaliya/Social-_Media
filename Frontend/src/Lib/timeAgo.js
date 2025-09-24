const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (const [unit, sec] of Object.entries(intervals)) {
        const value = Math.floor(seconds / sec);
        if (value >= 1) return `${value}${unit[0]}`;
    }
    return "Just now";
};

export default timeAgo;