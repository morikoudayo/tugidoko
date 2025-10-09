import { describe, it, expect } from 'vitest'
import { parseSchedule, parseHTML } from '@/components/AfterLogin/getSchedule'
import { NO_MORE_CLASSES } from '@/components/AfterLogin/getNextPeriod'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadFixture(filename: string): string {
  return readFileSync(join(__dirname, '../../fixtures', filename), 'utf-8')
}

describe('parseSchedule', () => {
  it('parses various class types correctly', () => {
    const scheduleHtml = loadFixture('schedule.html')
    const html = `<html><body>${scheduleHtml}</body></html>`
    const document = parseHTML(html)
    const result = parseSchedule(document)
    
    expect(result.size).toBe(5) // 4 classes + NO_MORE_CLASSES
    
    // Normal class
    expect(result.get(1)).toEqual({
      period: 1,
      className: 'プログラミング基礎',
      room: 'A101',
      isClassOpen: true,
      isRoomChanged: false,
      isMakeupClass: false,
    })
    
    // Cancelled class
    expect(result.get(2)?.isClassOpen).toBe(false)
    
    // Room changed class
    expect(result.get(3)?.isRoomChanged).toBe(true)
    
    // Makeup class
    expect(result.get(4)?.isMakeupClass).toBe(true)

    expect(result.has(NO_MORE_CLASSES)).toBe(true)
  })

  it('ignores invalid format classes', () => {
    const html = `<ul class="mysch-portlet-list"><li class="">Invalid format</li><li class="">1限:プログラミング基礎@A101</li></ul>`
    const document = parseHTML(html)
    const result = parseSchedule(document)
    
    expect(result.size).toBe(2)
    expect(result.has(1)).toBe(true)
  })
})