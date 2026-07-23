namespace Our.Umbraco.CookieConsent.Models;

public class CookieConsentSettingsModel
{
    //TODO: finish integrating all properties (https://playground.cookieconsent.orestbida.com/)
    public CookieCategoriesModel ApplicableCategories { get; set; } = new();
    public List<LanguageOptionModel> AvailableLanguages { get; set; } = new();
    public LanguageOptionsModel LanguageOptions { get; set; } = new();
    public GuiOptionsModel GuiOptions { get; set; } = new();
    public MiscOptionsModel MiscOptions { get; set; } = new();
    public string Theme { get; set; } = "light";
    public List<ScriptOptionsModel> CustomScripts { get; set; } = new();
    public List<BuiltInScriptOptionsModel> BuiltInScripts { get; set; } = new();
}
