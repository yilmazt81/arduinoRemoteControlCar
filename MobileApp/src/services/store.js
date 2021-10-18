import {BehaviorSubject} from 'rxjs';
import {Dimensions} from 'react-native';
import {AsyncStorage} from '@react-native-async-storage/async-storage';

export const UX = new BehaviorSubject({
  userHasEverSetLocalisation: false,
  userVisitedLocalisationScreen: false,
});

export function UXSet(params) {
  const content = {
    ...UX.value,
    ...params,
  };
  UX.next(content);
  Promise.resolve(AsyncStorage.setItem('UX_INFO', JSON.stringify(content)));
}

export const Store = {
  user: new BehaviorSubject(null),
  token: new BehaviorSubject(''),
  latestLocationPan: new BehaviorSubject({}),
  userVessels: new BehaviorSubject([]),
  navigation: null,
  favoriteList: new BehaviorSubject([]),
  localisation: new BehaviorSubject({
    lang: 'pl',
    currency: 'pln',
    country: 'pl',
  }),
  afterLoginRedirect: 'Home',
  screenMessage: '',

  ux: UX,
};

export function SaveLocationPan(data) {
  if (data) {
    Promise.resolve(
      AsyncStorage.setItem('latestLocationPan', JSON.stringify(data)),
    );
  }
}
export function LoadLocationPan() {
  return AsyncStorage.getItem('latestLocationPan').then(data => {
    if (data && data.length > 5) {
      const $data = JSON.parse(data);
      if ($data) {
        Store.latestLocationPan.next($data);
      }
      return $data;
    }
    return false;
  });
}

export function ReloadUX() {
  return AsyncStorage.getItem('UX_INFO').then(data => {
    if (data && data.length > 5) {
      const $data = JSON.parse(data);
      if ($data) {
        Store.ux.next($data);
      }
      return $data;
    }
    return false;
  });
}

export function ReloadUser() {
  return AsyncStorage.getItem('app_credentials').then(cred => {
    if (cred && cred.length > 20) {
      const $cred = JSON.parse(cred);
      if ($cred && $cred.token && $cred.user) {
        Store.token.next($cred.token);
        Store.user.next($cred.user);
      }
    }
    return true;
  });
}

export function cacheCredentials(api) {
  AsyncStorage.setItem('app_credentials', JSON.stringify(api)).then(() => {});
}

function storeFav(fav) {
  Promise.resolve(AsyncStorage.setItem('fav', JSON.stringify(fav)));
}

export function AddToFav(yacht) {
  const fav = [...Store.favoriteList.value, yacht];
  Store.favoriteList.next(fav);
  storeFav(fav);
}

export function RemoveFromFav(id) {
  const fav = Store.favoriteList.value.filter(item => item.id !== id);
  Store.favoriteList.next(fav);
  storeFav(fav);
}

export function IsInFavorite(id) {
  return !!Store.favoriteList.value.find(yacht => yacht.id === id);
}

export async function RestoreFav() {
  try {
    const fav = JSON.parse(await AsyncStorage.getItem('fav'));
    if (fav && fav.length) {
      Store.favoriteList.next(fav);
    }
  } catch (error) {
    // @intentional
  }
}

function saveLocalisation(loc) {
  Promise.resolve(AsyncStorage.setItem('localisation', JSON.stringify(loc)));
}

export function changeLanguage(lang = 'en') {
  const loc = {...Store.localisation.value, lang};
  Store.localisation.next(loc);
  saveLocalisation(loc);
}
export function changeCurrency(currency = 'pln') {
  const loc = {...Store.localisation.value, currency};
  Store.localisation.next(loc);
  saveLocalisation(loc);
}

export async function reloadLocalisation() {
  try {
    const data = JSON.parse(await AsyncStorage.getItem('localisation'));
    if (data) {
      Store.localisation.next(data);
    }
  } catch (error) {
    // @intentional
  }
}

export function LoadLatestFilters() {
  return AsyncStorage.getItem('latestFilters').then(data => {
    if (data && data.length > 5) {
      const $data = JSON.parse(data);
      if ($data) {
        Store.currentFilter.next($data);
      }
      return $data;
    }
    return false;
  });
}

export const ScreenInfo = new BehaviorSubject({cols: 2});

export function calculateScreen() {
  const {width, height} = Dimensions.get('window');
  const isPortrait = width < height;
  const numColumns = isPortrait ? 1 : 2;
  const data = {isPortrait, numColumns, screen_width: width};
  ScreenInfo.next(data);
}

Dimensions.addEventListener('change', calculateScreen);

calculateScreen();
