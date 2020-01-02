import plurals from './plurals'

const SPACING_RE = /\s{2,}/g

export default class TranslationEngine {

  constructor (language, translations, silent, muteLanguages = []) {
    this.language = language
    this.translations = translations
    this.silent = silent
    this.muteLanguages = muteLanguages
  }

  /*
   * Get the translated string from the translation.json file generated by easygettext.
   *
   * @param {String} msgid - The translation key
   * @param {Number} n - The number to switch between singular and plural
   * @param {String} context - The translation key context
   * @param {String} defaultPlural - The default plural value (optional)
   * @param {String} language - The language ID (e.g. 'fr_FR' or 'en_US')
   *
   * @return {String} The translated string
  */
  getTranslation (msgid, n = 1, context = null, defaultPlural = null, language = null) {

    if (!msgid) {
      return ''  // Allow empty strings.
    }

    if (!language) {
      language = this.language
    }

    let silent = this.silent || (this.muteLanguages.indexOf(language) !== -1)

    // Default untranslated string, singular or plural.
    let untranslated = defaultPlural && plurals.getTranslationIndex(language, n) > 0 ? defaultPlural : msgid

    // `easygettext`'s `gettext-compile` generates a JSON version of a .po file based on its `Language` field.
    // But in this field, `ll_CC` combinations denoting a language’s main dialect are abbreviated as `ll`,
    // for example `de` is equivalent to `de_DE` (German as spoken in Germany).
    // See the `Language` section in https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html
    // So try `ll_CC` first, or the `ll` abbreviation which can be three-letter sometimes:
    // https://www.gnu.org/software/gettext/manual/html_node/Language-Codes.html#Language-Codes
    let translations = this.translations[language] || this.translations[language.split('_')[0]]

    if (!translations) {
      if (!silent) {
        console.warn(`No translations found for ${language}`)
      }
      return untranslated
    }

    // Currently easygettext trims entries since it needs to output consistent PO translation content
    // even if a web template designer added spaces between lines (which are ignored in HTML or jade,
    // but are significant in text). See #65.
    // Replicate the same behaviour here.
    msgid = msgid.trim()

    let translated = translations[msgid]

    // Sometimes `msgid` may not have the same number of spaces than its translation key.
    // This could happen because we use the private attribute `_renderChildren` to access the raw uninterpolated
    // string to translate in the `created` hook of `component.js`: spaces are not exactly the same between the
    // HTML and the content of `_renderChildren`, e.g. 6 spaces becomes 4 etc. See #15, #38.
    // In such cases, we need to compare the translation keys and `msgid` with the same number of spaces.
    if (!translated && SPACING_RE.test(msgid)) {
      Object.keys(translations).some(key => {
        if (key.replace(SPACING_RE, ' ') === msgid.replace(SPACING_RE, ' ')) {
          translated = translations[key]
          return translated
        }
      })
    }

    if (translated && context) {
      translated = translated[context]
    }

    if (!translated) {
      if (!silent) {
        let msg = `Untranslated ${language} key found: ${msgid}`
        if (context) {
          msg += ` (with context: ${context})`
        }
        console.warn(msg)
      }
      return untranslated
    }

    // Avoid a crash when a msgid exists with and without a context, see #32.
    if (!(translated instanceof Array) && translated.hasOwnProperty('')) {
      // As things currently stand, the void key means a void context for easygettext.
      translated = translated['']
    }

    if (typeof translated === 'string') {
      translated = [translated]
    }

    let translationIndex = plurals.getTranslationIndex(language, n)

    // Do not assume that the default value of n is 1 for the singular form of all languages.
    // E.g. Arabic, see #69.
    if (translated.length === 1 && n === 1) {
      translationIndex = 0
    }

    return translated[translationIndex]

  }

  /*
   * Returns a string of the translation of the message.
   * Also makes the string discoverable by gettext-extract.
   *
   * @param {String} msgid - The translation key
   *
   * @return {String} The translated string
  */
  $gettext (msgid) {
    return this.getTranslation(msgid)
  }

  /*
   * Returns a string of the translation for the given context.
   * Also makes the string discoverable by gettext-extract.
   *
   * @param {String} context - The context of the string to translate
   * @param {String} msgid - The translation key
   *
   * @return {String} The translated string
  */
  $pgettext (context, msgid) {
    return this.getTranslation(msgid, 1, context)
  }

  /*
   * Returns a string of the translation of either the singular or plural,
   * based on the number.
   * Also makes the string discoverable by gettext-extract.
   *
   * @param {String} msgid - The translation key
   * @param {String} plural - The plural form of the translation key
   * @param {Number} n - The number to switch between singular and plural
   *
   * @return {String} The translated string
  */
  $ngettext (msgid, plural, n) {
    return this.getTranslation(msgid, n, null, plural)
  }

  /*
   * Returns a string of the translation of either the singular or plural,
   * based on the number, for the given context.
   * Also makes the string discoverable by gettext-extract.
   *
   * @param {String} context - The context of the string to translate
   * @param {String} msgid - The translation key
   * @param {String} plural - The plural form of the translation key
   * @param {Number} n - The number to switch between singular and plural
   *
   * @return {String} The translated string
  */
  $npgettext (context, msgid, plural, n) {
    return this.getTranslation(msgid, n, context, plural)
  }

}
