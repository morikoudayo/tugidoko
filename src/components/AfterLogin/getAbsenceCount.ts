import { parseHTML } from "./getSchedule";

export type AbsenceCounts = Map<string, number>;

/**
 * 授業の欠席回数を学内ポータルから取得しschedule内の各ClassDataのabsenceCountに代入する。
 */
export async function getAbsenceCounts(test: boolean = false): Promise<AbsenceCounts> {
  let response: Response
  if (test) {
    response = await fetch('/absence.html')
  } else {
    response = await fetch('/campusweb/campussquare.do?_flowId=AAW0001000-flow&link=menu-link-mf-135117')
  }

  const html = await response.text()

  const document = parseHTML(html)

  const currentMonth = new Date().getMonth();
  const index = 3 <= currentMonth && currentMonth <= 8 ? -1 : -2;

  const attendancesTable = Array.from(document.querySelectorAll('tbody')).at(index);

  const absenceCounts = new Map<string, number>();
  Array.from(attendancesTable!.rows).forEach((row) => {
    const className = row.children[3].textContent!.trim();

    const match = row.innerHTML.match(/\b\d{1,2}\/\d{1,2}\/\d{1,2}\/\d{1,2}\b/);
    const attendance = match![0].split('/')
    const absenceCount = Number(attendance[2]) * 0.5 + Number(attendance[3]) //欠席を1、遅刻を0.5として欠席数を計算。

    absenceCounts.set(className, absenceCount)
  })

  return absenceCounts
}