import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildPortfolioContext, portfolioData } from './portfolioData.ts'

describe('portfolioData', () => {
  it('has exactly three members with unique ids', () => {
    assert.equal(portfolioData.members.length, 3)
    const ids = new Set(portfolioData.members.map((member) => member.id))
    assert.equal(ids.size, 3)
  })

  it('uses site-absolute image paths so images load on every route', () => {
    for (const member of portfolioData.members) {
      if (member.avatar) {
        assert.ok(member.avatar.startsWith('/'), `${member.id} avatar: ${member.avatar}`)
      }
      for (const project of member.projects) {
        if (project.coverImage) {
          assert.ok(project.coverImage.startsWith('/'), `${project.id} cover: ${project.coverImage}`)
        }
      }
    }
  })
})

describe('buildPortfolioContext', () => {
  const context = buildPortfolioContext()

  it('gives the AI every member with their role', () => {
    for (const member of portfolioData.members) {
      assert.ok(context.includes(member.fullName), `missing ${member.fullName}`)
      assert.ok(context.includes(member.roleNameI18n.en), `missing role of ${member.id}`)
    }
  })

  it('never sends placeholder text to the AI', () => {
    assert.equal(/Placeholder:/i.test(context), false)
    assert.equal(context.includes('ข้อความตัวอย่าง'), false)
  })

  it('contains no secrets', () => {
    assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(context), false)
    assert.equal(/postgres(ql)?:\/\//i.test(context), false)
  })
})
