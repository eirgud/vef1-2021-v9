/** Slóð á frétta vefþjónustu */
const NEWS_API = 'https://vef2-2021-ruv-rss-json-proxy.herokuapp.com?delay=0&error=0';

/**
 * Hlutur sem heldur utan um in-memory „cache“ af gögnum í minni á client (í vafra).
 * Nýtir það að þegar forrit er keyrt mun `fetchNews` fallið *alltaf* keyra þar sem `cache` er í
 * scope, og það verður alltaf sami hluturinn. Við getum því bætt við niðurstöðum í hlutinn með
 * vel þekktum „lykli“ (cache key), við næstu köll getum við athugað hvort hlutur innihaldi þennan
 * lykil og skilað þá þeirri niðurstöðu í stað þess að gera sama kall aftur.
 */
const cache = {};

/**
 * Sækir fréttir frá vefþjónustu. Geymir í in-memory cache gögn eftir `id`.
 * @param {string} [id=''] ID á fréttaflokk til að sækja, sjálgefið tómi (grunn) flokkurinn
 * @returns {Promise<Array<object> | null>} Promise sem verður uppfyllt með fylki af fréttum.
 *           Skilar `null` ef villa kom upp við að sækja gögn.
 */

export async function fetchNews(id = '') {
  //  athuga og stilli eftir hvaða id kemur inn
  let cacheItem = '';
  if ((id !== '')) {
    cacheItem = id;
  } else {
    cacheItem = 'home';
  }

  //  ef í cache, nota þaðan
  if (cacheItem in cache) {
    return cache[cacheItem];
  }


  try {

    const extendedURL = new URL(id, NEWS_API);
    let result = null;

    if (cacheItem !== 'home') {
      result = await fetch(extendedURL);
      if (!result.ok) {
        return null;
      }
    }

    if (cacheItem === 'home') {
      result = await fetch(NEWS_API);
      if (!result.ok) {
        return null;
      }
    }

    const json = await result.json();
    cache[cacheItem] = json;

    return cache[cacheItem];
  }

  catch (e) {
    console.warn('unable to fetch', e);
    return null;
  }
}
