import './object-assign-polyfill'

import Component from './component'
import Directive from './directive'
import config from './config'
import InterpolationEngine from './interpolate'
import override from './override'
import TranslationEngine from './translate'


let languageVm  // Singleton.

let GetTextPlugin = function (Vue, options = {}) {

  let defaultConfig = {
    autoAddKeyAttributes: false,
    availableLanguages: { en_US: 'English' },
    defaultLanguage: 'en_US',
    languageVmMixin: {},
    muteLanguages: [],
    silent: Vue.config.silent,
    translations: null,
    translationEngine: null,
    interpolationEngine: null,
  }

  Object.keys(options).forEach(key => {
    if (Object.keys(defaultConfig).indexOf(key) === -1) {
      throw new Error(`${key} is an invalid option for the translate plugin.`)
    }
  })

  if (!options.translationEngine && !options.translations) {
    throw new Error('No translations nor translation engine available.')
  }

  options = Object.assign(defaultConfig, options)

  if (!options.translationEngine) {
    options.translationEngine = new TranslationEngine(options.defaultLanguage, options.translations, options.silent, options.muteLanguages)
  }

  if (!options.interpolationEngine) {
    options.interpolationEngine = new InterpolationEngine(options.silent);
  }

  let interpolationEngine = options.interpolationEngine;
  let translationEngine = options.translationEngine

  languageVm = new Vue({
    created: function () {
      // Non-reactive data.
      this.available = options.availableLanguages
    },
    data() {
      return { translationEngine, interpolationEngine }
    },
    computed: {
      current: {
        get() {
          return this.translationEngine.language
        },
        set(value) {
          this.translationEngine.language = value
        }
      }
    },
    mixins: [options.languageVmMixin],
  })

  override(Vue, languageVm)

  config(Vue, languageVm, options.autoAddKeyAttributes)

  // Makes <translate> available as a global component.
  Vue.component('translate', Component)

  // An option to support translation with HTML content: `v-translate`.
  Vue.directive('translate', Directive)

  // Exposes global properties.
  Vue.$translations = options.translations
  // Exposes instance methods.
  Vue.prototype.$gettext = translationEngine.$gettext.bind(translationEngine)
  Vue.prototype.$pgettext = translationEngine.$pgettext.bind(translationEngine)
  Vue.prototype.$ngettext = translationEngine.$ngettext.bind(translationEngine)
  Vue.prototype.$npgettext = translationEngine.$npgettext.bind(translationEngine)
  Vue.prototype.$gettextInterpolate = interpolationEngine.$gettextInterpolate.bind(interpolationEngine)
}

export default GetTextPlugin
