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
        "languageTitle", "languageDescription", "fallbackLanguage", "fallbackLanguageDescription", "languageHint",
        "appearanceTitle", "appearanceDescription",
        "bannerLayout", "bannerLayoutDescription", "bannerPosition",
        "preferencesLayout", "preferencesLayoutDescription", "preferencesPosition",
        "theme", "themeLight", "themeDark",
        "followDarkMode", "followDarkModeDescription",
        "disableTransitions", "disableTransitionsDescription",
        "disablePageInteraction", "disablePageInteractionDescription",
        "layoutBox", "layoutBoxInline", "layoutBoxWide", "layoutCloud", "layoutCloudInline",
        "layoutBar", "layoutBarInline", "layoutBarWide",
        "positionTopLeft", "positionTopCenter", "positionTopRight",
        "positionMiddleLeft", "positionMiddleCenter", "positionMiddleRight",
        "positionBottomLeft", "positionBottomCenter", "positionBottomRight",
        "positionLeft", "positionRight",
        "builtInScriptsTitle", "builtInScriptsDescription", "provider", "providerGoogleConsentMode",
        "measurementId", "noBuiltInScript", "addBuiltInScript",
        "customScriptsTitle", "customScriptsDescription", "customScriptsHint",
        "runsAfterAccept", "code", "noCustomScript", "addScript",
        "remove", "resetToDefaults", "save",
        "error", "success", "loadFailed", "saveSucceeded", "saveFailed", "resetSucceeded", "resetFailed"
    ];

    function controller($http, notificationsService, localizationService) {
        var vm = this;

        vm.loading = true;
        vm.t = {};

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
            builtInScriptProviders: [
                { value: 'GoogleConsentMode', textKey: 'providerGoogleConsentMode' }
            ]
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

        vm.loadSettings = function () {
            return $http.get('backoffice/api/CookieConsent/GetSettings')
                .then(function (response) {
                    vm.settings = response.data;
                    vm.settings.customScripts = vm.settings.customScripts || [];
                    vm.settings.builtInScripts = vm.settings.builtInScripts || [];
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
            vm.loading = true;
            $http.get('backoffice/api/CookieConsent/ResetSettings')
                .then(function (response) {
                    vm.settings = response.data;
                    notificationsService.success(vm.t.success, vm.t.resetSucceeded);
                    vm.loading = false;
                })
                .catch(function () {
                    notificationsService.error(vm.t.error, vm.t.resetFailed);
                    vm.loading = false;
                });
        };

        vm.toggleCategory = function (categoryName, property) {
            if (property === 'item1') {
                if (vm.settings.applicableCategories[categoryName].item2) {
                    return;
                }
            } else if (property === 'item2') {
                vm.settings.applicableCategories[categoryName].item1 = true;
            }
            vm.settings.applicableCategories[categoryName][property] =
                !vm.settings.applicableCategories[categoryName][property];
        };

        // TODO: Support built-in integrations for common services like Google Analytics, Facebook Pixel
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
                provider: "GoogleConsentMode",
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
            });

        return vm;
    }
    angular.module("umbraco").controller("CookieConsentDashboard.Controller",
        ['$http', 'notificationsService', 'localizationService', controller]);
})();
