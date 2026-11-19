import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createRateLimiter, isUuid } from './guards.ts'

describe('isUuid', () => {
  it('accepts a random UUID', () => {
    assert.equal(isUuid('0b9f6a2e-3c4d-4e5f-8a6b-7c8d9e0f1a2b'), true)
    assert.equal(isUuid(crypto.randomUUID()), true)
  })

  it('rejects anything that is not a UUID', () => {
    for (const value of ['', 'abc', '1234', '0b9f6a2e3c4d4e5f8a6b7c8d9e0f1a2b', "1' OR '1'='1"]) {
      assert.equal(isUuid(value), false, value)
    }
  })
})

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks the next request', () => {
    const limiter = createRateLimiter(10, 60_000)
    for (let i = 0; i < 10; i += 1) {
      assert.equal(limiter.isLimited('1.2.3.4', 1_000 + i), false, `request ${i + 1}`)
    }
    assert.equal(limiter.isLimited('1.2.3.4', 1_100), true)
  })

  it('counts each client separately', () => {
    const limiter = createRateLimiter(1, 60_000)
    assert.equal(limiter.isLimited('visitor-a', 0), false)
    assert.equal(limiter.isLimited('visitor-a', 1), true)
    assert.equal(limiter.isLimited('visitor-b', 2), false)
  })

  it('lets a client in again once the window has passed', () => {
    const limiter = createRateLimiter(1, 60_000)
    assert.equal(limiter.isLimited('visitor', 0), false)
    assert.equal(limiter.isLimited('visitor', 59_999), true)
    assert.equal(limiter.isLimited('visitor', 60_001), false)
  })
})
