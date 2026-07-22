namespace Our.Umbraco.CookieConsent.Models;

public class CookieCategoriesModel
{
    public (bool Enabled, bool ReadOnly) Necessary { get; set; }
    public (bool Enabled, bool ReadOnly) Functionality { get; set; }
    public (bool Enabled, bool ReadOnly) Analytics { get; set; }
    public (bool Enabled, bool ReadOnly) Marketing { get; set; }

    public IEnumerable<(string Name, bool Enabled, bool ReadOnly)> GetAll()
    {
        yield return (nameof(Necessary), Necessary.Enabled, Necessary.ReadOnly);
        yield return (nameof(Functionality), Functionality.Enabled, Functionality.ReadOnly);
        yield return (nameof(Analytics), Analytics.Enabled, Analytics.ReadOnly);
        yield return (nameof(Marketing), Marketing.Enabled, Marketing.ReadOnly);
    }
}

public enum CookieCategoryType
{
    Necessary,
    Functionality,
    Analytics,
    Marketing
}