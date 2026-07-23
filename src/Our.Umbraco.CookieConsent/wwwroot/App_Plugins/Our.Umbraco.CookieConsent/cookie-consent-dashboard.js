import { css, html, nothing, repeat } from '@umbraco-cms/backoffice/external/lit';
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
        name: 'Strictly necessary',
        description: 'Needed for the site to work, so visitors are never asked about these.',
    },
    functionality: {
        name: 'Functionality',
        description: 'Remembers choices such as language or region.',
    },
    analytics: {
        name: 'Analytics',
        description: 'Measures how visitors browse the site.',
    },
    marketing: {
        name: 'Marketing',
        description: 'Used to show advertising based on browsing habits.',
    },
};

const SCRIPT_TYPES = ['Necessary', 'Functionality', 'Analytics', 'Marketing'];

const CONSENT_MODAL_LAYOUTS = [
    { value: 'Box', displayName: 'box' },
    { value: 'BoxInline', displayName: 'box inline' },
    { value: 'BoxWide', displayName: 'box wide' },
    { value: 'Cloud', displayName: 'cloud' },
    { value: 'CloudInline', displayName: 'cloud inline' },
    { value: 'Bar', displayName: 'bar' },
    { value: 'BarInline', displayName: 'bar inline' },
];

const PREFERENCES_MODAL_LAYOUTS = [
    { value: 'Box', displayName: 'box' },
    { value: 'Bar', displayName: 'bar' },
    { value: 'BarWide', displayName: 'bar wide' },
];

const CONSENT_MODAL_POSITIONS = [
    { value: 'TopLeft', displayName: 'top left' },
    { value: 'TopCenter', displayName: 'top center' },
    { value: 'TopRight', displayName: 'top right' },
    { value: 'MiddleLeft', displayName: 'middle left' },
    { value: 'MiddleCenter', displayName: 'middle center' },
    { value: 'MiddleRight', displayName: 'middle right' },
    { value: 'BottomLeft', displayName: 'bottom left' },
    { value: 'BottomCenter', displayName: 'bottom center' },
    { value: 'BottomRight', displayName: 'bottom right' },
];

const PREFERENCES_MODAL_POSITIONS = [
    { value: 'Left', displayName: 'left' },
    { value: 'Right', displayName: 'right' },
];

const THEMES = [
    { value: 'light', displayName: 'Light' },
    { value: 'dark', displayName: 'Dark' },
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

    #notify(type, headline, message) {
        this.#notificationContext?.peek(type, { data: { headline, message } });
    }

    async #loadSettings() {
        this._loading = true;
        try {
            this.#applySettings(await this.#request('/settings'));
        } catch {
            this.#notify('danger', 'Error', 'Failed to load settings.');
        } finally {
            this._loading = false;
        }
    }

    async #saveSettings() {
        this._saveState = 'waiting';
        try {
            await this.#request('/settings', 'POST', this._settings);
            this._saveState = 'success';
            this.#notify('positive', 'Success', 'Settings saved successfully.');
        } catch {
            this._saveState = 'failed';
            this.#notify('danger', 'Error', 'Failed to save settings.');
        }
    }

    async #resetSettings() {
        this._loading = true;
        try {
            this.#applySettings(await this.#request('/settings/reset', 'POST'));
            this.#notify('positive', 'Success', 'Settings reset to defaults.');
        } catch {
            this.#notify('danger', 'Error', 'Failed to reset settings.');
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
            <umb-body-layout headline="Cookie Consent" .loading=${this._loading}>
                ${this._settings ? this.#renderSettings() : nothing}
                <div slot="actions">
                    <uui-button
                        look="secondary"
                        label="Reset to defaults"
                        ?disabled=${this._loading}
                        @click=${this.#resetSettings}></uui-button>
                    <uui-button
                        look="primary"
                        color="positive"
                        label="Save"
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
            <uui-box headline="Cookie categories">
                <p class="box-description">
                    Pick the categories shown in the banner, and whether visitors can change them.
                </p>
                ${repeat(
                    categories,
                    (key) => key,
                    (key) => {
                        const category = this._settings.applicableCategories[key];
                        const labels = CATEGORIES[key.toLowerCase()];

                        return html`
                            <umb-property-layout
                                label=${labels?.name ?? key}
                                description=${labels?.description ?? ''}>
                                <div slot="editor" class="toggles">
                                    <uui-toggle
                                        label=${category.enabled ? 'Shown in the banner' : 'Hidden'}
                                        .checked=${category.enabled}
                                        ?disabled=${category.readOnly}
                                        @change=${() => this.#toggleEnabled(key)}></uui-toggle>
                                    <uui-toggle
                                        label=${category.readOnly
                                            ? 'Always on, visitors cannot refuse'
                                            : 'Visitors decide'}
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
            displayName: language.displayName,
        }));

        return html`
            <uui-box headline="Language">
                <p class="box-description">
                    The banner follows the visitor's language when it can be detected.
                </p>
                <umb-property-layout
                    label="Fallback language"
                    description="Used when the visitor's language is not available.">
                    <div slot="editor">
                        ${this.#renderSelect('Fallback language', languages, this._settings.languageOptions?.defaultLanguage, (value) =>
                            this.#update((settings) => (settings.languageOptions.defaultLanguage = value)),
                        )}
                    </div>
                </umb-property-layout>
                <p class="hint">
                    The choices offered here are the languages configured in Umbraco. Wording such as the banner
                    title lives in the Dictionary, under the <code>Our.Umbraco.CookieConsent</code> key.
                </p>
            </uui-box>
        `;
    }

    #renderAppearance() {
        const gui = this._settings.guiOptions ?? {};
        const misc = this._settings.miscOptions ?? {};

        return html`
            <uui-box headline="Appearance">
                <p class="box-description">Where the two dialogs sit and how they look.</p>

                <umb-property-layout label="Banner layout" description="The first dialog a visitor sees.">
                    <div slot="editor">
                        ${this.#renderSelect('Banner layout', CONSENT_MODAL_LAYOUTS, gui.consentModalLayout, (value) =>
                            this.#update((settings) => (settings.guiOptions.consentModalLayout = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout label="Banner position">
                    <div slot="editor">
                        ${this.#renderSelect('Banner position', CONSENT_MODAL_POSITIONS, gui.consentModalPosition, (value) =>
                            this.#update((settings) => (settings.guiOptions.consentModalPosition = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout
                    label="Preferences layout"
                    description="The dialog opened from Manage preferences.">
                    <div slot="editor">
                        ${this.#renderSelect('Preferences layout', PREFERENCES_MODAL_LAYOUTS, gui.preferencesModalLayout, (value) =>
                            this.#update((settings) => (settings.guiOptions.preferencesModalLayout = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout label="Preferences position">
                    <div slot="editor">
                        ${this.#renderSelect('Preferences position', PREFERENCES_MODAL_POSITIONS, gui.preferencesModalPosition, (value) =>
                            this.#update((settings) => (settings.guiOptions.preferencesModalPosition = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout label="Theme">
                    <div slot="editor">
                        ${this.#renderSelect('Theme', THEMES, this._settings.theme, (value) =>
                            this.#update((settings) => (settings.theme = value)),
                        )}
                    </div>
                </umb-property-layout>

                <umb-property-layout
                    label="Follow the visitor's dark mode"
                    description="Switches to the dark theme when the visitor's system asks for it.">
                    <uui-toggle
                        slot="editor"
                        aria-label="Follow the visitor's dark mode"
                        .checked=${!!misc.enableDarkMode}
                        @change=${() =>
                            this.#update(
                                (settings) => (settings.miscOptions.enableDarkMode = !settings.miscOptions.enableDarkMode),
                            )}></uui-toggle>
                </umb-property-layout>

                <umb-property-layout
                    label="Turn off animations"
                    description="Shows the dialogs without fading or sliding.">
                    <uui-toggle
                        slot="editor"
                        aria-label="Turn off animations"
                        .checked=${!!misc.disableTransitions}
                        @change=${() =>
                            this.#update(
                                (settings) =>
                                    (settings.miscOptions.disableTransitions = !settings.miscOptions.disableTransitions),
                            )}></uui-toggle>
                </umb-property-layout>

                <umb-property-layout
                    label="Block the page until a choice is made"
                    description="Dims the site and prevents browsing until the visitor answers.">
                    <uui-toggle
                        slot="editor"
                        aria-label="Block the page until a choice is made"
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
            <uui-box headline="Built-in scripts">
                <p class="box-description">
                    Ready-made integrations that run before consent is given. Enter the ID and the package handles
                    the rest.
                </p>

                ${repeat(
                    scripts,
                    (_, index) => index,
                    (script, index) => html`
                        <div class="item">
                            <umb-property-layout label="Provider">
                                <div slot="editor">
                                    ${this.#renderSelect(
                                        'Provider',
                                        [{ value: 'GoogleConsentMode', displayName: 'Google Consent Mode' }],
                                        script.provider,
                                        (value) => this.#update((settings) => (settings.builtInScripts[index].provider = value)),
                                    )}
                                </div>
                            </umb-property-layout>

                            <umb-property-layout label="Measurement ID">
                                <uui-input
                                    slot="editor"
                                    label="Measurement ID"
                                    placeholder="G-XXXXXXXXXX"
                                    .value=${script.id ?? ''}
                                    @change=${(event) =>
                                        this.#update(
                                            (settings) => (settings.builtInScripts[index].id = event.target.value),
                                        )}></uui-input>
                            </umb-property-layout>

                            <uui-button
                                look="secondary"
                                color="danger"
                                label="Remove"
                                @click=${() =>
                                    this.#update((settings) => settings.builtInScripts.splice(index, 1))}></uui-button>
                        </div>
                    `,
                )}
                ${scripts.length ? nothing : html`<p class="empty">No built-in script yet.</p>`}

                <uui-button
                    look="primary"
                    label="Add built-in script"
                    @click=${() =>
                        this.#update((settings) =>
                            settings.builtInScripts.push({ provider: 'GoogleConsentMode', id: '' }),
                        )}></uui-button>
            </uui-box>
        `;
    }

    #renderCustomScripts() {
        const scripts = this._settings.customScripts ?? [];

        return html`
            <uui-box headline="Custom scripts">
                <p class="box-description">
                    Your own tracking code, run only once the visitor accepts the matching category.
                </p>
                <p class="hint">
                    <strong>JavaScript only.</strong> The code runs inside a function, so a
                    <code>&lt;script&gt;</code> tag would break it. Load an external file by creating the element
                    yourself:
                </p>
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
                            <umb-property-layout label="Runs after the visitor accepts">
                                <div slot="editor">
                                    ${this.#renderSelect(
                                        'Runs after the visitor accepts',
                                        SCRIPT_TYPES.map((type) => ({ value: type, displayName: type })),
                                        script.type,
                                        (value) => this.#update((settings) => (settings.customScripts[index].type = value)),
                                    )}
                                </div>
                            </umb-property-layout>

                            <umb-property-layout label="Code">
                                <uui-textarea
                                    slot="editor"
                                    label="Code"
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
                                label="Remove"
                                @click=${() =>
                                    this.#update((settings) => settings.customScripts.splice(index, 1))}></uui-button>
                        </div>
                    `,
                )}
                ${scripts.length ? nothing : html`<p class="empty">No custom script yet.</p>`}

                <uui-button
                    look="primary"
                    label="Add script"
                    @click=${() =>
                        this.#update((settings) => settings.customScripts.push({ type: 'Analytics', code: '' }))}></uui-button>
            </uui-box>
        `;
    }

    #renderSelect(label, options, selected, onChange) {
        return html`
            <uui-select
                label=${label}
                .options=${options.map((option) => ({
                    name: option.displayName,
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
