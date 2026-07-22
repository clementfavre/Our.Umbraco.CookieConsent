# Our.Umbraco.CookieConsent

[![Umbraco Marketplace](https://img.shields.io/badge/Umbraco-Marketplace-%233544B1?style=flat&logo=umbraco)](https://marketplace.umbraco.com/package/our.umbraco.cookieconsent)
[![NuGet Downloads](https://img.shields.io/nuget/dt/Our.Umbraco.CookieConsent?color=red&label=Downloads&logo=nuget)](https://www.nuget.org/packages/Our.Umbraco.CookieConsent)
[![GitHub License](https://img.shields.io/github/license/clementfavre/Our.Umbraco.CookieConsent?color=green&label=License&logo=github)](https://github.com/clementfavre/Our.Umbraco.CookieConsent/blob/master/LICENSE)

Easily add a configurable cookie consent banner to your Umbraco site. Features include a dashboard for customizing behavior, appearance, and translations, using the Orestbida/CookieConsent library.

## Requirements

Umbraco 13 on .NET 8  
Umbraco 17 on .NET 10 in progress (release 23-24 July 2026)

## Installation

```
dotnet add package Our.Umbraco.CookieConsent
```

Then render the banner by adding this line to your main layout file (`_Layout.cshtml` or equivalent):

```csharp
@await Component.InvokeAsync("Cookie")
```

The settings table is created on the first startup, and the dashboard shows the default settings until you save for the first time

## Configuration

1. **Access the dashboard**  
Navigate to the Settings tab in the Umbraco Backoffice, and then select the Cookie Consent dashboard to manage all settings related to your banner.

2. **Customize appearance and behavior**  
   Use the dashboard to configure:  
   - **Position** of the banner on your site.  
   - **Categories** of cookies to display.  
   - **Layout** and styles to match your site’s design.
   - ...
 
3. **Manage translations**  
   - Translations for the popup text can be managed in the **Translations** section of Umbraco, under the key `Our.Umbraco.CookieConsent`.  
   - The available languages for the cookie consent popup depend on the languages configured for your Umbraco site.
   - Keys for a category are created the first time you save the settings with that category enabled.

## Custom scripts

You can define custom scripts that are injected only **after user consent**, based on the selected cookie category (e.g. Analytics, Marketing, etc.).

To do so:
- Navigate to the **"Custom scripts"** section in the dashboard
- Add a new entry with the target category (`Analytics`, `Marketing`, etc.)
- Paste your script using **safe** JS, such as dynamic script injection

**Important**: HTML `<script>` tags **cannot** be directly used inside JavaScript blocks. Instead, use JavaScript to create and inject scripts dynamically.

### Example: Google Analytics script

```js
    var gtagScript = document.createElement('script');
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-CN4GDXXXXX';
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    gtagScript.onload = function () {
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', 'G-XXXX');
    };
```

This logic will only be executed if the user accepts the **analytics** category

## Built-in scripts

The **"Built-in Scripts"** section covers integrations that need to run before consent is given, which custom scripts cannot do

**Google Consent Mode** is the one currently available. Add an entry, pick it as the provider and fill in your measurement ID (`G-XXXXXXXXXX`). The package then loads `gtag.js` on every page and sets all consent signals to `denied` by default, including `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage`. They are updated as soon as the visitor makes a choice, so Google receives consent signals rather than nothing at all.

Leave the ID empty and nothing is injected.

## Credits
This package is a simple integration of the [CookieConsent library](https://github.com/orestbida/cookieconsent), created by Orest Bida.

Cookie icons used in this project were created by [Rohim - Flaticon](https://www.flaticon.com/free-icons/cookie).

## License
This project is licensed under the MIT License. See the LICENSE file for details.
