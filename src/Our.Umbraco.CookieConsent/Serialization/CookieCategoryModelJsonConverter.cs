using System.Text.Json;
using System.Text.Json.Serialization;
using Our.Umbraco.CookieConsent.Models;

namespace Our.Umbraco.CookieConsent.Serialization;

/// <summary>
/// Settings saved by the Umbraco 13 version of the package stored the category as a ValueTuple,
/// so the JSON in the database reads Item1/Item2. Both shapes are accepted on read to keep
/// those settings working after the upgrade
/// </summary>
public class CookieCategoryModelJsonConverter : JsonConverter<CookieCategoryModel>
{
    public override CookieCategoryModel Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return new CookieCategoryModel();

        if (reader.TokenType != JsonTokenType.StartObject)
            throw new JsonException($"Expected an object for {nameof(CookieCategoryModel)}, found {reader.TokenType}.");

        var category = new CookieCategoryModel();

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                return category;

            if (reader.TokenType != JsonTokenType.PropertyName)
                continue;

            var propertyName = reader.GetString();
            reader.Read();

            switch (propertyName?.ToLowerInvariant())
            {
                case "enabled":
                case "item1":
                    category.Enabled = ReadBoolean(ref reader);
                    break;

                case "readonly":
                case "item2":
                    category.ReadOnly = ReadBoolean(ref reader);
                    break;

                default:
                    reader.Skip();
                    break;
            }
        }

        throw new JsonException($"Unexpected end of JSON while reading {nameof(CookieCategoryModel)}.");
    }

    public override void Write(Utf8JsonWriter writer, CookieCategoryModel value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteBoolean(PropertyName(nameof(CookieCategoryModel.Enabled), options), value.Enabled);
        writer.WriteBoolean(PropertyName(nameof(CookieCategoryModel.ReadOnly), options), value.ReadOnly);
        writer.WriteEndObject();
    }

    private static bool ReadBoolean(ref Utf8JsonReader reader)
        => reader.TokenType switch
        {
            JsonTokenType.True => true,
            JsonTokenType.False => false,
            _ => false
        };

    private static string PropertyName(string name, JsonSerializerOptions options)
        => options.PropertyNamingPolicy?.ConvertName(name) ?? name;
}
