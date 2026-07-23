using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Our.Umbraco.CookieConsent.Controllers;

/// <summary>
/// Gives the package its own entry in the backoffice API documentation, so the endpoints do not
/// land in the Umbraco management API document
/// </summary>
public class CookieConsentApiConfiguration
{
    public const string ApiName = "cookie-consent";

    public static void Configure(SwaggerGenOptions options)
        => options.SwaggerDoc(ApiName, new OpenApiInfo
        {
            Title = "Cookie Consent API",
            Version = "Latest"
        });
}
