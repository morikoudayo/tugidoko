export interface ClassInfo {
  className: string;
  room: string;
  isClassOpen: boolean;
  isRoomChanged: boolean;
  isMakeupClass: boolean;
}

export type Schedule = Map<number, ClassInfo>;

export async function getSchedule() {
  const response = await fetch('/campusweb/portal.do?page=main')
  const html = await response.text()

  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const classInfoList = document.querySelectorAll('ul.mysch-portlet-list li');

  const schedule:Schedule = new Map();
  classInfoList!.forEach(classInfo => {
    const classInfoText = classInfo.textContent!
      .split('\n')
      .map(line => line.trim())
      .join('')
      .replace(/【.*?】/, '');
    console.log(classInfoText)

    const regex = /^([^:]+):(.*)@([^@]+)$/;
    const match = classInfoText.match(regex);

    if (match) {
      const period = Number(match[1].replace('限', ''));
      const className = match[2];
      const room = match[3];
      let isClassOpen = true;
      let isRoomChanged = false;
      let isMakeupClass = false;
      switch (classInfo.classList[0]) {
        case "kyoshitsu":
          isRoomChanged = true;
          break;
        case 'hoko':
          isMakeupClass = true;
          break;
        case 'kyuko':
          isClassOpen = false;
      }

      const classInfoObject: ClassInfo = {
        className: className,
        room: room,
        isClassOpen: isClassOpen,
        isRoomChanged: isRoomChanged,
        isMakeupClass: isMakeupClass,
      };

      console.log(classInfoObject)
      schedule.set(period, classInfoObject)
    }
  });

  return schedule
}