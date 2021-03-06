import { AttackState } from "../enums";
import { FleetPosition, Player } from "../models";

import { environment } from "src/environments/environment";

export function findSurroundingPoints([a, b]: number[]) {
    return [
        // [x + 1, y], [ x - 1, y] point side
        [a + 1, b], [a - 1, b],
        // [x , y + 1], [x, y - 1] point up & down
        [a, b + 1], [a, b - 1],
        // [x + 1, y + 1], [x - 1, y - 1] right diagonal
        [a + 1, b + 1], [a - 1, b - 1],
        // [x + 1, y - 1], [x - 1, y + 1] left diagonal
        [a, b + 1], [a - 1, b + 1]
    ];
}

// TODO: cleanup existing points 
// This can be used for enhancements
function isSurroundingWater(pos: number[][], searchPoint: number[]): boolean {
    const allSurroundingPositions = pos.reduce((acc, [a, b]: number[]) => [
        ...acc,
        ...findSurroundingPoints([a, b]),
    ], <number[][]>[])
    return allSurroundingPositions.some(pos => pos.toString() === searchPoint.toString());
}

function isShot(pos: number[][], searchPoint: number[]) {
    return pos.some(pos => pos.toString() === searchPoint.toString());
}

// TODO: find other attacks
function findAttackState(pos: number[][], attackPoint: number[]) {
    if (isShot(pos, attackPoint)) {
        return AttackState.Wounded;
    } else if (true) {
        return AttackState.Missed;
    }
}

function collatePositions(positions: FleetPosition) {
    return [
        ...positions.horizontal,
        ...positions.vertical,
    ];
}

export function isPlayerCompletelySetup(positions: FleetPosition) {
    return collatePositions(positions).length === 8;
}

function findMatchedShipFleet(positions: FleetPosition, attackPoint: number[], attack: { [key: string]: AttackState }) {
    const pos = collatePositions(positions);
    return pos.find(p => p.some(i => i.toString() === attackPoint.toString()))
}

function isKilled(matchedFleet: number[][], attackPoint: number[], attack: { [key: string]: AttackState }) {
    return matchedFleet
        .filter(s => s.toString() !== attackPoint.toString())
        .every(s => attack[s.toString()] === AttackState.Wounded)
}

function flattenAllPositions(positions: FleetPosition) {
    return [
        ...(positions.horizontal).flat(1),
        ...(positions.vertical).flat(1),
    ];
}

// TODO: make things more functional in attack
export function attack(positions: FleetPosition, attackPoint: number[], attack: { [key: string]: AttackState }) {
    const matchedFleet = findMatchedShipFleet(positions, attackPoint, attack);
    if (matchedFleet && isKilled(matchedFleet ?? [], attackPoint, attack)) {
        return AttackState.Killed;
    }
    const pos = flattenAllPositions(positions);
    return findAttackState(pos, attackPoint);
}

export function generatePosition([x, y]: number[], selected: number[][]) {
    const newPosition = selected.map(([a, b]) => [x + a, y + b]);
    return newPosition;
}

export function findWinner(players: Player[]): boolean {
    const winnerPlayer = players.some(player => {
        const filteredAttack = Object.values(player.attack)
            .filter((v: AttackState) => AttackState.Wounded === v);
        return filteredAttack.length === environment.winner;
    });
    return winnerPlayer;
}

export function canDragAtPosition(positions: FleetPosition, newPosition: number[][]): boolean {
    const existingPositions = flattenAllPositions(positions);
    if (existingPositions.length < 1 || newPosition.length < 1) {
        return true;
    }
    const allOccupiedPositions = existingPositions.reduce((acc, number: number[]) => [
        ...acc,
        number,
        ...findSurroundingPoints(number),
    ], <number[][]>[])
    return !newPosition.some(pos =>
        allOccupiedPositions.some(p => p.toString() === pos.toString())
    );
}
