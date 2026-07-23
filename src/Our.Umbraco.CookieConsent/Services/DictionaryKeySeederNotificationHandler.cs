using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.CookieConsent.Services;

/// <summary>
/// Seeds the dictionary keys once Umbraco is fully started
/// </summary>
public class DictionaryKeySeederNotificationHandler : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    private readonly DictionaryKeySeeder _dictionaryKeySeeder;
    private readonly IRuntimeState _runtimeState;

    public DictionaryKeySeederNotificationHandler(DictionaryKeySeeder dictionaryKeySeeder, IRuntimeState runtimeState)
    {
        _dictionaryKeySeeder = dictionaryKeySeeder;
        _runtimeState = runtimeState;
    }

    public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        if (_runtimeState.Level < RuntimeLevel.Run)
            return;

        await _dictionaryKeySeeder.CreateBaseKeysAsync();
    }
}
