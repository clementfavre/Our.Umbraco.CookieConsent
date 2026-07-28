export default {
    cookieConsent: {
        // Dashboard chrome
        menuLabel: `Cookie Consent 🍪`,
        headline: `Cookie Consent`,

        // Categories
        categoriesTitle: `Catégories de cookies`,
        categoriesDescription: `Choisissez les catégories affichées dans le bandeau, et si les visiteurs peuvent les modifier.`,
        categoryNecessary: `Strictement nécessaires`,
        categoryNecessaryDescription: `Nécessaires au fonctionnement du site ; les visiteurs ne sont jamais interrogés à leur sujet.`,
        categoryFunctionality: `Fonctionnalités`,
        categoryFunctionalityDescription: `Mémorisent des choix comme la langue ou la région.`,
        categoryAnalytics: `Mesure d'audience`,
        categoryAnalyticsDescription: `Mesurent la façon dont les visiteurs parcourent le site.`,
        categoryMarketing: `Marketing`,
        categoryMarketingDescription: `Servent à afficher de la publicité selon les habitudes de navigation.`,
        shownInBanner: `Affichée dans le bandeau`,
        hidden: `Masquée`,
        alwaysOn: `Toujours active, refus impossible`,
        visitorsDecide: `Au choix du visiteur`,

        // Language
        languageTitle: `Langue`,
        languageDescription: `Le bandeau suit la langue du visiteur lorsqu'elle peut être détectée.`,
        fallbackLanguage: `Langue de repli`,
        fallbackLanguageDescription: `Utilisée lorsque la langue du visiteur n'est pas disponible.`,
        languageHint: `Les choix proposés ici sont les langues configurées dans Umbraco. Les textes comme le titre du bandeau se gèrent dans le Dictionnaire, sous la clé <code>Our.Umbraco.CookieConsent</code>.`,

        // Appearance
        appearanceTitle: `Apparence`,
        appearanceDescription: `L'emplacement et l'aspect des deux fenêtres.`,
        bannerLayout: `Disposition du bandeau`,
        bannerLayoutDescription: `La première fenêtre que voit le visiteur.`,
        bannerPosition: `Position du bandeau`,
        preferencesLayout: `Disposition des préférences`,
        preferencesLayoutDescription: `La fenêtre ouverte depuis « Gérer les préférences ».`,
        preferencesPosition: `Position des préférences`,
        theme: `Thème`,
        themeLight: `Clair`,
        themeDark: `Sombre`,
        followDarkMode: `Suivre le mode sombre du visiteur`,
        followDarkModeDescription: `Bascule sur le thème sombre lorsque le système du visiteur le demande.`,
        disableTransitions: `Désactiver les animations`,
        disableTransitionsDescription: `Affiche les fenêtres sans fondu ni glissement.`,
        disablePageInteraction: `Bloquer la page jusqu'au choix`,
        disablePageInteractionDescription: `Assombrit le site et empêche la navigation tant que le visiteur n'a pas répondu.`,

        // Layouts, named after the Orestbida library so the docs stay readable
        layoutBox: `Box`,
        layoutBoxInline: `Box, boutons alignés`,
        layoutBoxWide: `Box large`,
        layoutCloud: `Cloud`,
        layoutCloudInline: `Cloud, boutons alignés`,
        layoutBar: `Bar`,
        layoutBarInline: `Bar, boutons alignés`,
        layoutBarWide: `Bar large`,

        // Positions
        positionTopLeft: `En haut à gauche`,
        positionTopCenter: `En haut au centre`,
        positionTopRight: `En haut à droite`,
        positionMiddleLeft: `Au milieu à gauche`,
        positionMiddleCenter: `Au milieu au centre`,
        positionMiddleRight: `Au milieu à droite`,
        positionBottomLeft: `En bas à gauche`,
        positionBottomCenter: `En bas au centre`,
        positionBottomRight: `En bas à droite`,
        positionLeft: `À gauche`,
        positionRight: `À droite`,

        // Built-in scripts
        builtInScriptsTitle: `Scripts intégrés`,
        builtInScriptsDescription: `Intégrations prêtes à l'emploi qui s'exécutent avant le consentement. Saisissez l'identifiant, le paquet s'occupe du reste.`,
        provider: `Fournisseur`,
        providerGoogleAnalytics: `Google Analytics (gtag.js)`,
        providerGoogleTagManager: `Google Tag Manager`,
        providerFacebookPixel: `Facebook Pixel`,
        measurementId: `Identifiant de mesure`,
        containerId: `Identifiant de conteneur`,
        pixelId: `Identifiant de pixel`,
        providerGtmNote: `Le paquet envoie les signaux de consentement Google. Pour qu'ils bloquent quoi que ce soit, activez les <strong>paramètres de consentement</strong> sur vos balises dans Tag Manager.`,
        providerFbNote: `Le Pixel se charge avec le consentement révoqué et n'est accordé que si le visiteur accepte la catégorie <strong>Marketing</strong> : gardez donc cette catégorie activée.`,
        noBuiltInScript: `Aucun script intégré pour l'instant.`,
        addBuiltInScript: `Ajouter un script intégré`,

        // Custom scripts
        customScriptsTitle: `Scripts personnalisés`,
        customScriptsDescription: `Votre propre code de suivi, exécuté seulement après que le visiteur a accepté la catégorie correspondante.`,
        customScriptsHint: `<strong>JavaScript uniquement.</strong> Le code s'exécute à l'intérieur d'une fonction : une balise <code>&lt;script&gt;</code> le casserait. Pour charger un fichier externe, créez l'élément vous-même :`,
        runsAfterAccept: `S'exécute après acceptation de`,
        code: `Code`,
        noCustomScript: `Aucun script personnalisé pour l'instant.`,
        addScript: `Ajouter un script`,

        // Shared
        remove: `Supprimer`,
        resetToDefaults: `Rétablir les valeurs par défaut`,
        save: `Enregistrer`,

        // Notifications
        error: `Erreur`,
        success: `Succès`,
        loadFailed: `Échec du chargement des réglages.`,
        saveSucceeded: `Réglages enregistrés.`,
        saveFailed: `Échec de l'enregistrement des réglages.`,
        resetSucceeded: `Réglages rétablis aux valeurs par défaut.`,
        resetFailed: `Échec du rétablissement des réglages.`,
    },
};
