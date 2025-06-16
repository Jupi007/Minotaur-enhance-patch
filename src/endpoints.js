import { fetchMinotaur, formatDateToYMD, isHTTP200 } from "./utils";

const TOKEN_HEADER = 'X-CSRF-TOKEN';

const CSRFTokens = [];
async function getToken(name) {
  if (name in CSRFTokens) {
    return CSRFTokens[name];
  }

  const CSRFTokenResponse = await fetchMinotaur(
    'GET',
    `/csrf-token/${name}`,
  );
  const token = JSON.parse(CSRFTokenResponse.responseText).csrfToken;
  CSRFTokens[name] = token;
  return token;
}

export function fetchAvailabilities(minDate, maxDate) {
  return new Promise(async (resolve, reject) => {
    let availabilities;
    try {
      const response = await fetchMinotaur('GET', `/availabilities?minDate=${minDate}&maxDate=${maxDate}&limit=9999999&page=1`);
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

export function removeAvailabilityRequest(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetchMinotaur(
        'POST',
        `/availabilities/${id}`,
        null,
        { [TOKEN_HEADER]: await getToken('availabilitiesdelete') },
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

export function addAvailabilityRequest(start, end, id = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetchMinotaur(
        'POST',
        `/availabilities`,
        JSON.stringify({
          id: id ?? '',
          start: formatDateToYMD(start),
          end: formatDateToYMD(end),
        }),
        { [TOKEN_HEADER]: await getToken('availabilities') }
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
