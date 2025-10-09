import { describe, it, expect } from 'vitest'
import { parseAbsenceCounts } from '@/components/AfterLogin/getAbsenceCount'
import { parseHTML } from '@/components/AfterLogin/getSchedule'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadFixture(filename: string): string {
  return readFileSync(join(__dirname, '../../fixtures', filename), 'utf-8')
}

describe('parseAbsenceCounts', () => {
  it('parses absence counts correctly from second-to-last table', () => {
    const absenceHtml = loadFixture('absence.html')
    const html = `<html><body>${absenceHtml}</body></html>`
    const document = parseHTML(html)
    const result = parseAbsenceCounts(document)
    
    expect(result.size).toBe(3) // First table has 3 classes
    expect(result.get('プログラミング基礎')).toBe(2) // 0 * 0.5 + 2 = 2
    expect(result.get('データベース論')).toBe(4) // 2 * 0.5 + 3 = 4
    expect(result.get('ソフトウェア工学')).toBe(0.5) // 1 * 0.5 + 0 = 0.5

    expect(result.has('こちらは読まれるべきではない')).toBe(false)
  })

  it('skips rows without class names', () => {
    const testHtml = `
      <table>
        <tbody>
          <tr>
            <td></td><td></td><td></td>
            <td></td>
            <td></td><td></td>
            <td>10/5/2/3</td>
          </tr>
          <tr>
            <td></td><td></td><td></td>
            <td>有効な科目</td>
            <td></td><td></td>
            <td>15/10/1/2</td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
        </tbody>
      </table>
    `
    const document = parseHTML(testHtml)
    const result = parseAbsenceCounts(document)
    
    expect(result.size).toBe(1)
    expect(result.get('有効な科目')).toBe(2.5) // 1 * 0.5 + 2 = 2.5
  })

  it('skips rows without attendance pattern', () => {
    const testHtml = `
      <table>
        <tbody>
          <tr>
            <td></td><td></td><td></td>
            <td>無効パターン</td>
            <td></td><td></td>
            <td>invalid format</td>
          </tr>
          <tr>
            <td></td><td></td><td></td>
            <td>有効な科目</td>
            <td></td><td></td>
            <td>15/10/1/2</td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
        </tbody>
      </table>
    `
    const document = parseHTML(testHtml)
    const result = parseAbsenceCounts(document)
    
    expect(result.size).toBe(1)
    expect(result.get('有効な科目')).toBe(2.5)
    expect(result.has('無効パターン')).toBe(false)
  })

  it('handles empty tables', () => {
    const testHtml = `<table><tbody></tbody></table><table><tbody></tbody></table>`
    const document = parseHTML(testHtml)
    const result = parseAbsenceCounts(document)
    
    expect(result.size).toBe(0)
  })
})