using System.Text.Json;
using Microsoft.Extensions.Logging;
using NPoco;
using Our.Umbraco.CookieConsent.Interfaces;
using Our.Umbraco.CookieConsent.Models;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Extensions;

namespace Our.Umbraco.CookieConsent.Services
{
    public class CookieConsentService : ICookieConsentService
    {
        private readonly IScopeProvider _scopeProvider;
        private readonly ILogger<CookieConsentService> _logger;
        private readonly ILanguageService _languageService;
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
            ILanguageService languageService,
            DictionaryKeySeeder dictionaryKeySeeder,
            AppCaches appCaches)
        {
            _scopeProvider = scopeProvider;
            _logger = logger;
            _languageService = languageService;
            _dictionaryKeySeeder = dictionaryKeySeeder;
            _appCaches = appCaches;
        }

        public async Task<CookieConsentSettingsModel> GetSettingsAsync()
        {
            try
            {
                var cached = _appCaches.RuntimeCache.GetCacheItem<CookieConsentSettingsModel>(SettingsCacheKey);
                if (cached is not null)
                    return cached;

                var settings = await LoadSettingsAsync();
                _appCaches.RuntimeCache.InsertCacheItem(SettingsCacheKey, () => settings, SettingsCacheDuration);

                return settings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching cookie consent settings.");
                return await GetDefaultSettingsAsync();
            }
        }

        private async Task<CookieConsentSettingsModel> LoadSettingsAsync()
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
                return await GetDefaultSettingsAsync();

            settings.AvailableLanguages = await GetAvailableLanguagesAsync();
            return settings;
        }

        public async Task SaveSettingsAsync(CookieConsentSettingsModel settings)
        {
            if (settings == null)
            {
                _logger.LogWarning("Attempted to save empty or null settings.");
                throw new ArgumentException("Settings cannot be null.", nameof(settings));
            }

            if (settings.ApplicableCategories != null)
            {
                // delete unused categories?
                foreach (var (name, category) in settings.ApplicableCategories.GetAll())
                {
                    if (category.Enabled)
                        await _dictionaryKeySeeder.CreateSectionAsync(name);
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

        public async Task<CookieConsentSettingsModel> ResetSettingsAsync()
        {
            var settings = await GetDefaultSettingsAsync();
            try
            {
                PersistSettings(settings);
                _logger.LogInformation("Cookie consent settings reset successfully.");
                return settings;
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

            var settingsJson = JsonSerializer.Serialize(settings, CookieConsentMapper.SerializerOptions);

            scope.Database.Execute(DeleteSettingsSql);
            scope.Database.Execute(InsertSettingsSql, new
            {
                settingsJson,
                lastUpdated = DateTime.UtcNow
            });

            scope.Complete();

            _appCaches.RuntimeCache.Clear(SettingsCacheKey);
        }

        private async Task<List<LanguageOptionModel>> GetAvailableLanguagesAsync()
        {
            var languages = await _languageService.GetAllAsync();
            return languages
                .Select(x => new LanguageOptionModel(x.IsoCode.Split('-')[0], x.CultureName))
                .ToList();
        }

        private async Task<CookieConsentSettingsModel> GetDefaultSettingsAsync()
        {
            return new CookieConsentSettingsModel
            {
                ApplicableCategories = new CookieCategoriesModel
                {
                    Necessary = new CookieCategoryModel(enabled: true, readOnly: true),
                    Functionality = new CookieCategoryModel(enabled: true, readOnly: true),
                    Analytics = new CookieCategoryModel(enabled: false, readOnly: false),
                    Marketing = new CookieCategoryModel(enabled: true, readOnly: false)
                },
                AvailableLanguages = await GetAvailableLanguagesAsync(),
                LanguageOptions = new LanguageOptionsModel
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
                CustomScripts = new(),
                BuiltInScripts = new()
            };
        }
    }
}
