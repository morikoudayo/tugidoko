import { parseHTML } from "./getSchedule";

export type AbsenceCounts = Map<string, number>;

/**
 * HTMLドキュメントから欠席回数情報をパースする
 */
export function parseAbsenceCounts(document: Document): AbsenceCounts {
  const attendancesTable = Array.from(document.querySelectorAll('tbody')).at(-2);

  const absenceCounts = new Map<string, number>();
  Array.from(attendancesTable!.rows).forEach((row) => {
    const classNameElement = row.children[3];
    if (!classNameElement?.textContent) return;
    const className = classNameElement.textContent.trim();

    const match = row.innerHTML.match(/\b\d{1,2}\/\d{1,2}\/\d{1,2}\/\d{1,2}\b/);
    if (!match) return;
    
    const attendance = match[0].split('/')
    const absenceCount = Number(attendance[2]) * 0.5 + Number(attendance[3]) //欠席を1、遅刻を0.5として欠席数を計算。

    absenceCounts.set(className, absenceCount)
  })

  return absenceCounts
}

/**
 * 授業の欠席回数を学内ポータルから取得しschedule内の各ClassDataのabsenceCountに代入する。
 */
export async function getAbsenceCounts(): Promise<AbsenceCounts> {
  const response = await fetch('/campusweb/campussquare.do?_flowId=AAW0001000-flow&link=menu-link-mf-135117')
  const html = await response.text()
  const document = parseHTML(html)
  
  return parseAbsenceCounts(document);
}