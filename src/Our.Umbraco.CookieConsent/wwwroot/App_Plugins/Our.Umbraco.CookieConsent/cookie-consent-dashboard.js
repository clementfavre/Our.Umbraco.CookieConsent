import { css, html, nothing, repeat, unsafeHTML } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
// Imported for their side effect: they register umb-property-layout, umb-body-layout and umb-code-block
import '@umbraco-cms/backoffice/property';
import '@umbraco-cms/backoffice/components';

const API_PATH = '/umbraco/management/api/v1/cookie-consent';

// The settings expose raw category keys, the dashboard shows editor-facing wording
const CATEGORIES = {
    necessary: {
        nameKey: 'cookieConsent_categoryNecessary',
        descriptionKey: 'cookieConsent_categoryNecessaryDescription',
    },
    functionality: {
        nameKey: 'cookieConsent_categoryFunctionality',
        descriptionKey: 'cookieConsent_categoryFunctionalityDescription',
    },
    analytics: {
        nameKey: 'cookieConsent_categoryAnalytics',
        descriptionKey: 'cookieConsent_categoryAnalyticsDescription',
    },
    marketing: {
        nameKey: 'cookieConsent_categoryMarketing',
        descriptionKey: 'cookieConsent_categoryMarketingDescription',
    },
};

// Reuses the category wording, so a script's trigger reads like the banner category
const SCRIPT_TYPES = [
    { value: 'Necessary', labelKey: 'cookieConsent_categoryNecessary' },
    { value: 'Functionality', labelKey: 'cookieConsent_categoryFunctionality' },
    { value: 'Analytics', labelKey: 'cookieConsent_categoryAnalytics' },
    { value: 'Marketing', labelKey: 'cookieConsent_categoryMarketing' },
];

const CONSENT_MODAL_LAYOUTS = [
    { value: 'Box', labelKey: 'cookieConsent_layoutBox' },
    { value: 'BoxInline', labelKey: 'cookieConsent_layoutBoxInline' },
    { value: 'BoxWide', labelKey: 'cookieConsent_layoutBoxWide' },
    { value: 'Cloud', labelKey: 'cookieConsent_layoutCloud' },
    { value: 'CloudInline', labelKey: 'cookieConsent_layoutCloudInline' },
    { value: 'Bar', labelKey: 'cookieConsent_layoutBar' },
    { value: 'BarInline', labelKey: 'cookieConsent_layoutBarInline' },
];

const PREFERENCES_MODAL_LAYOUTS = [
    { value: 'Box', labelKey: 'cookieConsent_layoutBox' },
    { value: 'Bar', labelKey: 'cookieConsent_layoutBar' },
    { value: 'BarWide', labelKey: 'cookieConsent_layoutBarWide' },
];

const CONSENT_MODAL_POSITIONS = [
    { value: 'TopLeft', labelKey: 'cookieConsent_positionTopLeft' },
    { value: 'TopCenter', labelKey: 'cookieConsent_positionTopCenter' },
    { value: 'TopRight', labelKey: 'cookieConsent_positionTopRight' },
    { value: 'MiddleLeft', labelKey: 'cookieConsent_positionMiddleLeft' },
    { value: 'MiddleCenter', labelKey: 'cookieConsent_positionMiddleCenter' },
    { value: 'MiddleRight', labelKey: 'cookieConsent_positionMiddleRight' },
    { value: 'BottomLeft', labelKey: 'cookieConsent_positionBottomLeft' },
    { value: 'BottomCenter', labelKey: 'cookieConsent_positionBottomCenter' },
    { value: 'BottomRight', labelKey: 'cookieConsent_positionBottomRight' },
];

const PREFERENCES_MODAL_POSITIONS = [
    { value: 'Left', labelKey: 'cookieConsent_positionLeft' },
    { value: 'Right', labelKey: 'cookieConsent_positionRight' },
];

const THEMES = [
    { value: 'light', labelKey: 'cookieConsent_themeLight' },
    { value: 'dark', labelKey: 'cookieConsent_themeDark' },
];

// value is the contract shared with BuiltInScriptProviders.cs
const BUILT_IN_PROVIDERS = [
    {
        value: 'GoogleAnalytics',
        labelKey: 'cookieConsent_providerGoogleAnalytics',
        idLabelKey: 'cookieConsent_measurementId',
        placeholder: 'G-XXXXXXXXXX',
        noteKey: '',
    },
    {
        value: 'GoogleTagManager',
        labelKey: 'cookieConsent_providerGoogleTagManager',
        idLabelKey: 'cookieConsent_containerId',
        placeholder: 'GTM-XXXXXXX',
        noteKey: 'cookieConsent_providerGtmNote',
    },
    {
        value: 'FacebookPixel',
        labelKey: 'cookieConsent_providerFacebookPixel',
        idLabelKey: 'cookieConsent_pixelId',
        placeholder: 'XXXXXXXXXXXXXXX',
        noteKey: 'cookieConsent_providerFbNote',
    },
];

export class CookieConsentDashboardElement extends UmbLitElement {
    static properties = {
        _settings: { state: true },
        _loading: { state: true },
        _saveState: { state: true },
    };

    #notificationContext;

    constructor() {
        super();

        this._settings = undefined;
        this._loading = true;
        this._saveState = undefined;

        this.consumeContext(UMB_NOTIFICATION_CONTEXT, (context) => {
            this.#notificationContext = context;
        });

        // Loaded here rather than on connect, so switching dashboards does not throw away unsaved edits
        this.#loadSettings();
    }

    async #request(path, method = 'GET', body) {
        const authContext = await this.getContext(UMB_AUTH_CONTEXT);
        const config = authContext.getOpenApiConfiguration();

        const response = await fetch(`${config.base}${API_PATH}${path}`, {
            method,
            credentials: config.credentials,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await config.token()}`,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`${method} ${path} failed with ${response.status}`);

        // Saving answers with an empty body, so only parse when there is something to read
        const text = await response.text();
        return text ? JSON.parse(text) : undefined;
    }

    #notify(type, headlineKey, messageKey) {
        this.#notificationContext?.peek(type, {
            data: { headline: this.localize.term(headlineKey), message: this.localize.term(messageKey) },
        });
    }

    async #loadSettings() {
        this._loading = true;
        try {
            this.#applySettings(await this.#request('/settings'));
        } catch {
            this.#notify('danger', 'cookieConsent_error', 'cookieConsent_loadFailed');
        } finally {
            this._loading = false;
        }
    }

    async #saveSettings() {
        this._saveState = 'waiting';
        try {
            await this.#request('/settings', 'POST', this._settings);
            this._saveState = 'success';
            this.#notify('positive', 'cookieConsent_success', 'cookieConsent_saveSucceeded');
        } catch {
            this._saveState = 'failed';
            this.#notify('danger', 'cookieConsent_error', 'cookieConsent_saveFailed');
        }
    }

    async #resetSettings() {
        this._loading = true;
        try {
            this.#applySettings(await this.#request('/settings/reset', 'POST'));
            this.#notify('positive', 'cookieConsent_success', 'cookieConsent_resetSucceeded');
        } catch {
            this.#notify('danger', 'cookieConsent_error', 'cookieConsent_resetFailed');
        } finally {
            this._loading = false;
        }
    }

    #applySettings(settings) {
        if (!settings) return;

        settings.customScripts = settings.customScripts ?? [];
        settings.builtInScripts = settings.builtInScripts ?? [];
        this._settings = settings;
    }

    // Lit only re-renders on an identity change, so every edit swaps the settings object
    #update(mutate) {
        const settings = structuredClone(this._settings);
        mutate(settings);
        this._settings = settings;
        this._saveState = undefined;
    }

    #toggleEnabled(key) {
        this.#update((settings) => {
            const category = settings.applicableCategories[key];
            // A category visitors cannot refuse has to stay in the banner
            if (category.readOnly) return;
            category.enabled = !category.enabled;
        });
    }

    #toggleReadOnly(key) {
        this.#update((settings) => {
            const category = settings.applicableCategories[key];
            category.readOnly = !category.readOnly;
            if (category.readOnly) category.enabled = true;
        });
    }

    render() {
        return html`
            <umb-body-layout headline=${this.localize.term('cookieConsent_headline')} .loading=${this._loading}>
                ${this._settings ? this.#renderSettings() : nothing}
                <div slot="actions">
                    <uui-button
                        look="secondary"
                        label=${this.localize.term('cookieConsent_resetToDefaults')}
                        ?disabled=${this._loading}
                        @click=${this.#resetSettings}></uui-button>
                    <uui-button
                        look="primary"
                        color="positive"
                        label=${this.localize.term('cookieConsent_save')}
                        .state=${this._saveState}
                        ?disabled=${this._loading}
                        @click=${this.#saveSettings}></uui-button>
                </div>
            </umb-body-layout>
        `;
    }

    #renderSettings() {
        return html`
            ${this.#renderCategories()} ${this.#renderLanguage()} ${this.#renderAppearance()}
            ${this.#renderBuiltInScripts()} ${this.#renderCustomScripts()}
        `;
    }

    #renderCategories() {
        const categories = Object.keys(this._settings.applicableCategories ?? {});

        return html`
            <uui-box headline=${this.localize.term('cookieConsent_categoriesTitle')}>
                <p class="box-description">${this.localize.term('cookieConsent_categoriesDescription')}</p>
                ${repeat(
                    categories,
                    (key) => key,
                    (key) => {
                        const category = this._settings.applicableCategories[key];
                        const labels = CATEGORIES[key.toLowerCase()];

                        return html`
                            <umb-property-layout
                                label=${labels ? this.localize.term(labels.nameKey) : key}
                                description=${labels ? this.localize.term(labels.descriptionKey) : ''}>
                                <div slot="editor" class="toggles">
                                    <uui-toggle
                                        label=${category.enabled
                                            ? this.localize.term('cookieConsent_shownInBanner')
                                            : this.localize.term('cookieConsent_hidden')}
                                        .checked=${category.enabled}
                                        ?disabled=${category.readOnly}
                                        @change=${() => this.#toggleEnabled(key)}></uui-toggle>
                                    <uui-toggle
                                        label=${category.readOnly
                                            ? this.localize.term('cookieConsent_alwaysOn')
                                            : this.localize.term('cookieConsent_visitorsDecide')}
                                        .checked=${category.readOnly}
                                        @change=${() => this.#toggleReadOnly(key)}></uui-toggle>
                                </div>
                            </umb-property-layout>
                        `;
                    },
                )}
            </uui-box>
        `;
    }

    #renderLanguage() {
        const languages = (this._settings.availableLanguages ?? []).map((language) => ({
            value: language.value,
            name: language.displayName,
        }));

        return html`
            <uui-box headline=${this.localize.term('cookieConsent_languageTitle')}>
                <p class="box-description">${this.localize.term('cookieConsent_languageDescription')}</p>
                <umb-property-layout
                    label=${this.localize.term('cookieConsent_fallbackLanguage')}
                    description=${this.localize.term('cookieConsent_fallbackLanguageDescription')}>
                    <div slot="editor">
                        ${this.#renderSelect(
                            this.localize.term('cookieConsent_fallbackLanguage'),
                            languages,
                            this._settings.languageOptions?.defaultLanguage,
                            (value) => this.#update((settings) => (settings.languageOptions.defaultLanguage = value)),
                        )}
                    </div>
                </umb-property-layout>
                <p class="hint">${unsafeHTML(this.localize.term('cookieConsent_languageHint'))}</p>
            </uui-box>
        `;
    }

    #renderAppearance() {
        const gui = this._settings.guiOptions ?? {};
        const misc = this._settings.miscOptions ?? {};

        return html`
            <uui-box headline=${this.localize.term('cookieConsent_appearanceTitle')}>
                <p class="box-description">${this.localize.term('cookieConsent_appearanceDescription')}</p>

                <umb-property-layout
                    label=${this.localize.term('cookieConsent_bannerLayout')}
                    description=${this.localize.term('cookieConsent_bannerLayoutDescription')}>
                    <div slot="editor">
                        ${this.#renderSelect(
                            this.localize.term('cookieConsent_bannerLayout'),
                            this.#options(CONSENT_MODAL_LAYOUTS),
                            gui.consentModalLayout,
                            (value) => this.#update((settings) => (settings.guiOptions.consentModalLayout = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout label=${this.localize.term('cookieConsent_bannerPosition')}>
                    <div slot="editor">
                        ${this.#renderSelect(
                            this.localize.term('cookieConsent_bannerPosition'),
                            this.#options(CONSENT_MODAL_POSITIONS),
                            gui.consentModalPosition,
                            (value) => this.#update((settings) => (settings.guiOptions.consentModalPosition = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout
                    label=${this.localize.term('cookieConsent_preferencesLayout')}
                    description=${this.localize.term('cookieConsent_preferencesLayoutDescription')}>
                    <div slot="editor">
                        ${this.#renderSelect(
                            this.localize.term('cookieConsent_preferencesLayout'),
                            this.#options(PREFERENCES_MODAL_LAYOUTS),
                            gui.preferencesModalLayout,
                            (value) => this.#update((settings) => (settings.guiOptions.preferencesModalLayout = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout label=${this.localize.term('cookieConsent_preferencesPosition')}>
                    <div slot="editor">
                        ${this.#renderSelect(
                            this.localize.term('cookieConsent_preferencesPosition'),
                            this.#options(PREFERENCES_MODAL_POSITIONS),
                            gui.preferencesModalPosition,
                            (value) => this.#update((settings) => (settings.guiOptions.preferencesModalPosition = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout label=${this.localize.term('cookieConsent_theme')}>
                    <div slot="editor">
                        ${this.#renderSelect(
                            this.localize.term('cookieConsent_theme'),
                            this.#options(THEMES),
                            this._settings.theme,
                            (value) => this.#update((settings) => (settings.theme = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout
                    label=${this.localize.term('cookieConsent_followDarkMode')}
                    description=${this.localize.term('cookieConsent_followDarkModeDescription')}>
                    <uui-toggle
                        slot="editor"
                        aria-label=${this.localize.term('cookieConsent_followDarkMode')}
                        .checked=${!!misc.enableDarkMode}
                        @change=${() =>
                            this.#update(
                                (settings) => (settings.miscOptions.enableDarkMode = !settings.miscOptions.enableDarkMode),
                            )}></uui-toggle>
                </umb-property-layout>

                <umb-property-layout
                    label=${this.localize.term('cookieConsent_disableTransitions')}
                    description=${this.localize.term('cookieConsent_disableTransitionsDescription')}>
                    <uui-toggle
                        slot="editor"
                        aria-label=${this.localize.term('cookieConsent_disableTransitions')}
                        .checked=${!!misc.disableTransitions}
                        @change=${() =>
                            this.#update(
                                (settings) =>
                                    (settings.miscOptions.disableTransitions = !settings.miscOptions.disableTransitions),
                            )}></uui-toggle>
                </umb-property-layout>

                <umb-property-layout
                    label=${this.localize.term('cookieConsent_disablePageInteraction')}
                    description=${this.localize.term('cookieConsent_disablePageInteractionDescription')}>
                    <uui-toggle
                        slot="editor"
                        aria-label=${this.localize.term('cookieConsent_disablePageInteraction')}
                        .checked=${!!misc.disablePageInteraction}
                        @change=${() =>
                            this.#update(
                                (settings) =>
                                    (settings.miscOptions.disablePageInteraction =
                                        !settings.miscOptions.disablePageInteraction),
                            )}></uui-toggle>
                </umb-property-layout>
            </uui-box>
        `;
    }

    #renderBuiltInScripts() {
        const scripts = this._settings.builtInScripts ?? [];

        return html`
            <uui-box headline=${this.localize.term('cookieConsent_builtInScriptsTitle')}>
                <p class="box-description">${this.localize.term('cookieConsent_builtInScriptsDescription')}</p>

                ${repeat(
                    scripts,
                    (_, index) => index,
                    (script, index) => {
                        const provider = this.#builtInProvider(script.provider);
                        const idLabel = this.localize.term(provider.idLabelKey);

                        return html`
                            <div class="item">
                                <umb-property-layout label=${this.localize.term('cookieConsent_provider')}>
                                    <div slot="editor">
                                        ${this.#renderSelect(
                                            this.localize.term('cookieConsent_provider'),
                                            this.#options(BUILT_IN_PROVIDERS),
                                            script.provider,
                                            (value) => this.#update((settings) => (settings.builtInScripts[index].provider = value)),
                                        )}
                                    </div>
                                </umb-property-layout>

                                <umb-property-layout label=${idLabel}>
                                    <uui-input
                                        slot="editor"
                                        label=${idLabel}
                                        placeholder=${provider.placeholder}
                                        .value=${script.id ?? ''}
                                        @change=${(event) =>
                                            this.#update(
                                                (settings) => (settings.builtInScripts[index].id = event.target.value),
                                            )}></uui-input>
                                </umb-property-layout>

                                ${provider.noteKey
                                    ? html`<p class="hint">${unsafeHTML(this.localize.term(provider.noteKey))}</p>`
                                    : nothing}

                                <uui-button
                                    look="secondary"
                                    color="danger"
                                    label=${this.localize.term('cookieConsent_remove')}
                                    @click=${() =>
                                        this.#update((settings) => settings.builtInScripts.splice(index, 1))}></uui-button>
                            </div>
                        `;
                    },
                )}
                ${scripts.length
                    ? nothing
                    : html`<p class="empty">${this.localize.term('cookieConsent_noBuiltInScript')}</p>`}

                <uui-button
                    look="primary"
                    label=${this.localize.term('cookieConsent_addBuiltInScript')}
                    @click=${() =>
                        this.#update((settings) =>
                            settings.builtInScripts.push({ provider: 'GoogleAnalytics', id: '' }),
                        )}></uui-button>
            </uui-box>
        `;
    }

    #renderCustomScripts() {
        const scripts = this._settings.customScripts ?? [];

        return html`
            <uui-box headline=${this.localize.term('cookieConsent_customScriptsTitle')}>
                <p class="box-description">${this.localize.term('cookieConsent_customScriptsDescription')}</p>
                <p class="hint">${unsafeHTML(this.localize.term('cookieConsent_customScriptsHint'))}</p>
                <umb-code-block language="JavaScript"
                    >var s = document.createElement('script');
s.src = 'https://example.com/tag.js';
s.async = true;
document.head.appendChild(s);</umb-code-block
                >

                ${repeat(
                    scripts,
                    (_, index) => index,
                    (script, index) => html`
                        <div class="item">
                            <umb-property-layout label=${this.localize.term('cookieConsent_runsAfterAccept')}>
                                <div slot="editor">
                                    ${this.#renderSelect(
                                        this.localize.term('cookieConsent_runsAfterAccept'),
                                        this.#options(SCRIPT_TYPES),
                                        script.type,
                                        (value) => this.#update((settings) => (settings.customScripts[index].type = value)),
                                    )}
                                </div>
                            </umb-property-layout>

                            <umb-property-layout label=${this.localize.term('cookieConsent_code')}>
                                <uui-textarea
                                    slot="editor"
                                    label=${this.localize.term('cookieConsent_code')}
                                    rows="10"
                                    .value=${script.code ?? ''}
                                    @change=${(event) =>
                                        this.#update(
                                            (settings) => (settings.customScripts[index].code = event.target.value),
                                        )}></uui-textarea>
                            </umb-property-layout>

                            <uui-button
                                look="secondary"
                                color="danger"
                                label=${this.localize.term('cookieConsent_remove')}
                                @click=${() =>
                                    this.#update((settings) => settings.customScripts.splice(index, 1))}></uui-button>
                        </div>
                    `,
                )}
                ${scripts.length
                    ? nothing
                    : html`<p class="empty">${this.localize.term('cookieConsent_noCustomScript')}</p>`}

                <uui-button
                    look="primary"
                    label=${this.localize.term('cookieConsent_addScript')}
                    @click=${() =>
                        this.#update((settings) => settings.customScripts.push({ type: 'Analytics', code: '' }))}></uui-button>
            </uui-box>
        `;
    }

    #builtInProvider(value) {
        return BUILT_IN_PROVIDERS.find((provider) => provider.value === value) ?? BUILT_IN_PROVIDERS[0];
    }

    // Resolves a {value, labelKey} list into the {value, name} shape the select renders
    #options(defs) {
        return defs.map((def) => ({ value: def.value, name: this.localize.term(def.labelKey) }));
    }

    #renderSelect(label, options, selected, onChange) {
        return html`
            <uui-select
                label=${label}
                .options=${options.map((option) => ({
                    name: option.name,
                    value: option.value,
                    selected: option.value === selected,
                }))}
                @change=${(event) => onChange(event.target.value)}></uui-select>
        `;
    }

    static styles = [
        UmbTextStyles,
        css`
            :host {
                display: block;
            }

            uui-box {
                margin-bottom: var(--uui-size-layout-1);
            }

            .box-description {
                margin-top: 0;
                color: var(--uui-color-text-alt);
            }

            .toggles {
                display: flex;
                flex-wrap: wrap;
                gap: var(--uui-size-space-2) var(--uui-size-layout-1);
            }

            .item {
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                padding: var(--uui-size-space-4) var(--uui-size-space-5);
                margin-bottom: var(--uui-size-space-4);
            }

            .hint {
                max-width: 65ch;
                color: var(--uui-color-text-alt);
            }

            .empty {
                color: var(--uui-color-text-alt);
                font-style: italic;
            }

            umb-code-block {
                max-width: 65ch;
                margin-bottom: var(--uui-size-layout-1);
            }

            uui-textarea,
            uui-input,
            uui-select {
                width: 100%;
            }
        `,
    ];
}

export default CookieConsentDashboardElement;

customElements.define('cookie-consent-dashboard', CookieConsentDashboardElement);
