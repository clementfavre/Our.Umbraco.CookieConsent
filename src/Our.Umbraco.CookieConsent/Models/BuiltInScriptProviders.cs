namespace Our.Umbraco.CookieConsent.Models;

public enum BuiltInScriptLoader
{
    GoogleAnalytics,
    GoogleTagManager
}

public class BuiltInScriptProviderDescriptor
{
    public required string Key { get; init; }
    public required BuiltInScriptLoader Loader { get; init; }
}

// Provider keys are the contract shared with the dashboard enum in CookieConsentDashboard.controller.js
public static class BuiltInScriptProviders
{
    public const string GoogleAnalyticsKey = "GoogleAnalytics";
    public const string GoogleTagManagerKey = "GoogleTagManager";

    private static readonly Dictionary<string, BuiltInScriptProviderDescriptor> ByKey =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [GoogleAnalyticsKey] = new() { Key = GoogleAnalyticsKey, Loader = BuiltInScriptLoader.GoogleAnalytics },
            [GoogleTagManagerKey] = new() { Key = GoogleTagManagerKey, Loader = BuiltInScriptLoader.GoogleTagManager }
        };

    // Installs from before the analytics and tag manager split stored the provider as "GoogleConsentMode"
    private static readonly Dictionary<string, string> Aliases =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["GoogleConsentMode"] = GoogleAnalyticsKey
        };

    public static BuiltInScriptProviderDescriptor? Resolve(string? provider)
    {
        if (string.IsNullOrWhiteSpace(provider))
            return null;

        var key = provider.Trim();
        if (Aliases.TryGetValue(key, out var aliased))
            key = aliased;

        return ByKey.TryGetValue(key, out var descriptor) ? descriptor : null;
    }
}
