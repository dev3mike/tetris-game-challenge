import { rgb } from "../colors";

interface Piece {
    shape: number[][];
    color: string;
    orientations: number;
    maxLines: number;
}

// Tetris piece definitions
export const PIECES: Record<string, Piece> = {
    O: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: rgb(255, 255, 0),
        orientations: 1,
        maxLines: 2
    },
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: rgb(0, 255, 255), // Cyan
        orientations: 2,
        maxLines: 4
    },
    S: {
        shape: [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        color: rgb(0, 255, 0),
        orientations: 2,
        maxLines: 2
    },
    Z: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 0]
        ],
        color: rgb(255, 0, 0),
        orientations: 2,
        maxLines: 2
    },
    L: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        color: rgb(255, 165, 0),
        orientations: 4,
        maxLines: 3
    },
    J: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0]
        ],
        color: rgb(81, 81, 255),
        orientations: 4,
        maxLines: 3
    },
    T: {
        shape: [
            [0, 0, 0, 0],
            [0, 1, 1, 1],
            [0, 0, 1, 0],
            [0, 0, 0, 0]
        ],
        color: rgb(208, 28, 208),
        orientations: 4,
        maxLines: 2
    }
};
