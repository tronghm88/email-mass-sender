// dataProvider.ts
import { fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const apiUrl = 'http://localhost:3000/api';

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  const auth = localStorage.getItem('auth');
  if (auth) {
    const { accessToken } = JSON.parse(auth);
    (options.headers as Headers).set('Authorization', `Bearer ${accessToken}`);
  }

  return fetchUtils.fetchJson(url, options);
};

export const dataProvider = simpleRestProvider(apiUrl, httpClient);
