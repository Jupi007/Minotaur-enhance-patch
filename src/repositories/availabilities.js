export const availabilitiesEventSource = {
  events: (info, successCallback, failureCallback) => {
    const minDate = new Date();
    const endDate = getValidEndDate();

    fetchAvailabilities(minDate.toISOString(), endDate.toISOString())
      .then((availabilities) => {
        const result = availabilities.items.map(availability => {
          const endDate = new Date(availability.end);
          endDate.setDate(endDate.getDate() + 1);

          return {
            id: availability.id,
            start: availability.start,
            end: endDate,
            allDay: true,
          };
        });

        successCallback(result);
      })
      .catch((e) => failureCallback(e));
  },
  id: EventSources.AVAILABILITIES,
  display: 'background',
  color: '#6ca3e3',
};
