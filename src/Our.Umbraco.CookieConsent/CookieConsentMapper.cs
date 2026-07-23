using System.Text.Json;
using Our.Umbraco.CookieConsent.Models;

namespace Our.Umbraco.CookieConsent;

public static class CookieConsentMapper
{
    /// <summary>
    /// The stored JSON was written with PascalCase property names, so reading is case insensitive
    /// to accept both what this version writes and what the Umbraco 13 version left behind
    /// </summary>
    internal static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static CookieConsentSettingsModel? MapToCookieModel(CookieConsentSettingsSqlModel? sqlModel)
    {
        if (sqlModel == null || string.IsNullOrWhiteSpace(sqlModel.SettingsJson))
            return null;

        try
        {
            return JsonSerializer.Deserialize<CookieConsentSettingsModel>(sqlModel.SettingsJson, SerializerOptions);
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
                SettingsJson = JsonSerializer.Serialize(domainModel, SerializerOptions),
                LastUpdated = DateTime.UtcNow
            };
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Failed to map CookieConsentSettingsModel to CookieConsentSettingsSqlModel", ex);
        }
    }
}
