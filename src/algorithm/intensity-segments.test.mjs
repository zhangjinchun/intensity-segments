import { describe, it, expect, beforeEach } from 'vitest';
import { IntensitySegments } from './intensity-segments.mjs';

describe('IntensitySegments', () => {
    let segments;

    beforeEach(() => {
        // Initialize a new instance before each test
        segments = new IntensitySegments();
    });

    describe('toString method', () => {
        it('should return an empty array when no segments are added', () => {
            expect(segments.toString()).toBe('[]');
        });
    });

    describe('add method', () => {
        it('should add intensity to a single range', () => {
            segments.add(10, 30, 1);
            expect(segments.toString()).toBe('[[10,1],[30,0]]');
        });

        it('should handle overlapping ranges', () => {
            segments.add(10, 30, 1);
            segments.add(20, 40, 1);
            expect(segments.toString()).toBe('[[10,1],[20,2],[30,1],[40,0]]');
        });

        it('should handle negative intensity values', () => {
            segments.add(10, 30, 1);
            segments.add(20, 40, 1);
            segments.add(10, 40, -2);
            expect(segments.toString()).toBe('[[10,-1],[20,0],[30,-1],[40,0]]');
        });

        it('should remove segments with zero intensity', () => {
            segments.add(10, 30, 1);
            segments.add(20, 40, 1);
            segments.add(10, 40, -1);
            expect(segments.toString()).toBe('[[20,1],[30,0]]');
        });

        it('should handle multiple updates correctly', () => {
            segments.add(10, 30, 1);
            segments.add(20, 40, 1);
            segments.add(10, 40, -1);
            segments.add(10, 40, -1);
            expect(segments.toString()).toBe('[[10,-1],[20,0],[30,-1],[40,0]]');
        });
    });

    describe('set method', () => {
        it('should set intensity for a single range', () => {
            segments.set(10, 30, 5);
            expect(segments.toString()).toBe('[[10,5],[30,0]]');
        });

        it('should remove segments outside the set range', () => {
            segments.add(10, 50, 1);
            segments.set(20, 40, 0);
            expect(segments.toString()).toBe('[[10,1],[20,0],[40,1],[50,0]]');
        });
    });
});