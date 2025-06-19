import { stringToBlueVariant, stringToBrownVariant, stringToGreenVariant } from "./utils";

export const EventSources = Object.freeze({
  AVAILABILITIES: 'availabilities',
  SUMMONS: 'summons',
  VOLUNTEERING_DECLARATIONS: 'volunteeringDeclarations',
  VOLUNTEER_CALLS: 'volunteerCalls',
});

export function availabilitiesEventSourceFactory(events) {
  return {
    events: events,
    id: EventSources.AVAILABILITIES,
    display: 'background',
    color: '#6ca3e3',
  };
}

export function availabilitiesToEvents(availabilities) {
  return availabilities.items.map(availability => {
    const endDate = new Date(availability.end);
    endDate.setDate(endDate.getDate() + 1);

    return {
      id: availability.id,
      start: availability.start,
      end: endDate,
      allDay: true,
    };
  });
}

export function summonsEventSourceFactory(events) {
  return {
    events: events,
    id: EventSources.SUMMONS,
  };
}

export function summonsToEvents(summons) {
  return summons.items.map(summon => {
    const endDate = new Date(summon.end);
    endDate.setDate(endDate.getDate() + 1);
    return {
      start: summon.start,
      end: endDate,
      allDay: true,
      title: summon.missionObjet,
      color: stringToGreenVariant(summon.missionObjet + summon.start + summon.end),
    };
  });
}

export function volunteeringDeclarationsEventSourceFactory(events) {
  return {
    events: events,
    id: EventSources.VOLUNTEERING_DECLARATIONS,
  };
}

export function volunteeringDeclarationsToEvents(volunteeringDeclarations) {
  return volunteeringDeclarations.items.map(volunteering => {
    const endDate = new Date(volunteering.end);
    endDate.setDate(endDate.getDate() + 1);
    return {
      start: volunteering.start,
      end: endDate,
      allDay: true,
      title: volunteering.objet,
      color: stringToBrownVariant(volunteering.objet + volunteering.missionStart + volunteering.missionEnd),
    };
  });
}

export function volunteerCallsEventSourceFactory(events) {
  return {
    events: events,
    id: EventSources.VOLUNTEER_CALLS,
  };
}

export function volunteerCallsToEvents(volunteerCalls) {
  return volunteerCalls.items.map(volunteerCall => {
    // TODO: add utils for end date
    const endDate = new Date(volunteerCall.end);
    endDate.setDate(endDate.getDate() + 1);
    return {
      start: volunteerCall.start,
      end: endDate,
      allDay: true,
      title: volunteerCall.objet,
      color: stringToBlueVariant(volunteerCall.objet + volunteerCall.missionStart + volunteerCall.missionEnd),
    };
  });
}
