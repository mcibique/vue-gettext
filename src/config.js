export default function (Vue, languageVm, autoAddKeyAttributes) {

  /*
   * Adds a `language` property to `Vue.config` and makes it reactive:
   * Vue.config.language = 'fr_FR'
  */
  Object.defineProperty(Vue.config, 'language', {
    enumerable: true,
    configurable: true,
    get: () => { return languageVm.current },
    set: (val) => { languageVm.current = val },
  })

  /*
   * Adds a `getTextPluginSilent` property to `Vue.config`.
   * Used to enable/disable some console warnings globally.
  */
  Object.defineProperty(Vue.config, 'getTextPluginSilent', {
    enumerable: true,
    configurable: true,
    get: () => { return languageVm.translationEngine.silent },
    set: (val) => {
      languageVm.translationEngine.silent = val
      languageVm.interpolationEngine.silent = val
    },
  })

  /*
   * Adds an `autoAddKeyAttributes` property to `Vue.config`.
   * Used to enable/disable the automatic addition of `key` attributes.
  */
  Object.defineProperty(Vue.config, 'autoAddKeyAttributes', {
    enumerable: true,
    writable: true,
    value: autoAddKeyAttributes,
  })

  /*
   * Adds a `getTextPluginMuteLanguages` property to `Vue.config`.
   * Used to enable/disable some console warnings for a specific set of languages.
  */
  Object.defineProperty(Vue.config, 'getTextPluginMuteLanguages', {
    enumerable: true,
    configurable: true,
    get: () => { return languageVm.translationEngine.muteLanguages },
    set: (val) => { languageVm.translationEngine.muteLanguages = val },
  })

}
