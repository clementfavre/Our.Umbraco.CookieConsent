(function () {
    "use strict";

    // Umbraco 13 has no localize filter, so every key is resolved up front and read from vm.t
    var TEXT_KEYS = [
        "categoriesTitle", "categoriesDescription",
        "categoryNecessary", "categoryNecessaryDescription",
        "categoryFunctionality", "categoryFunctionalityDescription",
        "categoryAnalytics", "categoryAnalyticsDescription",
        "categoryMarketing", "categoryMarketingDescription",
        "shownInBanner", "hidden", "alwaysOn", "visitorsDecide",
        "categoryStateHidden", "categoryStateOptional", "categoryStateAlways",
        "marketingRequired", "marketingActive",
        "previewHeading", "previewOpenTab", "previewTabOpenHint",
        "previewTitle", "previewDescription", "previewAcceptAll", "previewRejectAll", "previewManage",
        "languageTitle", "languageDescription", "fallbackLanguage", "fallbackLanguageDescription", "languageHint",
        "appearanceTitle", "appearanceDescription",
        "bannerLayout", "bannerLayoutDescription", "bannerPosition",
        "preferencesLayout", "preferencesLayoutDescription", "preferencesPosition",
        "theme", "themeLight", "themeDark",
        "followDarkMode", "followDarkModeDescription",
        "disableTransitions", "disableTransitionsDescription",
        "disablePageInteraction", "disablePageInteractionDescription",
        "complianceTitle", "complianceDescription",
        "consentMode", "consentModeDescription", "modeOptIn", "modeOptOut",
        "revision", "revisionDescription",
        "autoShow", "autoShowDescription",
        "hideFromBots", "hideFromBotsDescription",
        "layoutBox", "layoutBoxInline", "layoutBoxWide", "layoutCloud", "layoutCloudInline",
        "layoutBar", "layoutBarInline", "layoutBarWide",
        "positionTopLeft", "positionTopCenter", "positionTopRight",
        "positionMiddleLeft", "positionMiddleCenter", "positionMiddleRight",
        "positionBottomLeft", "positionBottomCenter", "positionBottomRight",
        "positionLeft", "positionRight",
        "builtInScriptsTitle", "builtInScriptsDescription", "provider",
        "providerGoogleAnalytics", "providerGoogleTagManager", "providerFacebookPixel",
        "providerGtmNote", "providerFbNote",
        "measurementId", "containerId", "pixelId", "noBuiltInScript", "addBuiltInScript",
        "customScriptsTitle", "customScriptsDescription", "customScriptsHint",
        "runsAfterAccept", "code", "noCustomScript", "addScript",
        "remove", "resetToDefaults", "save",
        "error", "success", "loadFailed", "saveSucceeded", "saveFailed", "resetSucceeded", "resetFailed"
    ];

    function controller($http, notificationsService, localizationService, overlayService, $scope, $timeout, $interval) {
        var vm = this;

        vm.loading = true;
        vm.t = {};
        vm.previewTabOpen = false;

        // The settings expose raw category keys, the dashboard shows editor-facing wording
        vm.categoryTextKeys = {
            necessary: "categoryNecessary",
            functionality: "categoryFunctionality",
            analytics: "categoryAnalytics",
            marketing: "categoryMarketing"
        };

        vm.scriptTypes = [
            { value: "Necessary", textKey: "categoryNecessary" },
            { value: "Functionality", textKey: "categoryFunctionality" },
            { value: "Analytics", textKey: "categoryAnalytics" },
            { value: "Marketing", textKey: "categoryMarketing" }
        ];

        vm.categoryLabel = function (key) {
            var textKey = vm.categoryTextKeys[String(key).toLowerCase()];
            return textKey ? vm.t[textKey] : key;
        };

        vm.categoryDescription = function (key) {
            var textKey = vm.categoryTextKeys[String(key).toLowerCase()];
            return textKey ? vm.t[textKey + "Description"] : "";
        };

        vm.text = function (textKey) {
            return vm.t[textKey];
        };

        // value is the enum name the API expects, textKey is only what the editor reads.
        // The raw Orestbida value is resolved server-side from the enum's Display attribute
        vm.enums = {
            consentModalLayouts: [
                { value: 'Box', textKey: 'layoutBox' },
                { value: 'BoxInline', textKey: 'layoutBoxInline' },
                { value: 'BoxWide', textKey: 'layoutBoxWide' },
                { value: 'Cloud', textKey: 'layoutCloud' },
                { value: 'CloudInline', textKey: 'layoutCloudInline' },
                { value: 'Bar', textKey: 'layoutBar' },
                { value: 'BarInline', textKey: 'layoutBarInline' }
            ],
            preferencesModalLayouts: [
                { value: 'Box', textKey: 'layoutBox' },
                { value: 'Bar', textKey: 'layoutBar' },
                { value: 'BarWide', textKey: 'layoutBarWide' }
            ],
            consentModalPositions: [
                { value: 'TopLeft', textKey: 'positionTopLeft' },
                { value: 'TopCenter', textKey: 'positionTopCenter' },
                { value: 'TopRight', textKey: 'positionTopRight' },
                { value: 'MiddleLeft', textKey: 'positionMiddleLeft' },
                { value: 'MiddleCenter', textKey: 'positionMiddleCenter' },
                { value: 'MiddleRight', textKey: 'positionMiddleRight' },
                { value: 'BottomLeft', textKey: 'positionBottomLeft' },
                { value: 'BottomCenter', textKey: 'positionBottomCenter' },
                { value: 'BottomRight', textKey: 'positionBottomRight' }
            ],
            preferencesModalPositions: [
                { value: 'Left', textKey: 'positionLeft' },
                { value: 'Right', textKey: 'positionRight' }
            ],
            themes: [
                { value: 'light', textKey: 'themeLight' },
                { value: 'dark', textKey: 'themeDark' }
            ],
            consentModes: [
                { value: 'OptIn', textKey: 'modeOptIn' },
                { value: 'OptOut', textKey: 'modeOptOut' }
            ],
            builtInScriptProviders: [
                { value: 'GoogleAnalytics', textKey: 'providerGoogleAnalytics', placeholder: 'G-XXXXXXXXXX', labelKey: 'measurementId' },
                { value: 'GoogleTagManager', textKey: 'providerGoogleTagManager', placeholder: 'GTM-XXXXXXX', labelKey: 'containerId' },
                { value: 'FacebookPixel', textKey: 'providerFacebookPixel', placeholder: 'XXXXXXXXXXXXXXX', labelKey: 'pixelId' }
            ]
        };

        // Category is edited as one 3-state choice instead of two entangled toggles
        vm.categoryStateOptions = [
            { value: 'hidden', textKey: 'categoryStateHidden' },
            { value: 'optional', textKey: 'categoryStateOptional' },
            { value: 'always', textKey: 'categoryStateAlways' }
        ];
        vm.categoryLocked = function (key) {
            return String(key).toLowerCase() === 'necessary';
        };
        vm.stateFromCategory = function (category) {
            if (!category || !category.item1) return 'hidden';
            return category.item2 ? 'always' : 'optional';
        };
        vm.applyCategoryState = function (key, category) {
            if (vm.categoryLocked(key)) { category.item1 = true; category.item2 = true; category.state = 'always'; return; }
            if (category.state === 'hidden') { category.item1 = false; category.item2 = false; }
            else if (category.state === 'optional') { category.item1 = true; category.item2 = false; }
            else { category.item1 = true; category.item2 = true; }
        };

        // Live preview with the real library. enum name maps to the raw Orestbida string
        var CC_LAYOUT = {
            Box: 'box', BoxInline: 'box inline', BoxWide: 'box wide',
            Cloud: 'cloud', CloudInline: 'cloud inline',
            Bar: 'bar', BarInline: 'bar inline'
        };
        var CC_POSITION = {
            TopLeft: 'top left', TopCenter: 'top center', TopRight: 'top right',
            MiddleLeft: 'middle left', MiddleCenter: 'middle center', MiddleRight: 'middle right',
            BottomLeft: 'bottom left', BottomCenter: 'bottom center', BottomRight: 'bottom right'
        };
        var CC_PREF_LAYOUT = { Box: 'box', Bar: 'bar', BarWide: 'bar wide' };

        function buildPreviewConfig() {
            var g = vm.settings.guiOptions || {};
            var lang = 'preview';
            var cats = {};
            var sections = [];
            angular.forEach(vm.settings.applicableCategories, function (cat, key) {
                var k = String(key).toLowerCase();
                if (cat && cat.item1) {
                    cats[k] = { enabled: true, readOnly: !!cat.item2 };
                    sections.push({ title: vm.categoryLabel(key), description: vm.categoryDescription(key), linkedCategory: k });
                }
            });
            if (!Object.keys(cats).length) cats.necessary = { enabled: true, readOnly: true };

            var tr = {};
            tr[lang] = {
                consentModal: {
                    title: vm.t.previewTitle,
                    description: vm.t.previewDescription,
                    acceptAllBtn: vm.t.previewAcceptAll,
                    rejectAllBtn: vm.t.previewRejectAll,
                    showPreferencesBtn: vm.t.previewManage
                },
                preferencesModal: {
                    title: vm.t.previewManage,
                    acceptAllBtn: vm.t.previewAcceptAll,
                    rejectAllBtn: vm.t.previewRejectAll,
                    savePreferencesBtn: vm.t.save,
                    sections: sections
                }
            };

            return {
                root: '#cc-preview-root',
                autoShow: true,
                // false on purpose: the overlay would dim the whole backoffice
                disablePageInteraction: false,
                cookie: { name: 'cc_cookie_preview' },
                guiOptions: {
                    consentModal: {
                        layout: CC_LAYOUT[g.consentModalLayout] || 'box',
                        position: CC_POSITION[g.consentModalPosition] || 'bottom left',
                        equalWeightButtons: true,
                        flipButtons: false
                    },
                    preferencesModal: {
                        layout: CC_PREF_LAYOUT[g.preferencesModalLayout] || 'box',
                        position: String(g.preferencesModalPosition || 'Right').toLowerCase()
                    }
                },
                categories: cats,
                language: { default: lang, translations: tr }
            };
        }

        function renderPreview() {
            var stage = document.getElementById('cc-preview-root');
            if (!stage || !window.CookieConsent || !vm.settings) return;
            try {
                // dark mode is scoped by an ancestor class in the library CSS
                if (vm.settings.theme === 'dark') stage.classList.add('cc--darkmode');
                else stage.classList.remove('cc--darkmode');

                window.CookieConsent.reset(true);
                stage.innerHTML = '';
                window.CookieConsent.run(buildPreviewConfig());
                if (typeof window.CookieConsent.show === 'function') window.CookieConsent.show(true);
            } catch (e) {
                // the preview is non-critical and must never break the settings form
            }
        }

        // Full page config: same as the dashboard preview but mounted on the page body
        function buildFullPageConfig() {
            var cfg = buildPreviewConfig();
            delete cfg.root;
            cfg.disablePageInteraction = !!(vm.settings.miscOptions && vm.settings.miscOptions.disablePageInteraction);
            return cfg;
        }

        // Same-origin channel so an open preview tab updates live when settings change
        var previewChannel = window.BroadcastChannel ? new BroadcastChannel('cc-preview') : null;
        var previewPoll;
        function broadcastPreview() {
            if (!previewChannel || !vm.settings) return;
            previewChannel.postMessage({ type: 'cc-config', config: buildFullPageConfig(), dark: vm.settings.theme === 'dark' });
        }
        $scope.$on('$destroy', function () {
            if (previewChannel) previewChannel.close();
            if (previewPoll) $interval.cancel(previewPoll);
        });

        // Open the real banner full page in a new tab that listens for live updates
        vm.openPreviewTab = function () {
            if (!vm.settings || !window.CookieConsent) return;
            var base = '/libraries/cookieconsent-orestbida/';
            var initial = JSON.stringify(buildFullPageConfig());
            var dark = vm.settings.theme === 'dark' ? 'true' : 'false';
            var tabScript = '(function(){'
                + 'var ch=window.BroadcastChannel?new BroadcastChannel("cc-preview"):null;'
                + 'function render(cfg,dark){try{'
                + 'document.documentElement.classList.toggle("cc--darkmode",!!dark);'
                + 'if(window.CookieConsent.reset)window.CookieConsent.reset(true);'
                + 'window.CookieConsent.run(cfg);'
                + 'if(window.CookieConsent.show)window.CookieConsent.show(true);'
                + '}catch(e){}}'
                + 'if(ch)ch.onmessage=function(e){if(e.data&&e.data.type==="cc-config")render(e.data.config,e.data.dark);};'
                + 'window.addEventListener("load",function(){render(' + initial + ',' + dark + ');});'
                + '})();';
            var doc = '<!doctype html><html><head><meta charset="utf-8">'
                + '<title>' + (vm.t.previewHeading || 'Preview') + '</title>'
                + '<link rel="stylesheet" href="' + base + 'cookieconsent.min.css">'
                + '<scr' + 'ipt src="' + base + 'cookieconsent.umd.min.js"></scr' + 'ipt>'
                + '</head><body><scr' + 'ipt>' + tabScript + '</scr' + 'ipt></body></html>';
            var w = window.open('', '_blank');
            if (!w) return;
            w.document.open(); w.document.write(doc); w.document.close();

            // hand the live preview to the tab: clear the in-dashboard one to avoid a duplicate
            vm.previewTabOpen = true;
            var stage = document.getElementById('cc-preview-root');
            if (stage) { try { window.CookieConsent.reset(true); } catch (e) {} stage.innerHTML = ''; }
            previewPoll = $interval(function () {
                if (w.closed) {
                    $interval.cancel(previewPoll);
                    vm.previewTabOpen = false;
                    schedulePreview();
                }
            }, 800);
        };

        var previewPending;
        function schedulePreview() {
            $timeout.cancel(previewPending);
            previewPending = $timeout(function () { if (!vm.previewTabOpen) renderPreview(); broadcastPreview(); }, 120);
        }

        function setupPreviewWatch() {
            $scope.$watch(function () {
                if (!vm.settings) return '';
                var g = vm.settings.guiOptions || {};
                var m = vm.settings.miscOptions || {};
                return [g.consentModalLayout, g.consentModalPosition, g.preferencesModalLayout,
                        g.preferencesModalPosition, vm.settings.theme, m.disablePageInteraction].join('|');
            }, function () { schedulePreview(); });
        }

        // Dependency surfaced in the UI: Facebook Pixel needs the Marketing category shown
        vm.marketingHidden = function () {
            var cats = vm.settings.applicableCategories || {};
            var key = Object.keys(cats).filter(function (k) { return k.toLowerCase() === 'marketing'; })[0];
            var c = key && cats[key];
            return !!(c && !c.item1);
        };

        vm.builtInProvider = function (provider) {
            return vm.enums.builtInScriptProviders.filter(function (p) {
                return p.value === provider;
            })[0];
        };

        vm.builtInPlaceholder = function (provider) {
            var match = vm.builtInProvider(provider);
            return match ? match.placeholder : '';
        };

        vm.builtInIdLabel = function (provider) {
            var match = vm.builtInProvider(provider);
            return match ? vm.t[match.labelKey] : vm.t.measurementId;
        };

        vm.loadTranslations = function () {
            return localizationService.localizeMany(TEXT_KEYS.map(function (key) {
                return "cookieConsent_" + key;
            })).then(function (values) {
                TEXT_KEYS.forEach(function (key, index) {
                    vm.t[key] = values[index];
                });
            });
        };

        // Defaults and the transient category.state view-model, applied on load and reset
        function hydrate(settings) {
            settings.customScripts = settings.customScripts || [];
            settings.builtInScripts = settings.builtInScripts || [];
            settings.complianceOptions = settings.complianceOptions || {
                revision: 0, mode: 'OptIn', autoShow: true, hideFromBots: true
            };
            angular.forEach(settings.applicableCategories, function (cat) {
                if (cat) cat.state = vm.stateFromCategory(cat);
            });
            return settings;
        }

        vm.loadSettings = function () {
            return $http.get('backoffice/api/CookieConsent/GetSettings')
                .then(function (response) {
                    vm.settings = hydrate(response.data);
                })
                .catch(function () {
                    notificationsService.error(vm.t.error, vm.t.loadFailed);
                });
        };

        vm.saveSettings = function () {
            vm.loading = true;
            $http.post('backoffice/api/CookieConsent/SaveSettings', vm.settings)
                .then(function () {
                    notificationsService.success(vm.t.success, vm.t.saveSucceeded);
                    vm.loading = false;
                })
                .catch(function () {
                    notificationsService.error(vm.t.error, vm.t.saveFailed);
                    vm.loading = false;
                });
        };

        vm.resetConfig = function () {
            // Reset wipes every setting, so confirm through the native overlay first
            overlayService.confirm({
                title: vm.t.resetToDefaults,
                content: vm.t.resetToDefaults,
                confirmType: "delete",
                submitButtonLabelKey: "general_yes",
                closeButtonLabelKey: "general_cancel",
                submit: function () {
                    overlayService.close();
                    vm.loading = true;
                    $http.get('backoffice/api/CookieConsent/ResetSettings')
                        .then(function (response) {
                            vm.settings = hydrate(response.data);
                            notificationsService.success(vm.t.success, vm.t.resetSucceeded);
                            vm.loading = false;
                        })
                        .catch(function () {
                            notificationsService.error(vm.t.error, vm.t.resetFailed);
                            vm.loading = false;
                        });
                },
                close: function () { overlayService.close(); }
            });
        };

        vm.addCustomScript = function () {
            vm.settings.customScripts.push({
                type: "Analytics",
                code: ""
            });
        };

        vm.removeCustomScript = function (index) {
            vm.settings.customScripts.splice(index, 1);
        };

        vm.addBuiltInScript = function () {
            vm.settings.builtInScripts.push({
                provider: "GoogleAnalytics",
                id: "",
            });
        };

        vm.removeBuiltInScript = function (index) {
            vm.settings.builtInScripts.splice(index, 1);
        };

        // The labels are needed before the first render, so the dashboard waits for both
        vm.loadTranslations()
            .then(vm.loadSettings)
            .finally(function () {
                vm.loading = false;
                // wait for the dashboard DOM (and the preview stage) to render, then watch
                $timeout(setupPreviewWatch, 150);
            });

        return vm;
    }
    angular.module("umbraco").controller("CookieConsentDashboard.Controller",
        ['$http', 'notificationsService', 'localizationService', 'overlayService', '$scope', '$timeout', '$interval', controller]);
})();
