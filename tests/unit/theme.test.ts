import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTheme, theme, darkTheme, resolveIsDark } from '../../src/config/theme';

describe('Theme resolution', () => {
  test('explicit light mode always resolves to light theme regardless of system', () => {
    assert.equal(getTheme('light', false), theme);
    assert.equal(getTheme('light', true), theme);
    assert.equal(resolveIsDark('light', 'light'), false);
    assert.equal(resolveIsDark('light', 'dark'), false);
  });

  test('explicit dark mode always resolves to dark theme regardless of system', () => {
    assert.equal(getTheme('dark', false), darkTheme);
    assert.equal(getTheme('dark', true), darkTheme);
    assert.equal(resolveIsDark('dark', 'light'), true);
    assert.equal(resolveIsDark('dark', 'dark'), true);
  });

  test('system mode resolves according to the system color scheme', () => {
    assert.equal(getTheme('system', false), theme);
    assert.equal(getTheme('system', true), darkTheme);
    assert.equal(resolveIsDark('system', 'light'), false);
    assert.equal(resolveIsDark('system', 'dark'), true);
  });
});
