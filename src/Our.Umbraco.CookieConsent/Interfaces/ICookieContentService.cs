using Our.Umbraco.CookieConsent.Models;

namespace Our.Umbraco.CookieConsent.Interfaces;

public interface ICookieConsentService
{
    Task<CookieConsentSettingsModel> GetSettingsAsync();
    Task SaveSettingsAsync(CookieConsentSettingsModel settings);
    Task<CookieConsentSettingsModel> ResetSettingsAsync();
}
