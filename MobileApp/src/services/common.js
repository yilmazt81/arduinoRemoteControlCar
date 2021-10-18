import {Toast} from 'native-base';
import {translate} from './translate';

export function alert(data) {
  const toast = {
    duration: 3000,
    position: 'top',
    ...data,
  };
  if (typeof data === 'string') {
    toast.text = data;
  }
  Toast.show(toast);
}

export function asEntities(response) {
  if (response && response.data && response.data.items) {
    return response.data.items;
  }
  return null;
}
/**
 * return a single object from response.data.items[index] array or null
 *
 * @param {object} response given object fom network
 * @param {int} index index of data.items array
 * @returns object
 */
export function selectOrDefault(response, index) {
  if (
    response &&
    response.data &&
    response.data.items &&
    response.data.items[index]
  ) {
    return response.data.items[index];
  }
  return null;
}

export const ValidationTypes = {
  Error: 'error',
  Warning: 'warning',
  None: 'none',
};

export const radio_license = () => [
  {label: translate('yes'), value: 1},
  {label: translate('no'), value: 0},
];
export const radio_trailor = () => [
  {label: translate('yes'), value: 1},
  {label: translate('no'), value: 0},
];
export const radio_equipments = () => [
  {label: translate('yes'), value: 1},
  {label: translate('no'), value: 0},
];

function getField(address, fieldType, lengthOfName = 'long_name') {
  if (!address) {
    return '';
  }
  let city = '';
  const {address_components} = address;
  if (!address_components || !address_components.length) {
    return '';
  }
  address_components.forEach(item => {
    if (item && item.types && item.types.map) {
      item.types.forEach(type => {
        if (type.includes(fieldType)) {
          city = item[lengthOfName];
        }
      });
    }
  });
  return city;
}
export function getCity(address) {
  return getField(address, 'locality');
}
export function getCountry(address) {
  return getField(address, 'country', 'short_name');
}

export function showMessage(title, message) {
  alert({text: `${title}, ${message}`});
}

export function errorListHandler(error) {
  switch (error.status) {
    case 400:
      showMessage(`Error ${error.status}`, 'Bad Request', 'OK');
      break;
    case 401:
      showMessage(
        `Error ${error.status}`,
        'Unauthorized, Please sign-in and try again',
        'OK',
      );
      break;
    case 403:
      showMessage(`Error ${error.status}`, 'Access permission denied', 'OK');
      break;
    case 404:
      showMessage(`Error ${error.status}`, 'Resource Not Found', 'OK');
      break;
    case 405:
      showMessage(`Error ${error.status}`, 'Method Not Allowed', 'OK');
      break;
    case 500:
      showMessage(`Error ${error.status}`, 'Internal Server Error', 'OK');
      break;
    case 503:
      showMessage(
        `Error ${error.status}`,
        'Service Unavailable, The server is currently unable to receive requests. Please retry your request.',
        'OK',
      );
      break;
    default:
      showMessage(
        `Error ${error.status || error.message}`,
        'Unexpected error',
        'OK',
      );
      break;
  }
}

export function findErrorMessage(field, response) {
  if (response && response.error && response.error.errors) {
    const $field = response.error.errors.find(
      error => error.location === field,
    );
    if ($field) {
      return $field.message;
    }
  }
  return false;
}
export const latitudeDelta = 0.25;
export const longitudeDelta = 0.25;
export const requestTimeOut = 5000;

export function validateUser(data = {}) {
  const errors = [];
  if (!data.email) {
    errors.push({
      location: 'email',
      message: translate('provide_email'),
    });
  }
  if (!data.password) {
    errors.push({
      location: 'password',
      message: translate('provide_password'),
    });
  }
  return errors;
}

/**
 * We need to convert our filter object, to specific array because filter tags component
 * can show them on home screen, it's not used for any other reason (decoration purpose)
 * @param $filter the filter object from store
 */
export function filtersAsArray($filter) {
  const filters = [];
  if (!$filter) {
    return filters;
  }
  if ($filter.location) {
    filters.push({
      icon: 'map-marker',
      key: 'location',
      text: $filter.location,
    });
  }

  if ($filter.keyword) {
    filters.push({
      icon: 'search',
      key: 'keyword',
      text: $filter.keyword,
    });
  }

  const price = [$filter.price_min, $filter.price_max]
    .filter(x => x)
    .join(' - ');
  if (price) {
    filters.push({
      icon: 'usd',
      text: price,
      key: 'price_range',
    });
  }
  return filters;
}

export function isEmailValid(email) {
  // eslint-disable-next-line no-useless-escape
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function ValidateUserSignUp(data = {}) {
  const errors = [];
  if (!data.firstname) {
    errors.push({
      location: 'firstname',
      message: translate('provide_firstname'),
    });
  }
  if (!data.lastname) {
    errors.push({
      location: 'lastname',
      message: translate('provide_lastname'),
    });
  }
  if (!data.phone) {
    errors.push({
      location: 'phone',
      message: translate('provide_phone'),
    });
  }
  if (!data.email) {
    errors.push({
      location: 'email',
      message: translate('provide_email'),
    });
  }
  if (data.email && !isEmailValid(data.email)) {
    errors.push({
      location: 'email',
      message: translate('provide_correct_email'),
    });
  }
  if (!data.password) {
    errors.push({
      location: 'password',
      message: translate('provide_password'),
    });
  }
  if (data.password && data.password.length < 6) {
    errors.push({
      location: 'password',
      message: translate('provide_password_min_6'),
    });
  }
  if (!data.confirm_password) {
    errors.push({
      location: 'confirm_password',
      message: translate('provide_password_confirm'),
    });
  }
  if (
    data.password &&
    data.confirm_password &&
    data.password !== data.confirm_password
  ) {
    errors.push({
      location: 'confirm_password',
      message: 'provide_password_mismatch',
    });
  }
  return errors;
}

export function ValidateEditProfile(data = {}) {
  const errors = [];
  if (!data.firstname) {
    errors.push({
      location: 'firstname',
      message: 'firstname is necessary',
    });
  }
  if (!data.lastname) {
    errors.push({
      location: 'lastname',
      message: 'lastname is necessary',
    });
  }
  if (!data.phone) {
    errors.push({
      location: 'phone',
      message: 'phone is necessary',
    });
  }
  if (data.password || data.confirm_password) {
    if (!data.password) {
      errors.push({
        location: 'password',
        message: 'password is necessary',
      });
    }
    if (data.password && data.password.length < 6) {
      errors.push({
        location: 'password',
        message: 'minimum length should be 6 character',
      });
    }
    if (!data.confirm_password) {
      errors.push({
        location: 'confirm_password',
        message: 'confirm password is necessary',
      });
    }
    if (
      data.password &&
      data.confirm_password &&
      data.password !== data.confirm_password
    ) {
      errors.push({
        location: 'confirm_password',
        message: 'password and confirm password are not match',
      });
    }
  }
  return errors;
}

export function trimObjectProperties(obj) {
  return Object.keys(obj).reduce((acc, curr) => {
    if (obj[curr] && obj[curr].trim) {
      acc[curr] = obj[curr].trim();
    } else {
      acc[curr] = obj[curr];
    }
    return acc;
  }, {});
}

export function capitalizeText(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function unexpectedResponse() {
  // @todo add airbrake to send these information, arg 1 and arg 2 will be some information about error
}
// Use when you have a catch(error), and you really cannot handle the issue
export function unexpectedError(error) {
  alert({text: `${translate('unexpected_error_toast')}: ${error.message}`});
}
