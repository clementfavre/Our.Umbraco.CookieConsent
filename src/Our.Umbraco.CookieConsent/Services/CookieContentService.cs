using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NPoco;
using Umbraco.Cms.Core.Cache;
using Umbraco.Extensions;
using Our.Umbraco.CookieConsent.Interfaces;
using Our.Umbraco.CookieConsent.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;

namespace Our.Umbraco.CookieConsent.Services
{
    public class CookieConsentService : ICookieConsentService
    {
        private readonly IScopeProvider _scopeProvider;
        private readonly ILogger<CookieConsentService> _logger;
        private readonly ILocalizationService _localizationService;
        private readonly DictionaryKeySeeder _dictionaryKeySeeder;
        private readonly AppCaches _appCaches;

        // The front-end view resolves the settings on every page render, so they are cached
        private const string SettingsCacheKey = "Our.Umbraco.CookieConsent.Settings";
        private static readonly TimeSpan SettingsCacheDuration = TimeSpan.FromMinutes(5);

        private const string DefaultSettingsSql = @"SELECT TOP(1) 
                                [Id],
                                [SettingsJson],
                                [LastUpdated]
                             FROM [CookieConsentSettings]
                             ORDER BY [LastUpdated] DESC";

        private const string DefaultSettingsSqlLite = @"SELECT 
                                [Id],
                                [SettingsJson],
                                [LastUpdated]
                             FROM [CookieConsentSettings]
                             ORDER BY [LastUpdated] DESC
                             LIMIT 1";

        private const string InsertSettingsSql = @"INSERT INTO [CookieConsentSettings]
                                ([SettingsJson], [LastUpdated])
                             VALUES (@settingsJson, @lastUpdated)";

        private const string DeleteSettingsSql = @"DELETE FROM [CookieConsentSettings]";

        public CookieConsentService(IScopeProvider scopeProvider,
            ILogger<CookieConsentService> logger,
            ILocalizationService localizationService,
            DictionaryKeySeeder dictionaryKeySeeder,
            AppCaches appCaches)
        {
            _scopeProvider = scopeProvider;
            _logger = logger;
            _localizationService = localizationService;
            _dictionaryKeySeeder = dictionaryKeySeeder;
            _appCaches = appCaches;
        }

        public CookieConsentSettingsModel GetSettings()
        {
            try
            {
                return _appCaches.RuntimeCache.GetCacheItem(SettingsCacheKey, LoadSettings, SettingsCacheDuration)
                       ?? GetDefaultSettings();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching cookie consent settings.");
                return GetDefaultSettings();
            }
        }

        private CookieConsentSettingsModel LoadSettings()
        {
            CookieConsentSettingsSqlModel? sqlSettings;

            using (var scope = _scopeProvider.CreateScope())
            {
                var sql = scope.Database.DatabaseType == DatabaseType.SQLite
                    ? DefaultSettingsSqlLite
                    : DefaultSettingsSql;

                sqlSettings = scope.Database.FirstOrDefault<CookieConsentSettingsSqlModel>(sql);
                scope.Complete();
            }

            // Nothing stored yet (fresh install): fall back to the defaults instead of failing
            var settings = CookieConsentMapper.MapToCookieModel(sqlSettings);
            if (settings == null)
                return GetDefaultSettings();

            settings.AvailableLanguages = GetAvailableLanguages();
            return settings;
        }

        public void SaveSettings(CookieConsentSettingsModel settings)
        {
            if (settings == null)
            {
                _logger.LogWarning("Attempted to save empty or null settings.");
                throw new ArgumentException("Settings cannot be null.", nameof(settings));
            }

            if (settings.ApplicableCategories != null)
            {
                // delete unused categories?
                foreach (var category in settings.ApplicableCategories.GetAll())
                {
                    if (category.Enabled)
                        _dictionaryKeySeeder.CreateSection(category.Name);
                }
            }

            try
            {
                PersistSettings(settings);
                _logger.LogInformation("Cookie consent settings saved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while saving cookie consent settings.");
                throw;
            }
        }

        public void ResetSettings()
        {
            var settings = GetDefaultSettings();
            try
            {
                PersistSettings(settings);
                _logger.LogInformation("Cookie consent settings reset successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while resetting cookie consent settings.");
                throw;
            }
        }

        /// <summary>
        /// The table holds the current settings as a single row
        /// </summary>
        private void PersistSettings(CookieConsentSettingsModel settings)
        {
            using var scope = _scopeProvider.CreateScope();

            var settingsJson = JsonConvert.SerializeObject(settings);

            scope.Database.Execute(DeleteSettingsSql);
            scope.Database.Execute(InsertSettingsSql, new
            {
                settingsJson,
                lastUpdated = DateTime.UtcNow
            });

            scope.Complete();

            _appCaches.RuntimeCache.Clear(SettingsCacheKey);
        }

        private List<(string Value, string DisplayName)> GetAvailableLanguages()
            => _localizationService.GetAllLanguages()
                .Select(x => (Value: x.CultureInfo.TwoLetterISOLanguageName, DisplayName: x.CultureName))
                .ToList();

        private CookieConsentSettingsModel GetDefaultSettings()
        {
            return new CookieConsentSettingsModel
            {
                ApplicableCategories = new CookieCategoriesModel()
                {
                    Necessary = (true, true),
                    Functionality = (true, true),
                    Analytics = (false, false),
                    Marketing = (true, false)
                },
                AvailableLanguages = GetAvailableLanguages(),
                LanguageOptions = new LanguageOptionsModel()
                {
                    AutoDectect = true,
                    DefaultLanguage = "en",
                    DetectionMethod = LanguageDetectionMethod.Browser
                },
                GuiOptions = new GuiOptionsModel
                {
                    ConsentModalLayout = ConsentModalLayout.Box,
                    ConsentModalPosition = ConsentModalPosition.BottomLeft,
                    PreferencesModalLayout = PreferencesModalLayout.Box,
                    PreferencesModalPosition = PreferencesModalPosition.Right
                },
                Theme = "light",
                MiscOptions = new MiscOptionsModel
                {
                    EnableDarkMode = false,
                    DisableTransitions = false,
                    DisablePageInteraction = false
                },
                CustomScripts = new (),
                BuiltInScripts = new ()
            };
        }
    }
}