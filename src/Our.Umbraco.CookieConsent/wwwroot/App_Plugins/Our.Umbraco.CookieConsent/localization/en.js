export default {
    cookieConsent: {
        // Dashboard chrome
        menuLabel: `Cookie Consent 🍪`,
        headline: `Cookie Consent`,

        // Categories
        categoriesTitle: `Cookie categories`,
        categoriesDescription: `Pick the categories shown in the banner, and whether visitors can change them.`,
        categoryNecessary: `Strictly necessary`,
        categoryNecessaryDescription: `Needed for the site to work, so visitors are never asked about these.`,
        categoryFunctionality: `Functionality`,
        categoryFunctionalityDescription: `Remembers choices such as language or region.`,
        categoryAnalytics: `Analytics`,
        categoryAnalyticsDescription: `Measures how visitors browse the site.`,
        categoryMarketing: `Marketing`,
        categoryMarketingDescription: `Used to show advertising based on browsing habits.`,
        shownInBanner: `Shown in the banner`,
        hidden: `Hidden`,
        alwaysOn: `Always on, visitors cannot refuse`,
        visitorsDecide: `Visitors decide`,

        // Language
        languageTitle: `Language`,
        languageDescription: `The banner follows the visitor's language when it can be detected.`,
        fallbackLanguage: `Fallback language`,
        fallbackLanguageDescription: `Used when the visitor's language is not available.`,
        languageHint: `The choices offered here are the languages configured in Umbraco. Wording such as the banner title lives in the Dictionary, under the <code>Our.Umbraco.CookieConsent</code> key.`,

        // Appearance
        appearanceTitle: `Appearance`,
        appearanceDescription: `Where the two dialogs sit and how they look.`,
        bannerLayout: `Banner layout`,
        bannerLayoutDescription: `The first dialog a visitor sees.`,
        bannerPosition: `Banner position`,
        preferencesLayout: `Preferences layout`,
        preferencesLayoutDescription: `The dialog opened from Manage preferences.`,
        preferencesPosition: `Preferences position`,
        theme: `Theme`,
        themeLight: `Light`,
        themeDark: `Dark`,
        followDarkMode: `Follow the visitor's dark mode`,
        followDarkModeDescription: `Switches to the dark theme when the visitor's system asks for it.`,
        disableTransitions: `Turn off animations`,
        disableTransitionsDescription: `Shows the dialogs without fading or sliding.`,
        disablePageInteraction: `Block the page until a choice is made`,
        disablePageInteractionDescription: `Dims the site and prevents browsing until the visitor answers.`,

        // Layouts, named after the Orestbida library so the docs stay readable
        layoutBox: `Box`,
        layoutBoxInline: `Box inline`,
        layoutBoxWide: `Box wide`,
        layoutCloud: `Cloud`,
        layoutCloudInline: `Cloud inline`,
        layoutBar: `Bar`,
        layoutBarInline: `Bar inline`,
        layoutBarWide: `Bar wide`,

        // Positions
        positionTopLeft: `Top left`,
        positionTopCenter: `Top center`,
        positionTopRight: `Top right`,
        positionMiddleLeft: `Middle left`,
        positionMiddleCenter: `Middle center`,
        positionMiddleRight: `Middle right`,
        positionBottomLeft: `Bottom left`,
        positionBottomCenter: `Bottom center`,
        positionBottomRight: `Bottom right`,
        positionLeft: `Left`,
        positionRight: `Right`,

        // Built-in scripts
        builtInScriptsTitle: `Built-in scripts`,
        builtInScriptsDescription: `Ready-made integrations that run before consent is given. Enter the ID and the package handles the rest.`,
        provider: `Provider`,
        providerGoogleAnalytics: `Google Analytics (gtag.js)`,
        providerGoogleTagManager: `Google Tag Manager`,
        providerFacebookPixel: `Facebook Pixel`,
        measurementId: `Measurement ID`,
        containerId: `Container ID`,
        pixelId: `Pixel ID`,
        providerGtmNote: `The package sends Google consent signals. For them to gate anything, turn on <strong>Consent settings</strong> for your tags in Tag Manager.`,
        providerFbNote: `The Pixel loads with consent revoked and is granted only when the visitor accepts the <strong>Marketing</strong> category, so keep that category enabled.`,
        noBuiltInScript: `No built-in script yet.`,
        addBuiltInScript: `Add built-in script`,

        // Custom scripts
        customScriptsTitle: `Custom scripts`,
        customScriptsDescription: `Your own tracking code, run only once the visitor accepts the matching category.`,
        customScriptsHint: `<strong>JavaScript only.</strong> The code runs inside a function, so a <code>&lt;script&gt;</code> tag would break it. Load an external file by creating the element yourself:`,
        runsAfterAccept: `Runs after the visitor accepts`,
        code: `Code`,
        noCustomScript: `No custom script yet.`,
        addScript: `Add script`,

        // Shared
        remove: `Remove`,
        resetToDefaults: `Reset to defaults`,
        save: `Save`,

        // Notifications
        error: `Error`,
        success: `Success`,
        loadFailed: `Failed to load settings.`,
        saveSucceeded: `Settings saved successfully.`,
        saveFailed: `Failed to save settings.`,
        resetSucceeded: `Settings reset to defaults.`,
        resetFailed: `Failed to reset settings.`,
    },
};
