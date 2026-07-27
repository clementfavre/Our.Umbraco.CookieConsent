using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Our.Umbraco.CookieConsent.Models;
using Our.Umbraco.CookieConsent.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.CookieConsent;

public class DictionaryKeySeeder
{
    private readonly ILocalizationService _localizationService;
    private readonly ILogger<CookieConsentService> _logger;

    public DictionaryKeySeeder(ILocalizationService localizationService, ILogger<CookieConsentService> logger)
    {
        _localizationService = localizationService;
        _logger = logger;
    }

    public void CreateBaseKeys()
    {
        var parentKey = CreateKey(Translations.NAMESPACE, "-");
        CreateKey(Translations.ConsentModal.Title, "Your Privacy Settings", parentKey);
        CreateKey(Translations.ConsentModal.Description, "We use cookies to improve your experience, analyze traffic, and personalize content. You can manage your preferences below or accept all cookies.", parentKey);
        CreateKey(Translations.ConsentModal.CloseIconLabel, "Close this dialog", parentKey);
        CreateKey(Translations.ConsentModal.AcceptAll, "Accept All Cookies", parentKey);
        CreateKey(Translations.ConsentModal.RejectAll, "Reject All Cookies", parentKey);
        CreateKey(Translations.ConsentModal.ManagePreferences, "Manage Cookie Preferences", parentKey);
        CreateKey(Translations.ConsentModal.Footer, "Your choices will be saved for future visits. You can update them at any time.", parentKey);

        CreateKey(Translations.PreferencesModal.Title, "Manage Your Cookie Preferences", parentKey);
        CreateKey(Translations.PreferencesModal.CloseIconLabel, "Close preferences dialog", parentKey);
        CreateKey(Translations.PreferencesModal.AcceptAll, "Accept All Cookies", parentKey);
        CreateKey(Translations.PreferencesModal.RejectAll, "Reject All Cookies", parentKey);
        CreateKey(Translations.PreferencesModal.Save, "Save My Preferences", parentKey);
        // orestbida prefixes the count and picks singular/plural split on '|'
        CreateKey(Translations.PreferencesModal.ServiceCounterLabel, "Enabled service|Enabled services", parentKey);
    }

    // sectionName = analytics / marketing / functional ...
    public void CreateSection(string sectionName)
    {
        var parentKey = _localizationService.GetDictionaryItemByKey(Translations.NAMESPACE)?.Key;
        if (parentKey is null)
            parentKey = CreateKey(Translations.NAMESPACE, "-");

        parentKey = CreateKey(sectionName, "-", parentKey);

        string title = string.Empty;
        string description = string.Empty;

        switch (sectionName.ToLower())
        {
            case "analytics":
                title = "Analytics Preferences";
                description = "These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.";
                break;

            case "marketing":
                title = "Marketing Preferences";
                description = "These cookies are used to deliver advertisements more relevant to you and your interests.";
                break;

            case "functionality":
                title = "Functional Preferences";
                description = "These cookies enable the website to provide enhanced functionality and personalization.";
                break;

            case "necessary":
                title = "Essential Preferences";
                description = "These cookies are necessary for the website to function and cannot be switched off in our systems.";
                break;

            default:
                title = "Other Preferences";
                description = "These cookies support additional functionalities or services.";
                break;
        }

        CreateKey(string.Format(Translations.PreferencesModal.Sections.Title, sectionName), title, parentKey);
        CreateKey(string.Format(Translations.PreferencesModal.Sections.Description, sectionName), description, parentKey);
    }

    private Guid? CreateKey(string key, string value, Guid? parentKey = null)
    {
        try
        {
            var itemId = DeterministicGuid(key);

            // Match on the deterministic GUID first, then the alias, so an Umbraco Deploy
            // artifact for the same item is never duplicated whatever the order of operations
            var existingItem = _localizationService.GetDictionaryItemById(itemId)
                               ?? _localizationService.GetDictionaryItemByKey(key);
            if (existingItem != null)
            {
                _logger.LogInformation($"Key already exists: {key}");
                return existingItem.Key;
            }

            var item = new DictionaryItem(parentKey, key) { Key = itemId };

            var defaultIso = _localizationService.GetDefaultLanguageIsoCode();
            var defaultLanguage = defaultIso is null ? null : _localizationService.GetLanguageByIsoCode(defaultIso);
            if (defaultLanguage != null)
                item.Translations = new[] { new DictionaryTranslation(defaultLanguage, value) };

            _localizationService.Save(item);
            _logger.LogInformation($"Created translation key: {key}");
            return item.Key;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating key {key}: {ex.Message}");
            return null;
        }
    }

    // Stable GUID derived from the alias so every environment seeds the same identifier
    private static Guid DeterministicGuid(string key)
    {
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(Translations.NAMESPACE + "|" + key));
        return new Guid(hash);
    }
}