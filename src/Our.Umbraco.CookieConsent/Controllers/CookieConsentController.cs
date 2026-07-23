using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.CookieConsent.Interfaces;
using Our.Umbraco.CookieConsent.Models;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Web.Common.Authorization;

namespace Our.Umbraco.CookieConsent.Controllers;

/// <summary>
/// Backoffice endpoints for the dashboard, served under
/// /umbraco/management/api/v1/cookie-consent
/// </summary>
[ApiController]
[VersionedApiBackOfficeRoute("cookie-consent")]
[MapToApi(CookieConsentApiConfiguration.ApiName)]
[Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
public class CookieConsentController : ManagementApiControllerBase
{
    private readonly ICookieConsentService _cookieConsentService;

    public CookieConsentController(ICookieConsentService cookieConsentService)
    => _cookieConsentService = cookieConsentService;

    [HttpGet("settings")]
    [ProducesResponseType(typeof(CookieConsentSettingsModel), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings()
    => Ok(await _cookieConsentService.GetSettingsAsync());

    [HttpPost("settings")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SaveSettings([FromBody] CookieConsentSettingsModel settings)
    {
        if (settings == null)
            return BadRequest("Invalid settings provided.");

        try
        {
            await _cookieConsentService.SaveSettingsAsync(settings);
            return Ok();
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to save the settings.");
        }
    }

    [HttpPost("settings/reset")]
    [ProducesResponseType(typeof(CookieConsentSettingsModel), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetSettings()
    {
        try
        {
            return Ok(await _cookieConsentService.ResetSettingsAsync());
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to reset the settings.");
        }
    }
}
