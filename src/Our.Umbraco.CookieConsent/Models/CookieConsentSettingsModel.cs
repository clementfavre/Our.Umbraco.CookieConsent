namespace Our.Umbraco.CookieConsent.Models;

public class CookieConsentSettingsModel
{
    //TODO: finish integrating all properties (https://playground.cookieconsent.orestbida.com/)
    public CookieCategoriesModel ApplicableCategories { get; set; }
    public List<(string Value, string DisplayName)> AvailableLanguages { get; set; }
    public LanguageOptionsModel LanguageOptions { get; set; }
    public GuiOptionsModel GuiOptions { get; set; }
    public MiscOptionsModel MiscOptions { get; set; }
    public ComplianceOptionsModel ComplianceOptions { get; set; }
    public string Theme { get; set; }
    public List<ScriptOptionsModel> CustomScripts { get; set; }
    public List<BuiltInScriptOptionsModel> BuiltInScripts { get; set; } = new();
}