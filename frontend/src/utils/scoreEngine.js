export const calculateScore = (balls) => {
    let runs = 0;
    let wickets = 0;
    let legalBalls = 0;

    balls.forEach(b => {
        // Run Logic
        let ballRuns = b.val;
        if (['WD', 'NB'].includes(b.type)) {
            runs += (b.val + 1); // Extra + Run
        } else {
            runs += b.val;
            if (b.type === 'LEGAL' || b.type === 'W') legalBalls++;
        }

        // Wicket Logic
        if (b.isWicket) wickets++;
    });

    return {
        runs,
        wickets,
        overs: `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`,
        legalBalls,
        crr: legalBalls > 0 ? (runs / (legalBalls / 6)).toFixed(2) : "0.00"
    };
};

export const createMatch = (t1, t2, overs) => ({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    t1, t2, totalOvers: overs,
    history: []
});