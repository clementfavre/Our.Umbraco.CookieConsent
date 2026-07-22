using Newtonsoft.Json;
using Our.Umbraco.CookieConsent.Models;

namespace Our.Umbraco.CookieConsent;

public static class CookieConsentMapper
{
    public static CookieConsentSettingsModel? MapToCookieModel(CookieConsentSettingsSqlModel? sqlModel)
    {
        if (sqlModel == null || string.IsNullOrWhiteSpace(sqlModel.SettingsJson))
            return null;

        try
        {
            return JsonConvert.DeserializeObject<CookieConsentSettingsModel>(sqlModel.SettingsJson);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Failed to map CookieConsentSettingsSqlModel to CookieConsentSettingsModel", ex);
        }
    }

    public static CookieConsentSettingsSqlModel MapToSqlModel(CookieConsentSettingsModel domainModel)
    {
        if (domainModel == null)
            throw new ArgumentNullException(nameof(domainModel));

        try
        {
            return new CookieConsentSettingsSqlModel
            {
                SettingsJson = JsonConvert.SerializeObject(domainModel),
                LastUpdated = DateTime.UtcNow
            };
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Failed to map CookieConsentSettingsModel to CookieConsentSettingsSqlModel", ex);
        }
    }
}