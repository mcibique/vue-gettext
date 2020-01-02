import translations from './json/translate.json'
import TranslationEngine from '../../src/translate'

describe('Translate tests', () => {

  let translationEngine

  beforeEach(function () {
    let defaultLanguage = 'en_US'
    let silent = false
    let muteLanguages = []

    translationEngine = new TranslationEngine(defaultLanguage, translations, silent, muteLanguages)
  })

  it('tests the getTranslation() method', () => {

    let translated = translationEngine.getTranslation('', 1, null, 'fr_FR')
    expect(translated).to.equal('')

    translated = translationEngine.getTranslation('Unexisting language', null, null, null, 'be_FR')
    expect(translated).to.equal('Unexisting language')

    translated = translationEngine.getTranslation('Untranslated key', null, null, null, 'fr_FR')
    expect(translated).to.equal('Untranslated key')

    translated = translationEngine.getTranslation('Pending', 1, null, null, 'fr_FR')
    expect(translated).to.equal('En cours')

    translated = translationEngine.getTranslation('%{ carCount } car', 2, null, null, 'fr_FR')
    expect(translated).to.equal('%{ carCount } véhicules')

    translated = translationEngine.getTranslation('Answer', 1, 'Verb', null, 'fr_FR')
    expect(translated).to.equal('Réponse (verbe)')

    translated = translationEngine.getTranslation('Answer', 1, 'Noun', null, 'fr_FR')
    expect(translated).to.equal('Réponse (nom)')

    translated = translationEngine.getTranslation('Pending', 1, null, null, 'en_US')
    expect(translated).to.equal('Pending')

    // If no translation exists, display the default singular form (if n < 2).
    translated = translationEngine.getTranslation('Untranslated %{ n } item', 0, null, 'Untranslated %{ n } items', 'fr_FR')
    expect(translated).to.equal('Untranslated %{ n } item')

    // If no translation exists, display the default plural form (if n > 1).
    translated = translationEngine.getTranslation('Untranslated %{ n } item', 10, null, 'Untranslated %{ n } items', 'fr_FR')
    expect(translated).to.equal('Untranslated %{ n } items')

    // Test that it works when a msgid exists with and without a context, see #32.
    translated = translationEngine.getTranslation('Object', null, null, null, 'fr_FR')
    expect(translated).to.equal('Objet')
    translated = translationEngine.getTranslation('Object', null, 'Context', null, 'fr_FR')
    expect(translated).to.equal('Objet avec contexte')

    // Ensure that pluralization is right in English when there are no English translations.
    translated = translationEngine.getTranslation('Untranslated %{ n } item', 0, null, 'Untranslated %{ n } items', 'en_US')
    expect(translated).to.equal('Untranslated %{ n } items')
    translated = translationEngine.getTranslation('Untranslated %{ n } item', 1, null, 'Untranslated %{ n } items', 'en_US')
    expect(translated).to.equal('Untranslated %{ n } item')
    translated = translationEngine.getTranslation('Untranslated %{ n } item', 2, null, 'Untranslated %{ n } items', 'en_US')
    expect(translated).to.equal('Untranslated %{ n } items')

    // Test plural message with multiple contexts (default context and 'Context'')
    translated = translationEngine.getTranslation('%{ carCount } car (multiple contexts)', 1, null, null, 'en_US')
    expect(translated).to.equal('1 car')
    translated = translationEngine.getTranslation('%{ carCount } car (multiple contexts)', 2, null, null, 'en_US')
    expect(translated).to.equal('%{ carCount } cars')
    translated = translationEngine.getTranslation('%{ carCount } car (multiple contexts)', 1, 'Context', null, 'en_US')
    expect(translated).to.equal('1 car with context')
    translated = translationEngine.getTranslation('%{ carCount } car (multiple contexts)', 2, 'Context', null, 'en_US')
    expect(translated).to.equal('%{ carCount } cars with context')

  })

  it('tests the gettext() method', () => {

    let undetectableGettext = translationEngine.$gettext.bind(translationEngine)  // Hide from gettext-extract.

    translationEngine.language = 'fr_FR'
    expect(undetectableGettext('Pending')).to.equal('En cours')

    translationEngine.language = 'en_US'
    expect(undetectableGettext('Pending')).to.equal('Pending')

  })

  it('tests the pgettext() method', () => {

    let undetectablePgettext = translationEngine.$pgettext.bind(translationEngine)  // Hide from gettext-extract.

    translationEngine.language = 'fr_FR'
    expect(undetectablePgettext('Noun', 'Answer')).to.equal('Réponse (nom)')

    translationEngine.language = 'en_US'
    expect(undetectablePgettext('Noun', 'Answer')).to.equal('Answer (noun)')

  })

  it('tests the ngettext() method', () => {

    let undetectableNgettext = translationEngine.$ngettext.bind(translationEngine)  // Hide from gettext-extract.

    translationEngine.language = 'fr_FR'
    expect(undetectableNgettext('%{ carCount } car', '%{ carCount } cars', 2)).to.equal('%{ carCount } véhicules')

    translationEngine.language = 'en_US'
    expect(undetectableNgettext('%{ carCount } car', '%{ carCount } cars', 2)).to.equal('%{ carCount } cars')

    // If no translation exists, display the default singular form (if n < 2).
    translationEngine.language = 'fr_FR'
    expect(undetectableNgettext('Untranslated %{ n } item', 'Untranslated %{ n } items', -1))
      .to.equal('Untranslated %{ n } item')

    // If no translation exists, display the default plural form (if n > 1).
    translationEngine.language = 'fr_FR'
    expect(undetectableNgettext('Untranslated %{ n } item', 'Untranslated %{ n } items', 2))
      .to.equal('Untranslated %{ n } items')

  })

  it('tests the npgettext() method', () => {

    let undetectableNpgettext = translationEngine.$npgettext.bind(translationEngine)  // Hide from gettext-extract

    translationEngine.language = 'fr_FR'
    expect(undetectableNpgettext('Noun', '%{ carCount } car (noun)', '%{ carCount } cars (noun)', 2))
      .to.equal('%{ carCount } véhicules (nom)')

    translationEngine.language = 'en_US'
    expect(undetectableNpgettext('Verb', '%{ carCount } car (verb)', '%{ carCount } cars (verb)', 2))
      .to.equal('%{ carCount } cars (verb)')

    translationEngine.language = 'fr_FR'
    expect(undetectableNpgettext('Noun', '%{ carCount } car (noun)', '%{ carCount } cars (noun)', 1))
      .to.equal('%{ carCount } véhicule (nom)')

    translationEngine.language = 'en_US'
    expect(undetectableNpgettext('Verb', '%{ carCount } car (verb)', '%{ carCount } cars (verb)', 1))
      .to.equal('%{ carCount } car (verb)')

    // If no translation exists, display the default singular form (if n < 2).
    translationEngine.language = 'fr_FR'
    expect(undetectableNpgettext('Noun', 'Untranslated %{ n } item (noun)', 'Untranslated %{ n } items (noun)', 1))
      .to.equal('Untranslated %{ n } item (noun)')

    // If no translation exists, display the default plural form (if n > 1).
    translationEngine.language = 'fr_FR'
    expect(undetectableNpgettext('Noun', 'Untranslated %{ n } item (noun)', 'Untranslated %{ n } items (noun)', 2))
      .to.equal('Untranslated %{ n } items (noun)')

  })

  it('works when a msgid exists with and without a context, but the one with the context has not been translated', () => {

    expect(translationEngine.silent).to.equal(false)
    console.warn = sinon.spy(console, 'warn')

    let translated = translationEngine.getTranslation('May', null, null, null, 'fr_FR')
    expect(translated).to.equal('Pourrait')

    translated = translationEngine.getTranslation('May', null, 'Month name', null, 'fr_FR')
    expect(translated).to.equal('May')

    expect(console.warn).calledOnce
    expect(console.warn).calledWith('Untranslated fr_FR key found: May (with context: Month name)')

    console.warn.restore()

  })

})
