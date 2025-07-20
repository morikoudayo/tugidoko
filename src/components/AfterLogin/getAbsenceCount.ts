import { parseHTML, type ClassInfo } from "./getSchedule";

/**
 * classInfoObject.classNameと授業名が一致する授業の欠席回数を学内ポータルから取得する
 */
export async function getAbsenceCount(classInfoObject: ClassInfo | undefined): Promise<number> {
  if (classInfoObject === undefined) {
    return 0
  }

  const response = await fetch('/campusweb/campussquare.do?_flowId=AAW0001000-flow&link=menu-link-mf-135117')
  const html = await response.text()

  const document = parseHTML(html)

  const currentMonth = new Date().getMonth();
  const index =  3 <= currentMonth && currentMonth <= 8 ? -1 : -2;

  const attendancesTable = Array.from(document.querySelectorAll('tbody')).at(index);
  if (attendancesTable === undefined) {
    return 0
  }

  for (let i = 0; i < attendancesTable.rows.length; i++) {
    if (attendancesTable.rows[i].innerHTML.includes(classInfoObject.className)) {
      const match = attendancesTable.rows[i].innerHTML.match(/\b\d{1,2}\/\d{1,2}\/\d{1,2}\/\d{1,2}\b/);

      if (match) {
        const attendanceArray = match[0].split('/')
        return Number(attendanceArray[2]) * 0.5 + Number(attendanceArray[3])
      }
    }
  }

  return 0
}