import { describe, it, expect } from 'vitest'
import { parseSchedule, parseHTML } from '@/components/AfterLogin/getSchedule'
import { NO_MORE_CLASSES } from '@/components/AfterLogin/getNextPeriod'

describe('parseSchedule', () => {
  function createMockHTML(classItems: string[]): string {
    const items = classItems.map(item => `<li class="${item.split('|')[1] || ''}">${item.split('|')[0]}</li>`).join('')
    return `
      <html>
        <body>
          <ul class="mysch-portlet-list">
            ${items}
          </ul>
        </body>
      </html>
    `
  }

  it('parses normal class correctly', () => {
    const html = createMockHTML(['1限:プログラミング基礎@A101|'])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    expect(result.has(1)).toBe(true)
    const classData = result.get(1)!
    expect(classData).toEqual({
      period: 1,
      className: 'プログラミング基礎',
      room: 'A101',
      isClassOpen: true,
      isRoomChanged: false,
      isMakeupClass: false,
    })
  })

  it('parses cancelled class correctly', () => {
    const html = createMockHTML(['2限:データベース論@B202|kyuko'])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    const classData = result.get(2)!
    expect(classData.isClassOpen).toBe(false)
    expect(classData.className).toBe('データベース論')
  })

  it('parses room changed class correctly', () => {
    const html = createMockHTML(['3限:ソフトウェア工学@C303|kyoshitsu'])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    const classData = result.get(3)!
    expect(classData.isRoomChanged).toBe(true)
    expect(classData.isClassOpen).toBe(true)
  })

  it('parses makeup class correctly', () => {
    const html = createMockHTML(['4限:システム設計@D404|hoko'])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    const classData = result.get(4)!
    expect(classData.isMakeupClass).toBe(true)
    expect(classData.isClassOpen).toBe(true)
  })

  it('parses multiple classes correctly', () => {
    const html = createMockHTML([
      '1限:プログラミング基礎@A101|',
      '3限:データベース論@B202|kyuko',
      '5限:ソフトウェア工学@C303|kyoshitsu'
    ])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    expect(result.size).toBe(4) // 3 classes + NO_MORE_CLASSES
    expect(result.has(1)).toBe(true)
    expect(result.has(3)).toBe(true)
    expect(result.has(5)).toBe(true)
    expect(result.has(NO_MORE_CLASSES)).toBe(true)
  })

  it('ignores invalid format classes', () => {
    const html = createMockHTML([
      '1限:プログラミング基礎@A101|',
      'Invalid format|',
      '3限:データベース論@B202|'
    ])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    expect(result.size).toBe(3) // 2 valid classes + NO_MORE_CLASSES
    expect(result.has(1)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('handles content with special characters', () => {
    const html = createMockHTML(['1限:プログラミング基礎【補講】@A101|'])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    const classData = result.get(1)!
    expect(classData.className).toBe('プログラミング基礎') // 【補講】 should be removed
  })

  it('always includes NO_MORE_CLASSES entry', () => {
    const html = createMockHTML([])
    const document = parseHTML(html)
    
    const result = parseSchedule(document)
    
    expect(result.has(NO_MORE_CLASSES)).toBe(true)
    expect(result.size).toBe(1)
  })
})