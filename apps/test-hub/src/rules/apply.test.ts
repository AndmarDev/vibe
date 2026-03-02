// apps/test-hub/src/rules/apply.test.ts

import { describe, expect, it } from 'vitest';
import { RULES_PLACEHOLDER } from '@app/rules';

describe('rules package sanity', () => {
  it('can import @app/rules', () => {
    expect(RULES_PLACEHOLDER).toBe(true);
  });
});
