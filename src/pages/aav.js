import { fetchAvailabilities } from '../endpoints.js';
import { availabilitiesEventSourceFactory, availabilitiesToEvents, summonsEventSourceFactory, summonsToEvents, volunteeringDeclarationsEventSourceFactory, volunteeringDeclarationsToEvents } from '../event-sources.js';
import { createCalendar, fetchMinotaur, getValidEndDate } from '../utils.js';
import helpHtml from './aav/help.html?raw';

export class AavPage {
  calendarEl;
  calendar;
  helpEl;
  showAvailabilities = false;
  showSummons = true;
  showVolunteeringDeclarations = true;

  constructor() {
    const main = document.querySelector('main');
    this.calendarEl = document.createElement('div');

    main.prepend(this.calendarEl);

    const validRange = {
      start: new Date(),
      end: getValidEndDate(),
    };

    this.calendar = createCalendar(
      this.calendarEl,
      {
        validRange: validRange,
        eventSources: [

          availabilitiesEventSourceFactory(async (info, successCallback, failureCallback) => {
            if (!this.showAvailabilities) {
              successCallback([]);
              return;
            }

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
      }
    );

    this.helpEl = document.createElement('div');
    this.helpEl.innerHTML = helpHtml;
    this.calendarEl.after(this.helpEl);

    const availabilitiesCheckbox = document.getElementById('availabilities-checkbox');
    availabilitiesCheckbox.addEventListener('click', (e) => {
      this.showAvailabilities = availabilitiesCheckbox.checked;
      this.calendar.refetchEvents();
      this.calendar.unselect();
    });

    const summonsCheckbox = document.getElementById('summons-checkbox');
    summonsCheckbox.addEventListener('click', (e) => {
      this.showSummons = summonsCheckbox.checked;
      this.calendar.refetchEvents();
      this.calendar.unselect();
    });

    const volunteeringDeclarationsCheckbox = document.getElementById('volunteering-declarations-checkbox');
    volunteeringDeclarationsCheckbox.addEventListener('click', (e) => {
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
}
