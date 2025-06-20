import { addAvailabilityRequest, fetchAvailabilities, removeAvailabilityRequest } from '../endpoints.js';
import { availabilitiesEventSourceFactory, availabilitiesToEvents, EventSources, summonsEventSourceFactory, summonsToEvents, volunteeringDeclarationsEventSourceFactory, volunteeringDeclarationsToEvents } from '../event-sources.js';
import { createCalendar, fetchMinotaur, getValidEndDate } from '../utils.js';
import templateHtml from './missions/template.html?raw';

export class MissionsPage {
  templateEl;
  calendar;

  locked = false;
  showSummons = true;
  showVolunteeringDeclarations = false;

  constructor() {
    const main = document.querySelector('main');

    this.templateEl = document.createElement('div');
    this.templateEl.innerHTML = templateHtml;
    main.prepend(this.templateEl);

    const calendarEl = document.getElementById('calendar');

    const validRange = {
      start: new Date(),
      end: getValidEndDate(),
    };

    this.calendar = createCalendar(
      calendarEl,
      {
        eventSources: [
          availabilitiesEventSourceFactory(async (info, successCallback, failureCallback) => {
            const minDate = new Date();
            const endDate = getValidEndDate();

            try {
              const availabilities = await fetchAvailabilities(minDate.toISOString(), endDate.toISOString());
              successCallback(availabilitiesToEvents(availabilities));
            } catch (error) {
              failureCallback(error)
            }
          }),
          summonsEventSourceFactory(async (info, successCallback, failureCallback) => {
            if (!this.showSummons) {
              successCallback([]);
              return;
            }

            const minDate = new Date();
            const endDate = getValidEndDate();

            try {
              const summonsResponse = await fetchMinotaur('GET', `/convocations?minDate=${minDate.toISOString()}&maxDate=${endDate.toISOString()}`);
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

            const minDate = new Date();
            const endDate = getValidEndDate();

            try {
              const volunteeringDeclarationsResponse = await fetchMinotaur('GET', `/volunteering-declarations?minDate=${minDate.toISOString()}&maxDate=${endDate.toISOString()}`);
              const volunteeringDeclarations = JSON.parse(volunteeringDeclarationsResponse.responseText);
              successCallback(volunteeringDeclarationsToEvents(volunteeringDeclarations));
            } catch (error) {
              failureCallback(error);
            }
          }),
        ],
        selectable: true,
        validRange: validRange,
        dateClick: (info) => this.onDateClick(info),
      }
    );

    const summonsCheckbox = document.getElementById('summons-checkbox');
    summonsCheckbox.addEventListener('click', (e) => {
      this.showSummons = summonsCheckbox.checked;
      this.calendar.refetchEvents();
      this.calendar.unselect();
    });

    const volunteeringDeclarationsCheckbox = document.getElementById('volunteering-declarations-checkbox');
    volunteeringDeclarationsCheckbox.addEventListener('click', (_) => {
      this.showVolunteeringDeclarations = volunteeringDeclarationsCheckbox.checked;
      this.calendar.refetchEvents();
      this.calendar.unselect();
    });
  }

  destroy() {
    this.calendar.destroy();
    this.templateEl.remove();
  }

  onDateClick(info) {
    const clickedDate = info.date;
    const clickedTime = clickedDate.getTime();

    const matchingEvents = this.calendar.getEvents().filter(event => {
      if (event.source.id !== EventSources.AVAILABILITIES) return;
      return clickedTime >= event.start.getTime() && clickedTime < event.end.getTime();
    });

    if (matchingEvents.length > 0) {
      matchingEvents.forEach(event => {
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
    }
    finally {
      this.calendar.refetchEvents();
      this.calendar.unselect();
      this.locked = false;
    }
  }
}
