(function () {
    "use strict";

    function controller($http, notificationsService) {
        var vm = this;

        vm.loading = true;
        vm.scriptTypes = ["Necessary", "Functionality", "Analytics", "Marketing"];

        // The settings expose raw category keys, the dashboard shows editor-facing wording
        vm.categories = {
            necessary: {
                name: "Strictly necessary",
                description: "Needed for the site to work, so visitors are never asked about these."
            },
            functionality: {
                name: "Functionality",
                description: "Remembers choices such as language or region."
            },
            analytics: {
                name: "Analytics",
                description: "Measures how visitors browse the site."
            },
            marketing: {
                name: "Marketing",
                description: "Used to show advertising based on browsing habits."
            }
        };

        vm.categoryLabel = function (key) {
            var category = vm.categories[String(key).toLowerCase()];
            return category ? category.name : key;
        };

        vm.categoryDescription = function (key) {
            var category = vm.categories[String(key).toLowerCase()];
            return category ? category.description : "";
        };
        vm.enums = {
            consentModalLayouts: [
                { value: 'Box', displayName: 'box' },
                { value: 'BoxInline', displayName: 'box inline' },
                { value: 'BoxWide', displayName: 'box wide' },
                { value: 'Cloud', displayName: 'cloud' },
                { value: 'CloudInline', displayName: 'cloud inline' },
                { value: 'Bar', displayName: 'bar' },
                { value: 'BarInline', displayName: 'bar inline' }
            ],
            preferencesModalLayouts: [
                { value: 'Box', displayName: 'box' },
                { value: 'Bar', displayName: 'bar' },
                { value: 'BarWide', displayName: 'bar wide' }
            ],
            consentModalPositions: [
                { value: 'TopLeft', displayName: 'top left' },
                { value: 'TopCenter', displayName: 'top center' },
                { value: 'TopRight', displayName: 'top right' },
                { value: 'MiddleLeft', displayName: 'middle left' },
                { value: 'MiddleCenter', displayName: 'middle center' },
                { value: 'MiddleRight', displayName: 'middle right' },
                { value: 'BottomLeft', displayName: 'bottom left' },
                { value: 'BottomCenter', displayName: 'bottom center' },
                { value: 'BottomRight', displayName: 'bottom right' }
            ],
            preferencesModalPositions: [
                { value: 'Left', displayName: 'left' },
                { value: 'Right', displayName: 'right' }
            ]
        };

        vm.loadSettings = function () {
            $http.get('backoffice/api/CookieConsent/GetSettings')
                .then(function (response) {
                    vm.settings = response.data;
                    vm.settings.customScripts = vm.settings.customScripts || [];
                    vm.settings.builtInScripts = vm.settings.builtInScripts || [];
                    vm.loading = false;
                })
                .catch(function () {
                    notificationsService.error("Error", "Failed to load settings.");
                    vm.loading = false;
                });
        };

        vm.saveSettings = function () {
            vm.loading = true;
            $http.post('backoffice/api/CookieConsent/SaveSettings', vm.settings)
                .then(function () {
                    notificationsService.success("Success", "Settings saved successfully.");
                    vm.loading = false;
                })
                .catch(function () {
                    notificationsService.error("Error", "Failed to save settings.");
                    vm.loading = false;
                });
        };

        vm.resetConfig = function () {
            vm.loading = true;
            $http.get('backoffice/api/CookieConsent/ResetSettings')
                .then(function (response) {
                    vm.settings = response.data;
                    notificationsService.success("Success", "Settings reset to defaults.");
                    vm.loading = false;
                })
                .catch(function () {
                    notificationsService.error("Error", "Failed to reset settings.");
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

        vm.loadSettings();
        return vm;
    }
    angular.module("umbraco").controller("CookieConsentDashboard.Controller", ['$http', 'notificationsService', controller]);
})();
