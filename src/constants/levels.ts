
export const LEVEL_DELAYS: Record<number, number> = {
    1: 500,  // 0.50 seconds
    2: 450,  // 0.45 seconds
    3: 400,  // 0.40 seconds
    4: 350,  // 0.35 seconds
    5: 300,  // 0.30 seconds
    6: 250,  // 0.25 seconds
    7: 200,  // 0.20 seconds
    8: 150,  // 0.15 seconds
    9: 100,  // 0.10 seconds
    10: 50   // 0.05 seconds
};

export function getDelay(level: number): number {
    const clampedLevel = Math.max(1, Math.min(10, level));
    return LEVEL_DELAYS[clampedLevel];
}