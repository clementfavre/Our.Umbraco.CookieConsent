using System.Text.Json.Serialization;
using Our.Umbraco.CookieConsent.Serialization;

namespace Our.Umbraco.CookieConsent.Models;

public class CookieCategoriesModel
{
    public CookieCategoryModel Necessary { get; set; } = new();
    public CookieCategoryModel Functionality { get; set; } = new();
    public CookieCategoryModel Analytics { get; set; } = new();
    public CookieCategoryModel Marketing { get; set; } = new();

    public IEnumerable<(string Name, CookieCategoryModel Category)> GetAll()
    {
        yield return (nameof(Necessary), Necessary);
        yield return (nameof(Functionality), Functionality);
        yield return (nameof(Analytics), Analytics);
        yield return (nameof(Marketing), Marketing);
    }
}

[JsonConverter(typeof(CookieCategoryModelJsonConverter))]
public class CookieCategoryModel
{
    public CookieCategoryModel()
    {}

    public CookieCategoryModel(bool enabled, bool readOnly)
    {
        Enabled = enabled;
        ReadOnly = readOnly;
    }

    /// <summary>
    /// Whether the category is shown in the banner
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// Whether visitors are allowed to refuse the category
    /// </summary>
    public bool ReadOnly { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CookieCategoryType
{
    Necessary,
    Functionality,
    Analytics,
    Marketing
}
