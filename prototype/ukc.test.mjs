import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ukc, squat, riskLevel, maxSafeSpeed } from './ukc.js';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('static case matches the brief formula: 10 m draft in 12 m water is 20%', () => {
  const r = ukc(12, 0, 10, 0, 0.8, true);
  close(r.metres, 2);
  close(r.pct, 20);
  assert.equal(r.level, 'amber');
});

test('demo numbers: 10 kn, Cb 0.8, confined gives 1.6 m squat and 0.4 m (4%) clearance', () => {
  const r = ukc(12, 0, 10, 10, 0.8, true);
  close(r.squat, 1.6);
  close(r.metres, 0.4);
  close(r.pct, 4);
  assert.equal(r.level, 'red');
});

test('6 kn confined squat is about 0.6 m', () => {
  close(squat(6, 0.8, true), 0.576);
});

test('open water squat is half of confined', () => {
  close(squat(8, 0.7, false) * 2, squat(8, 0.7, true));
});

test('tide adds to depth and astern speed squats like ahead', () => {
  close(ukc(12, 1.5, 10, -6, 0.8, true).metres, ukc(12, 1.5, 10, 6, 0.8, true).metres);
  close(ukc(12, 1.5, 10, 0, 0.8, true).metres, 3.5);
});

test('risk levels at the thresholds', () => {
  assert.equal(riskLevel(-0.1), 'aground');
  assert.equal(riskLevel(9.99), 'red');
  assert.equal(riskLevel(10), 'amber');
  assert.equal(riskLevel(50), 'green');
});

test('max safe speed lands exactly on the red threshold', () => {
  const v = maxSafeSpeed(12, 0, 10, 0.8, true);
  close(ukc(12, 0, 10, v, 0.8, true).pct, 10, 1e-6);
  assert.equal(maxSafeSpeed(10.5, 0, 10, 0.8, true), 0);
});
