import { getAbsenceCounts } from "./getAbsenceCount";

export interface ClassData {
  period: number;
  className: string;
  room: string;
  isClassOpen: boolean;
  isRoomChanged: boolean;
  isMakeupClass: boolean;
  absenceCount: number;
}

export type Schedule = Map<number, ClassData>;

export function parseHTML(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function extractClassDataContent(classElement: Element): string {
  return classElement.textContent!
    .split('\n')
    .map(line => line.trim())
    .join('')
    .replace(/【.*?】/, '');
}

/**
 * スケジュール情報を学内ポータルから取得してパースする
 */
export async function getSchedule(test: boolean = false): Promise<Schedule> {
  let response: Response
  if (test) {
    response = await fetch('/schedule.html')
  } else {
    response = await fetch('/campusweb/portal.do?page=main')
  }

  const html = await response.text()

  const document = parseHTML(html);
  const classElements = document.querySelectorAll('ul.mysch-portlet-list li');

  let schedule: Schedule = new Map();
  classElements.forEach(classElement => {
    const classContent = extractClassDataContent(classElement)

    const regex = /^([^:]+):(.*)@([^@]+)$/;
    const match = classContent.match(regex);

    if (match) {
      const period = Number(match[1].replace('限', ''));
      const className = match[2];
      const room = match[3];
      const classStatus = classElement.classList[0];
      let isClassOpen = true;
      let isRoomChanged = false;
      let isMakeupClass = false;
      switch (classStatus) {
        case "kyoshitsu":
          isRoomChanged = true;
          break;
        case 'hoko':
          isMakeupClass = true;
          break;
        case 'kyuko':
          isClassOpen = false;
      }

      const classData: ClassData = {
        period: period,
        className: className,
        room: room,
        isClassOpen: isClassOpen,
        isRoomChanged: isRoomChanged,
        isMakeupClass: isMakeupClass,
        absenceCount: 0,
      };

      schedule.set(period, classData)
    }
  });

  schedule = await getAbsenceCounts(schedule, test)

  return schedule
}