using System.ComponentModel.DataAnnotations;

namespace Our.Umbraco.CookieConsent.Models;

public class ComplianceOptionsModel
{
    public int Revision { get; set; }
    public ConsentMode Mode { get; set; }
    public bool AutoShow { get; set; } = true;
    public bool HideFromBots { get; set; } = true;
}

public enum ConsentMode
{
    [Display(Name = "opt-in")]
    OptIn,
    [Display(Name = "opt-out")]
    OptOut
}
