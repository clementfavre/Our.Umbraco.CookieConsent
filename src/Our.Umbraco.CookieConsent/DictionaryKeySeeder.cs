using Microsoft.Extensions.Logging;
using Our.Umbraco.CookieConsent.Models;
using Our.Umbraco.CookieConsent.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.CookieConsent;

public class DictionaryKeySeeder
{
    private readonly IDictionaryItemService _dictionaryItemService;
    private readonly ILanguageService _languageService;
    private readonly ILogger<CookieConsentService> _logger;

    public DictionaryKeySeeder(IDictionaryItemService dictionaryItemService,
        ILanguageService languageService,
        ILogger<CookieConsentService> logger)
    {
        _dictionaryItemService = dictionaryItemService;
        _languageService = languageService;
        _logger = logger;
    }

    public async Task CreateBaseKeysAsync()
    {
        var parentKey = await CreateKeyAsync(Translations.NAMESPACE, "-");
        await CreateKeyAsync(Translations.ConsentModal.Title, "Your Privacy Settings", parentKey);
        await CreateKeyAsync(Translations.ConsentModal.Description, "We use cookies to improve your experience, analyze traffic, and personalize content. You can manage your preferences below or accept all cookies.", parentKey);
        await CreateKeyAsync(Translations.ConsentModal.CloseIconLabel, "Close this dialog", parentKey);
        await CreateKeyAsync(Translations.ConsentModal.AcceptAll, "Accept All Cookies", parentKey);
        await CreateKeyAsync(Translations.ConsentModal.RejectAll, "Reject All Cookies", parentKey);
        await CreateKeyAsync(Translations.ConsentModal.ManagePreferences, "Manage Cookie Preferences", parentKey);
        await CreateKeyAsync(Translations.ConsentModal.Footer, "Your choices will be saved for future visits. You can update them at any time.", parentKey);

        await CreateKeyAsync(Translations.PreferencesModal.Title, "Manage Your Cookie Preferences", parentKey);
        await CreateKeyAsync(Translations.PreferencesModal.CloseIconLabel, "Close preferences dialog", parentKey);
        await CreateKeyAsync(Translations.PreferencesModal.AcceptAll, "Accept All Cookies", parentKey);
        await CreateKeyAsync(Translations.PreferencesModal.RejectAll, "Reject All Cookies", parentKey);
        await CreateKeyAsync(Translations.PreferencesModal.Save, "Save My Preferences", parentKey);
        await CreateKeyAsync(Translations.PreferencesModal.ServiceCounterLabel, "Enabled Services: {count}", parentKey);
    }

    // sectionName = analytics / marketing / functional ...
    public async Task CreateSectionAsync(string sectionName)
    {
        var parentKey = (await _dictionaryItemService.GetAsync(Translations.NAMESPACE))?.Key
                        ?? await CreateKeyAsync(Translations.NAMESPACE, "-");

        parentKey = await CreateKeyAsync(sectionName, "-", parentKey);

        string title;
        string description;

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

        await CreateKeyAsync(string.Format(Translations.PreferencesModal.Sections.Title, sectionName), title, parentKey);
        await CreateKeyAsync(string.Format(Translations.PreferencesModal.Sections.Description, sectionName), description, parentKey);
    }

    private async Task<Guid?> CreateKeyAsync(string key, string value, Guid? parentKey = null)
    {
        try
        {
            var existingItem = await _dictionaryItemService.GetAsync(key);
            if (existingItem != null)
            {
                _logger.LogInformation("Key already exists: {DictionaryKey}", key);
                return existingItem.Key;
            }

            var dictionaryItem = new DictionaryItem(parentKey, key)
            {
                Translations = await BuildTranslationsAsync(value)
            };

            var attempt = await _dictionaryItemService.CreateAsync(dictionaryItem, Constants.Security.SuperUserKey);
            if (attempt.Success == false)
            {
                _logger.LogWarning("Could not create translation key {DictionaryKey}: {Status}", key, attempt.Status);
                return null;
            }

            _logger.LogInformation("Created translation key: {DictionaryKey}", key);
            return attempt.Result?.Key;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating key {DictionaryKey}", key);
            return null;
        }
    }

    /// <summary>
    /// The seeded wording is English, so it is only assigned to the default language and left
    /// for editors to fill in for the others
    /// </summary>
    private async Task<List<IDictionaryTranslation>> BuildTranslationsAsync(string value)
    {
        var defaultIsoCode = await _languageService.GetDefaultIsoCodeAsync();
        var language = await _languageService.GetAsync(defaultIsoCode);

        return language is null
            ? new List<IDictionaryTranslation>()
            : new List<IDictionaryTranslation> { new DictionaryTranslation(language, value) };
    }
}
