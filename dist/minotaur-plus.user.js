// ==UserScript==
// @name         Minotaur hack
// @version      2025-03-30
// @grant        GM.xmlHttpRequest
// @require      https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js
// @match        https://minotaur.sso.gendarmerie.interieur.gouv.fr/*
// ==/UserScript==

(() => {
  // src/constants.js
  var BASE_URL = "https://minotaur.sso.gendarmerie.interieur.gouv.fr/v2/data";

  // src/utils.js
  function addCustomStyles(css) {
    const styleEL = document.createElement("style");
    styleEL.textContent = css;
    document.head.appendChild(styleEL);
    return styleEL;
  }
  function fetchMinotaur(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method,
        url: BASE_URL + url,
        data,
        headers,
        onload: (response) => {
          resolve(response);
        },
        onerror: (error) => {
          reject(error);
        }
      });
    });
  }
  function createCalendar(calendarEl, options = {}) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      locale: "fr",
      height: "auto",
      firstDay: 1,
      headerToolbar: {
        left: "prev,next",
        center: "title",
        right: "today"
      },
      ...options
    });
    calendar.render();
    return calendar;
  }
  function formatDateToYMD(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function isHTTP200(code) {
    return code >= 200 && code < 300;
  }
  function getValidEndDate() {
    const now = /* @__PURE__ */ new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(now.getFullYear() + 1);
    nextYear.setMonth(nextYear.getMonth() - 1);
    return new Date(nextYear.getFullYear(), nextYear.getMonth() + 1, 0);
  }

  // src/endpoints.js
  var TOKEN_HEADER = "X-CSRF-TOKEN";
  var CSRFTokens = [];
  async function getToken(name) {
    if (name in CSRFTokens) {
      return CSRFTokens[name];
    }
    const CSRFTokenResponse = await fetchMinotaur(
      "GET",
      `/csrf-token/${name}`
    );
    const token = JSON.parse(CSRFTokenResponse.responseText).csrfToken;
    CSRFTokens[name] = token;
    return token;
  }
  function fetchAvailabilities(minDate, maxDate) {
    return new Promise(async (resolve, reject) => {
      let availabilities;
      try {
        const response = await fetchMinotaur("GET", `/availabilities?minDate=${minDate}&maxDate=${maxDate}&limit=9999999&page=1`);
        availabilities = JSON.parse(response.responseText);
        if (isHTTP200(response.status)) {
          resolve(availabilities);
        } else {
          reject(`Error unexpected response code ${response.status}`);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  function removeAvailabilityRequest(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetchMinotaur(
          "POST",
          `/availabilities/${id}`,
          null,
          { [TOKEN_HEADER]: await getToken("availabilitiesdelete") }
        );
        if (isHTTP200(response.status)) {
          resolve();
        } else {
          reject(`Error unexpected response code ${response.status}`);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  function addAvailabilityRequest(start, end, id = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetchMinotaur(
          "POST",
          `/availabilities`,
          JSON.stringify({
            id: id ?? "",
            start: formatDateToYMD(start),
            end: formatDateToYMD(end)
          }),
          { [TOKEN_HEADER]: await getToken("availabilities") }
        );
        if (isHTTP200(response.status)) {
          resolve();
        } else {
          reject(`Error unexpected response code ${response.status}`);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // src/event-sources.js
  var EventSources = Object.freeze({
    AVAILABILITIES: "availabilities",
    SUMMONS: "summons",
    VOLUNTEERING_DECLARATIONS: "volunteeringDeclarations"
  });
  function availabilitiesEventSourceFactory(events) {
    return {
      events,
      id: EventSources.AVAILABILITIES,
      display: "background",
      color: "#6ca3e3"
    };
  }
  function availabilitiesToEvents(availabilities) {
    return availabilities.items.map((availability) => {
      const endDate = new Date(availability.end);
      endDate.setDate(endDate.getDate() + 1);
      return {
        id: availability.id,
        start: availability.start,
        end: endDate,
        allDay: true
      };
    });
  }
  function summonsEventSourceFactory(events) {
    return {
      events,
      id: EventSources.SUMMONS,
      color: "#18753c"
    };
  }
  function summonsToEvents(summons) {
    return summons.items.map((summon) => {
      const endDate = new Date(summon.end);
      endDate.setDate(endDate.getDate() + 1);
      return {
        start: summon.start,
        end: endDate,
        allDay: true,
        title: summon.missionObjet
      };
    });
  }
  function volunteeringDeclarationsEventSourceFactory(events) {
    return {
      events,
      id: EventSources.VOLUNTEERING_DECLARATIONS,
      color: "#725c49"
    };
  }
  function volunteeringDeclarationsToEvents(volunteeringDeclarations) {
    return volunteeringDeclarations.items.map((volunteering) => {
      const endDate = new Date(volunteering.end);
      endDate.setDate(endDate.getDate() + 1);
      return {
        start: volunteering.start,
        end: endDate,
        allDay: true,
        title: volunteering.objet
      };
    });
  }

  // raw:./aav/help.html?raw
  var help_default = '<div class="calendar-help">\n	<div class="calendar-help-square-container">\n		<div class="calendar-help-square-item">\n			<input id="availabilities-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--blue">\n			<label for="availabilities-checkbox">DISPONIBILIT\xC9S</label>\n		</div>\n		<div class="calendar-help-square-item">\n			<input id="volunteering-declarations-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--brown" checked>\n			<label for="volunteering-declarations-checkbox">VOLONTARIATS</label>\n		</div>\n		<div class="calendar-help-square-item">\n			<input id="summons-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--green" checked>\n			<label for="summons-checkbox">CONVOCATIONS</label>\n		</div>\n	</div>\n</div>\n';

  // src/pages/aav.js
  var AavPage = class {
    calendarEl;
    calendar;
    helpEl;
    showAvailabilities = false;
    showSummons = true;
    showVolunteeringDeclarations = true;
    constructor() {
      const main = document.querySelector("main");
      this.calendarEl = document.createElement("div");
      main.prepend(this.calendarEl);
      const validRange = {
        start: /* @__PURE__ */ new Date(),
        end: getValidEndDate()
      };
      this.calendar = createCalendar(
        this.calendarEl,
        {
          validRange,
          eventSources: [
            availabilitiesEventSourceFactory(async (info, successCallback, failureCallback) => {
              if (!this.showAvailabilities) {
                successCallback([]);
                return;
              }
              const minDate = /* @__PURE__ */ new Date();
              const endDate = getValidEndDate();
              try {
                const availabilities = await fetchAvailabilities(minDate.toISOString(), endDate.toISOString());
                successCallback(availabilitiesToEvents(availabilities));
              } catch (error) {
                failureCallback(error);
              }
            }),
            summonsEventSourceFactory(async (info, successCallback, failureCallback) => {
              if (!this.showSummons) {
                successCallback([]);
                return;
              }
              const minDate = /* @__PURE__ */ new Date();
              const endDate = getValidEndDate();
              try {
                const summonsResponse = await fetchMinotaur("GET", `/convocations?minDate=${minDate.toISOString()}&maxDate=${endDate.toISOString()}`);
                const summons = JSON.parse(summonsResponse.responseText);
                successCallback(summonsToEvents(summons));
              } catch (error) {
                failureCallback(error);
              }
            }),
            volunteeringDeclarationsEventSourceFactory(async (info, successCallback, failureCallback) => {
              if (!this.showVolunteeringDeclarations) {
                successCallback([]);
                return;
              }
              const minDate = /* @__PURE__ */ new Date();
              const endDate = getValidEndDate();
              try {
                const volunteeringDeclarationsResponse = await fetchMinotaur("GET", `/volunteering-declarations?minDate=${minDate.toISOString()}&maxDate=${endDate.toISOString()}`);
                const volunteeringDeclarations = JSON.parse(volunteeringDeclarationsResponse.responseText);
                successCallback(volunteeringDeclarationsToEvents(volunteeringDeclarations));
              } catch (error) {
                failureCallback(error);
              }
            })
          ]
        }
      );
      this.helpEl = document.createElement("div");
      this.helpEl.innerHTML = help_default;
      this.calendarEl.after(this.helpEl);
      const availabilitiesCheckbox = document.getElementById("availabilities-checkbox");
      availabilitiesCheckbox.addEventListener("click", (e) => {
        this.showAvailabilities = availabilitiesCheckbox.checked;
        this.calendar.refetchEvents();
        this.calendar.unselect();
      });
      const summonsCheckbox = document.getElementById("summons-checkbox");
      summonsCheckbox.addEventListener("click", (e) => {
        this.showSummons = summonsCheckbox.checked;
        this.calendar.refetchEvents();
        this.calendar.unselect();
      });
      const volunteeringDeclarationsCheckbox = document.getElementById("volunteering-declarations-checkbox");
      volunteeringDeclarationsCheckbox.addEventListener("click", (e) => {
        this.showVolunteeringDeclarations = volunteeringDeclarationsCheckbox.checked;
        this.calendar.refetchEvents();
        this.calendar.unselect();
      });
    }
    destroy() {
      this.calendar.destroy();
      this.calendarEl.remove();
      this.helpEl.remove();
    }
  };

  // raw:./missions/help.html?raw
  var help_default2 = '<div class="calendar-help">\n	<div>\n		Clickez sur une date pour ajouter/supprimer une disponibilit\xE9.\n	</div>\n	<div class="calendar-help-square-container">\n		<div class="calendar-help-square-item">\n			<div class="calendar-help-square calendar-help-square--blue"></div>\n			DISPONIBILIT\xC9S\n		</div>\n		<div class="calendar-help-square-item">\n			<input id="summons-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--green" checked>\n			<label for="summons-checkbox">CONVOCATIONS</label>\n		</div>\n	</div>\n</div>\n';

  // src/pages/missions.js
  var MissionsPage = class {
    calendarEl;
    calendar;
    helpEl;
    locked = false;
    showSummons = true;
    constructor() {
      const main = document.querySelector("main");
      this.calendarEl = document.createElement("div");
      main.prepend(this.calendarEl);
      const validRange = {
        start: /* @__PURE__ */ new Date(),
        end: getValidEndDate()
      };
      this.calendar = createCalendar(
        this.calendarEl,
        {
          eventSources: [
            availabilitiesEventSourceFactory(async (info, successCallback, failureCallback) => {
              const minDate = /* @__PURE__ */ new Date();
              const endDate = getValidEndDate();
              try {
                const availabilities = await fetchAvailabilities(minDate.toISOString(), endDate.toISOString());
                successCallback(availabilitiesToEvents(availabilities));
              } catch (error) {
                failureCallback(error);
              }
            }),
            summonsEventSourceFactory(async (info, successCallback, failureCallback) => {
              if (!this.showSummons) {
                successCallback([]);
                return;
              }
              const minDate = /* @__PURE__ */ new Date();
              const endDate = getValidEndDate();
              try {
                const summonsResponse = await fetchMinotaur("GET", `/convocations?minDate=${minDate.toISOString()}&maxDate=${endDate.toISOString()}`);
                const summons = JSON.parse(summonsResponse.responseText);
                successCallback(summonsToEvents(summons));
              } catch (error) {
                failureCallback(error);
              }
            })
          ],
          selectable: true,
          validRange,
          dateClick: (info) => this.onDateClick(info)
        }
      );
      this.helpEl = document.createElement("div");
      this.helpEl.innerHTML = help_default2;
      this.calendarEl.after(this.helpEl);
      const summonsCheckbox = document.getElementById("summons-checkbox");
      summonsCheckbox.addEventListener("click", (e) => {
        this.showSummons = summonsCheckbox.checked;
        this.calendar.refetchEvents();
        this.calendar.unselect();
      });
    }
    destroy() {
      this.calendar.destroy();
      this.calendarEl.remove();
      this.helpEl.remove();
    }
    onDateClick(info) {
      const clickedDate = info.date;
      const clickedTime = clickedDate.getTime();
      const matchingEvents = this.calendar.getEvents().filter((event) => {
        if (event.source.id !== EventSources.AVAILABILITIES) return;
        return clickedTime >= event.start.getTime() && clickedTime < event.end.getTime();
      });
      if (matchingEvents.length > 0) {
        matchingEvents.forEach((event) => {
          this.removeAvailability(event, clickedDate);
        });
      } else {
        this.addAvailability(clickedDate);
      }
    }
    async removeAvailability(event, clickedDate) {
      if (this.locked) return;
      this.locked = true;
      try {
        await removeAvailabilityRequest(event.id);
        const fixedEnd = new Date(event.end);
        fixedEnd.setDate(fixedEnd.getDate() - 1);
        if (event.start.getTime() < clickedDate.getTime()) {
          const end = new Date(clickedDate);
          end.setDate(end.getDate() - 1);
          await addAvailabilityRequest(event.start, end);
        }
        if (fixedEnd.getTime() > clickedDate.getTime()) {
          const start = new Date(clickedDate);
          start.setDate(start.getDate() + 1);
          await addAvailabilityRequest(start, fixedEnd);
        }
      } finally {
        this.calendar.refetchEvents();
        this.calendar.unselect();
        this.locked = false;
      }
    }
    async addAvailability(date) {
      if (this.locked) return;
      this.locked = true;
      try {
        await addAvailabilityRequest(date, date);
      } finally {
        this.calendar.refetchEvents();
        this.calendar.unselect();
        this.locked = false;
      }
    }
  };

  // src/app.js
  var App = class {
    currentPage = null;
    constructor() {
      this.initNewPage();
      const _pushState = history.pushState;
      history.pushState = (...args) => {
        _pushState.apply(history, args);
        this.destroyCurrentPage();
        this.initNewPage();
      };
      window.addEventListener("popstate", () => {
        this.destroyCurrentPage();
        this.initNewPage();
      });
    }
    destroyCurrentPage() {
      if (this.currentPage !== null) {
        this.currentPage.destroy();
        this.currentPage = null;
      }
    }
    initNewPage() {
      if (location.href.endsWith("missions")) {
        this.currentPage = new MissionsPage();
      } else if (location.href.endsWith("aav")) {
        this.currentPage = new AavPage();
      }
    }
  };

  // raw:./style.css?raw
  var style_default = ".fc {\n  margin: 0 auto;\n  margin-top: 3rem;\n  padding: 0 1rem;\n  max-width: 50rem;\n}\n\n.fc-h-event .fc-event-title {\n  text-overflow: ellipsis;\n  font-size: .75em;\n}\n\n.fc .fc-toolbar-title {\n  font-size: 1.5em;\n  text-transform: capitalize;\n}\n\n.fc-day:not(.fc-day-disabled) {\n  cursor: default;\n}\n\n.fc-daygrid-day-number {\n  cursor: default !important;\n}\n\n.fc-event:not(.fc-bg-event):not(.fc-col-header-cell) {\n  cursor: default !important;\n}\n\n.calendar-help {\n  display: flex;\n  flex-direction: column;\n  gap: 2rem;\n\n  margin: 0 auto;\n  margin-top: 1.5rem;\n  margin-bottom: 3rem;\n  padding: 0 1rem;\n  max-width: 50rem;\n}\n\n.calendar-help-square-container {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  gap: 2rem;\n}\n\n.calendar-help-square-item {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: center;\n  gap: .5rem;\n}\n\n.calendar-help-square {\n  width: 1.5rem;\n  height: 1.5rem;\n  border-radius: 3px;\n}\n\n.calendar-help-square--green {\n  accent-color: #18753c;\n  background-color: #18753c;\n}\n\n.calendar-help-square--brown {\n  accent-color: #725c49;\n  background-color: #725c49;\n}\n\n.calendar-help-square--blue {\n  accent-color: #d3e3f7;\n  background-color: #d3e3f7;\n}\n";

  // src/main.js
  document.addEventListener("DOMContentLoaded", () => {
    addCustomStyles(style_default);
    new App();
  });
})();
