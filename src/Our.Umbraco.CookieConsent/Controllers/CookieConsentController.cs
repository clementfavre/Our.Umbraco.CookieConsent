using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.CookieConsent.Interfaces;
using Our.Umbraco.CookieConsent.Models;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Web.Common.Attributes;

namespace Our.Umbraco.CookieConsent.Controllers;

[IsBackOffice]
[JsonCamelCaseFormatter]
public class CookieConsentController : UmbracoAuthorizedJsonController
{
    private readonly ICookieConsentService _cookieConsentService;

    public CookieConsentController(ICookieConsentService cookieConsentService)
    => _cookieConsentService = cookieConsentService;

    [HttpGet]
    public CookieConsentSettingsModel GetSettings()
    => _cookieConsentService.GetSettings();

    [HttpPost]
    public IActionResult SaveSettings([FromBody] CookieConsentSettingsModel settings)
    {
        if (settings == null)
            return BadRequest("Invalid settings provided.");

        try
        {
            _cookieConsentService.SaveSettings(settings);
            return Ok("Settings have been successfully saved.");
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to save the settings.");
        }
    }

    [HttpGet]
    public IActionResult ResetSettings()
    {
        try
        {
            _cookieConsentService.ResetSettings();
            return Ok(_cookieConsentService.GetSettings());
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to reset the settings.");
        }
    }
}