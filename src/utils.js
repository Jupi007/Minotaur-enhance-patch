import { BASE_URL } from "./constants";

export function addCustomStyles(css) {
  const styleEL = document.createElement("style");
  styleEL.textContent = css;
  document.head.appendChild(styleEL);
  return styleEL;
}

export function fetchMinotaur(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      method: method,
      url: BASE_URL + url,
      data: data,
      headers: headers,
      onload: (response) => {
        resolve(response);
      },
      onerror: (error) => {
        reject(error);
      }
    });
  });
}

export function createCalendar(calendarEl, options = {}) {
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'fr',
    height: 'auto',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today',
    },
    eventDidMount: function (info) {
      info.el.setAttribute('title', info.event.title);
    },
    ...options,
  });
  calendar.render();
  return calendar;
}

export function formatDateToYMD(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); // months are 0-based
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isHTTP200(code) {
  return code >= 200 && code < 300;
}

export function getValidEndDate() {
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  nextYear.setMonth(nextYear.getMonth() - 1);
  return new Date(nextYear.getFullYear(), nextYear.getMonth() + 1, 0);
}
