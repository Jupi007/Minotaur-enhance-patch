import { fetchAvailabilities } from '../endpoints.js';
import { availabilitiesEventSourceFactory, availabilitiesToEvents, summonsEventSourceFactory, summonsToEvents, volunteerCallsEventSourceFactory, volunteerCallsToEvents, volunteeringDeclarationsEventSourceFactory, volunteeringDeclarationsToEvents } from '../event-sources.js';
import { createCalendar, fetchMinotaur, getValidEndDate } from '../utils.js';
import templateHtml from './aav/template.html?raw';

export class AavPage {
  templateEl;
  calendar;

  showAvailabilities = false;
  showSummons = true;
  showVolunteeringDeclarations = true;
  showVolunteerCalls = false;

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
          volunteerCallsEventSourceFactory(async (info, successCallback, failureCallback) => {
            if (!this.showVolunteerCalls) {
              successCallback([]);
              return;
            }

            const minDate = new Date();
            const endDate = getValidEndDate();

            try {
              const volunteerCallsResponse = await fetchMinotaur('GET', `/missions?status=missions&minDate=${minDate.toISOString()}&maxDate=${endDate.toISOString()}&limit=9999999`);
              const volunteerCalls = JSON.parse(volunteerCallsResponse.responseText);
              successCallback(volunteerCallsToEvents(volunteerCalls));
            } catch (error) {
              failureCallback(error);
            }
          }),
        ],
      }
    );

    const availabilitiesCheckbox = document.getElementById('availabilities-checkbox');
    availabilitiesCheckbox.addEventListener('click', (_) => {
      this.showAvailabilities = availabilitiesCheckbox.checked;
      this.calendar.refetchEvents();
      this.calendar.unselect();
    });

    const summonsCheckbox = document.getElementById('summons-checkbox');
    summonsCheckbox.addEventListener('click', (_) => {
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

    const volunteerCallsCheckbox = document.getElementById('volunteer-calls-checkbox');
    volunteerCallsCheckbox.addEventListener('click', (_) => {
      this.showVolunteerCalls = volunteerCallsCheckbox.checked;
      this.calendar.refetchEvents();
      this.calendar.unselect();
    });
  }

  destroy() {
    this.calendar.destroy();
    this.templateEl.remove();
  }
}
