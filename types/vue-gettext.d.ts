import Vue, { ComponentOptions, VueConstructor} from 'vue';

export class TranslationEngine {
	constructor(language: string, translations: object, silent: boolean, muteLanguages: string[]);

	language: string;
	translations: object;
	silent: boolean;
	muteLanguages: string[];
}

export class InterpolationEngine {
	constructor(silent: boolean);

	silent: boolean;
}

interface IVueGettextOptions {
	availableLanguages: {
		[key: string]: string;
	};
	defaultLanguage: string;
	languageVmMixin: ComponentOptions<Vue> | typeof Vue;
	muteLanguages: string[];
	silent: boolean;
	translations: object;
	translationEngine: TranslationEngine;
	interpolationEngine: InterpolationEngine;
}

export class VueGettext {
	constructor(Vue: VueConstructor<Vue>, options?: IVueGettextOptions);
}

export function install(vue: typeof Vue): void;

declare const _default: {
	VueGettext: typeof VueGettext,
	install: typeof install,
};

export default _default;
