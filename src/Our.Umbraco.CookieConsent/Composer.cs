using Microsoft.Extensions.DependencyInjection;
using Our.Umbraco.CookieConsent.Controllers;
using Our.Umbraco.CookieConsent.Interfaces;
using Our.Umbraco.CookieConsent.Services;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace Our.Umbraco.CookieConsent;

public class Composer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<ICookieConsentService, CookieConsentService>();
        builder.Services.AddTransient<DictionaryKeySeeder>();
        builder.AddComponent<CookieConsentComponent>();
        builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, DictionaryKeySeederNotificationHandler>();
        builder.Services.Configure<SwaggerGenOptions>(CookieConsentApiConfiguration.Configure);
    }
}
