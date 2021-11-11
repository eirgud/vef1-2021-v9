import { el, empty } from './helpers.js';
import { fetchNews } from './news.js';
/**
 * Föll sem sjá um að kalla í `fetchNews` og birta viðmót:
 * - Loading state meðan gögn eru sótt
 * - Villu state ef villa kemur upp við að sækja gögn
 * - Birta gögnin ef allt OK
 * Fyrir gögnin eru líka búnir til takkar sem leyfa að fara milli forsíðu og
 * flokks *án þess* að nota sjálfgefna <a href> virkni—við tökum yfir og sjáum
 * um sjálf með History API.
 */

/**
 * Eins og `handleCategoryClick`, nema býr til link sem fer á forsíðu.
 *
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {function} Fall sem bundið er við click event á link/takka
 */
 function handleBackClick(container, newsItemLimit) {
  return (e) => {
    e.preventDefault();

    // TODO útfæra
    window.history.replaceState(null, null, './');
    empty(container);
    fetchAndRenderLists(container, newsItemLimit);
  };
}

/**
 * Útbýr takka sem fer á forsíðu.
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {HTMLElement} Element með takka sem fer á forsíðu
 */
export function createCategoryBackLink(container, newsItemLimit) {
  // TODO útfæra
  const catBack = el('a', 'Til baka');
  catBack.setAttribute('class', 'news__link .news__links');
  catBack.addEventListener('click', handleBackClick(container, newsItemLimit));

  const catBackLink = el('p', catBack);
  return catBackLink;

}

/**
 * Sér um smell á flokk og birtir flokkinn *á sömu síðu* og við erum á.
 * Þarf að:
 * - Stoppa sjálfgefna hegðun <a href>
 * - Tæma `container` þ.a. ekki sé verið að setja efni ofan í annað efni
 * - Útbúa link sem fer til baka frá flokk á forsíðu, þess vegna þarf `newsItemLimit`
 * - Sækja og birta flokk
 * - Bæta við færslu í `history` þ.a. back takki virki
 *
 * Notum lokun þ.a. við getum útbúið föll fyrir alla flokka með einu falli. Notkun:
 * ```
 * link.addEventListener('click', handleCategoryClick(categoryId, container, newsItemLimit));
 * ```
 *
 * @param {string} id ID á flokk sem birta á eftir að smellt er
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {function} Fall sem bundið er við click event á link/takka
 */
 function handleCategoryClick(id, container, newsItemLimit) {
  return (e) => {
    e.preventDefault();

    // TODO útfæra
    window.history.pushState(null, null, `/?category=${id}`);
    empty(container);
    fetchAndRenderCategory(
      id,
      container,
      createCategoryBackLink(container, newsItemLimit),
      newsItemLimit);
  };
}

export function createCategoryLink(container, newsItemLimit, id) {
  // TODO útfæra
  const catMore = el('a', 'Sjá meira');
  catMore.setAttribute('class', 'news__link .news__links');
  catMore.setAttribute('href', `/?category=${id}`)
  catMore.addEventListener('click', handleCategoryClick(id, container, newsItemLimit));

  const catMoreLink = el('p', catMore);
  return catMoreLink;

}

/**
 * Sækir gögn fyrir flokk og birtir í DOM.
 * @param {string} id ID á category sem við erum að sækja
 * @param {HTMLElement} parent Element sem setja á flokkinn í
 * @param {HTMLELement | null} [link=null] Linkur sem á að setja eftir fréttum
 * @param {number} [limit=Infinity] Hámarks fjöldi frétta til að sýna
 */
 export async function fetchAndRenderCategory(
  id,
  parent,
  link = null,
  limit = Infinity
) {
  // Búum til <section> sem heldur utan um flokkinn
  const newSection = el('section');
  newSection.setAttribute('class', 'news');

  // Bætum við parent og þannig DOM, allar breytingar héðan í frá fara gegnum
  // container sem er tengt parent
  parent.appendChild(newSection);

  // Setjum inn loading skilaboð fyrir flokkinn
  const loadingMessage = el('p', 'Hleð inn gögnum...');
  newSection.appendChild(loadingMessage);

  // Sækjum gögn fyrir flokkinn og bíðum
  const categoryNews = await fetchNews(id);

  // Fjarlægjum loading skilaboð
  empty(newSection);

  // Ef það er linkur, bæta honum við
  newSection.appendChild(link);

  // Villuskilaboð ef villa og hættum
  if (categoryNews === null) {
    const errorMsg = el('p', 'Villa! Ekki tókst að sækja gögn...');
    newSection.appendChild(errorMsg);

    return;
  }

  // Skilaboð ef engar fréttir og hættum
  if ((categoryNews === '') || (categoryNews.items.length === 0)) {
    const errorMsg = el('p', 'Það virðist vera ekkert að frétta...');
    newSection.appendChild(errorMsg);

    return;
  }

  // Bætum við titli
  const heading = el('h1', categoryNews.title);
  heading.setAttribute('class', 'news__title');
  newSection.appendChild(heading);

  // Höfum fréttir! Ítrum og bætum við <ul>
    const nOnews = categoryNews.items.length;

    const catNewsList = el('ul')
    catNewsList.setAttribute('class', 'news__list')
    for (let i = 0; (i < nOnews) || (i < limit) ; i += 1) {
      const newsLinkWrapper = el('li');
      newsLinkWrapper.setAttribute('class', 'news__item');
      const newsLink = el('a', categoryNews.items[i].title);
      newsLink.setAttribute('href', categoryNews.items[i].link);
      newsLinkWrapper.appendChild(newsLink);
      newSection.appendChild(newsLinkWrapper);
    }
}

/**
 * Sækir grunnlista af fréttum, síðan hvern flokk fyrir sig og birtir nýjustu
 * N fréttir úr þeim flokk með `fetchAndRenderCategory()`
 * @param {HTMLElement} container Element sem mun innihalda allar fréttir
 * @param {number} newsItemLimit Hámark fjöldi frétta sem á að birta í yfirliti
 */
export async function fetchAndRenderLists(container, newsItemLimit) {
  // Byrjum á að birta loading skilaboð
  const loadingMessage = el('p', 'Hleð inn gögnum...');

  // Birtum þau beint á container
  container.appendChild(loadingMessage);

  // Sækjum yfirlit með öllum flokkum, hér þarf að hugsa um Promises!
  const listsNews = await fetchNews();

  // Fjarlægjum loading skilaboð
  empty(container);

  // Athugum hvort villa hafi komið upp => fetchNews skilaði null
  if (listsNews === null) {
    const errorMsg = el('p', 'Villa! Ekki tókst að sækja gögn...');
    container.appendChild(errorMsg);
  }
  // Athugum hvort engir fréttaflokkar => fetchNews skilaði tómu fylki
  if (listsNews.length === 0) {
    const errorMsg = el('p', 'Það virðist vera ekkert að frétta...');
    container.appendChild(errorMsg);
  }
  // Búum til <section> sem heldur utan um allt
  const mainSection = el('section');
  mainSection.setAttribute('class', 'newsList__list');

  // Höfum ekki-tómt fylki af fréttaflokkum! Ítrum í gegn og birtum
  for (let i = 0; i < listsNews.length; i += 1){
    const catId = listsNews[i].id
    const sectionID = catId.substring(0, 3);
    const contentSection = el('section',);
    contentSection.setAttribute('class', 'newsList__item');
    contentSection.setAttribute('id', sectionID);
    container.appendChild(contentSection);
    const thisSection = document.getElementById(sectionID);
    const link = createCategoryLink(thisSection, newsItemLimit, catId);
    thisSection.appendChild(link);
    fetchAndRenderCategory(catId, thisSection, null, newsItemLimit);
  }

  // Þegar það er smellt á flokka link, þá sjáum við um að birta fréttirnar, ekki default virknin
}




