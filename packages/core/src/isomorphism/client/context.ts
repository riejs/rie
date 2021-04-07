import { RieContext, RieCookie } from '../common/context';

function getCookie(name: string) {
  const r = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`);
  const m = window.document.cookie.match(r);
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, options = {
  domain: '',
  path: '',
  expires: null,
}) {
  let str = `${name}=${encodeURIComponent(value)};`;
  if (options?.domain) {
    str += `domain=${options.domain};`;
  }
  if (options?.path) {
    str += `path=${options.path};`;
  }
  if (options?.expires) {
    str += `expires=${options.expires.toUTCString?.()};`;
  }
  window.document.cookie = str;
};

function delCookie(name: string, options?) {
  setCookie(name, '', {
    ...options,
    expires: new Date(Date.now() - (60 * 60 * 1000)),
  });
}

function getQuery() {
  const qs = window.location.search.substring(1);
  const parts = qs.split('&');
  const query = {};
  parts.forEach((part = '') => {
    if (part) {
      const [key, value] = part.split('=');
      query[key] = decodeURIComponent(value);
    }
  });
  return query;
}

const query = getQuery();

export const getContext = function getContext(): RieContext {
  return {
    cookie: {
      get: getCookie,
      set: setCookie,
      del: delCookie,
    },
    query,
    ua: window.navigator.userAgent,
    env: 'browser',
  };
};
