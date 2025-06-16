
export const EventSources = Object.freeze({
  AVAILABILITIES: 'availabilities',
  SUMMONS: 'summons',
  VOLUNTEERING_DECLARATIONS: 'volunteeringDeclarations',
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
    color: '#18753c',
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
    };
  });
}

export function volunteeringDeclarationsEventSourceFactory(events) {
  return {
    events: events,
    id: EventSources.VOLUNTEERING_DECLARATIONS,
    color: '#725c49',
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
    };
  });
}
