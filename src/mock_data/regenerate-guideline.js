const refinedRulesData = {
  base_rules: [
    {
      rule_name: "Barrier Islands Line Size Caps",
      rule_type: "pricing_coverage",
      definition: "This rule governs maximum line size capacity for barrier island risks to control concentration and construction-driven exposure in coastal territories.",
      short_description: "Barrier island risks are capped at $10M per line, and Monroe County, Florida is capped at $5M for MNC or better and $2.5M for Frame or JM construction.",
      rule_description: {
        description: "This rule establishes coastal capacity limits for apartments, condos, and hospitality risks located on barrier islands, with a stricter construction-based cap for Monroe County, Florida. It is operationally significant because it directly limits deployable insurance capacity in highly exposed coastal areas and requires underwriters to identify whether the location falls within the designated Monroe County ZIP code footprint.",
        threshold: "| Geography | Coverage Position | Construction | Maximum Line | Additional Requirement |\n|---|---|---|---|---|\n| Barrier Islands | Primary or Excess | All construction types | $10M Max Line | Applies under line size caps for Apartments, Condos and Hospitality by year built and construction |\n| Monroe County Florida | Not stated | MNC & Better | Max $5M | See attached Zip Codes List |\n| Monroe County Florida | Not stated | Frame/JM | $2.5M | See attached Zip Codes List |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33001 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33036 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33037 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33040 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33041 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33042 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33043 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33045 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33050 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33051 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33052 | County identification list |\n| Monroe County Florida ZIP Codes | Not stated | Not stated | 33070 | County identification list |"
      },
      confidence: {
        category: "terminology_clarity",
        score: 0.67,
        reason_and_steps_to_boost: "The line caps and county ZIP identifiers are stated verbatim, but the trigger phrase 'Barrier Islands' is not fully defined within the extracted pages and relies partly on the attached ZIP code reference. The term 'MNC & Better' is supported by the glossary, but the precise barrier island footprint outside Monroe County is not shown in this chunk. Confidence would improve by ingesting the referenced attached ZIP code list or territorial schedule defining all barrier island locations."
      },
      source_citation: {
        page_number: "page_1"
      }
    },
    {
      rule_name: "EIFS",
      rule_type: "triage",
      definition: "This rule governs acceptability and line size treatment for risks with EIFS cladding because EIFS materially affects construction hazard and portfolio quality.",
      short_description: "EIFS is prohibited on Frame or JM risks above stated TIV share thresholds, while certain MNC, FR, and superior construction risks are allowed with no max line size and a 15 to 20 percent modeling surcharge.",
      rule_description: {
        description: "This rule differentiates between prohibited and permitted EIFS exposures based on construction class, occupancy grouping, and building vintage. It is significant because it creates a hard ineligibility outcome for combustible construction at specified concentration levels while preserving capacity for better construction classes subject to modeled pricing adjustments.",
        threshold: "| EIFS Condition | Construction | Occupancy Group | Threshold / Qualification | Underwriting Outcome | Pricing / Capacity Note |\n|---|---|---|---|---|---|\n| EIFS present | Frame/JM | Apartments/Condos/Hospitality | When Location Values >10% of Scheduled TIV | Prohibited | Not stated |\n| EIFS present | Frame/JM | All Other Occupancies | When Location Values >25% | Prohibited | Not stated |\n| EIFS present | MNC/FR | Not stated | Pre-2000 | Allowed | No Max Line Size (15-20% surcharge on modeling) |\n| EIFS present | Superior Construction | Not stated | Post-2000 | Allowed | No Max Line Size (15-20% surcharge on modeling) |"
      },
      confidence: {
        category: "terminology_clarity",
        score: 0.66,
        reason_and_steps_to_boost: "The prohibition thresholds and surcharge range are stated directly, but 'Superior Construction' is an undefined programme-specific term in the extracted pages. The phrase 'sourced from SOV' indicates a source system rather than a coverage condition and does not impair the core rule. Confidence would improve with the carrier construction class mapping or glossary entry defining 'Superior Construction'."
      },
      source_citation: {
        page_number: "page_2"
      }
    },
    {
      rule_name: "Named Storm Deductible Minimums",
      rule_type: "pricing_coverage",
      definition: "This rule governs minimum named storm deductible requirements by state, county, construction type, and year built to align retained risk with catastrophe exposure.",
      short_description: "Named storm deductibles range from 1 percent to 10 percent depending on state, county, tier, construction, and year built, with approval requirements and flexibility notes for certain territories.",
      rule_description: {
        description: "This rule sets the minimum deductible structure for named storm exposure across multiple coastal and catastrophe-exposed territories. It is operationally significant because it defines the minimum retained amount required for quoting or binding wind-exposed property risks and introduces construction-specific, territorial, and authority-based variations that directly affect coverage terms.",
        threshold: "| Region / State | Sub-Region / County / Tier | Construction | Year Built | Minimum Deductible | Additional Condition / Outcome | Note |\n|---|---|---|---|---|---|---|\n| Florida | Monroe County (Keys) | Superior Construction | Not stated | 5% | Minimum deductible applies | Exception to 10% Monroe County rule |\n| Florida | Monroe County (Keys) | All other construction not stated as Superior Construction | Not stated | 10% | Minimum deductible applies | Not stated |\n| Florida | Miami-Dade, Broward, Palm Beach Counties | All construction types unless otherwise stated | Not stated | 5% | No less than 5% | Not stated |\n| Florida | Hillsborough & Pinellas | Frame/JM | Not stated | 5% | Minimum deductible applies | Not stated |\n| Florida | Hillsborough & Pinellas | MNC & Better | Not stated | 3% | Minimum deductible applies | Not stated |\n| Florida | Entire state of Florida except as noted | All construction types | Not stated | 3% | Minimum deductible applies | Broad state minimum |\n| Louisiana | Tier 1 | Frame/JM Construction Types | Not stated | 5% | Minimum deductible applies | Not stated |\n| Louisiana | Tier 1 | MNC or Better Construction Types | Not stated | 3% | Minimum deductible applies | Not stated |\n| Louisiana | Tier 2 | Frame or JM construction | Not stated | 2% | Minimum deductible applies | Not stated |\n| Texas | Galveston County | Frame/JM Construction Types | 1990 Year Built & Newer or Pre-1990 not separately stated | 5% | Minimum deductible applies | County-specific floor |\n| Texas | Statewide | All Construction Types | 1990 Year Built & Newer | 3% | Minimum deductible applies | Not stated |\n| Texas | Statewide | All Construction Types | Pre-1990 Year Built | 5% | Flexibility to come down to 3% if loss history is clean with Roof replacement in the past 10 years. | Not stated |\n| All other Cat Wind States (TX-MD, except as mentioned above) | MS - FL (Tier 1) | Frame or JM construction | Not stated | 3% | Minimum deductible applies | Not stated |\n| All other Cat Wind States (TX-MD, except as mentioned above) | GA \u2013 NC (Tier 1) | Frame or JM construction | Not stated | 2% | Minimum deductible applies | Not stated |\n| All other Cat Wind States (TX-MD, except as mentioned above) | VA - MD | All Construction Types | Not stated | 1% | Minimum deductible applies | Not stated |\n| All states TX-NC | Any state TX-NC where percentage deductible applies | All construction types | Not stated | $100,000 minimum per occurrence Named Storm deductible | More flexibility is allowed if the TIV is less than $25,000,000. | Applies for any percentage deductible |\n| Northeast (NJ to ME) | NJ to ME | All construction types | Not stated | $100,000 minimum flat dollar deductibles | Available subject to Senior Underwriter or higher approval. | Flat dollar option |\n| Long Island, NY | Hampton Bay and East | Not stated | Not stated | 2% | Push for 2%; can be flexible and quote 1% if needed, but 2% will sell. | Preference rather than absolute floor |\n| Long Island, NY | Long Island, NY | Not stated | Not stated | 1% Minimum | Minimum deductible applies | Not stated |\n| Hawaii | Hawaii | Not stated | Not stated | 2% Minimum | Minimum deductible applies | Not stated |"
      },
      confidence: {
        category: "decisional_clarity",
        score: 0.81,
        reason_and_steps_to_boost: "Most deductible values are verbatim, but several provisions use soft qualifiers that do not create a strictly deterministic action, including 'Flexibility to come down to 3%,' 'More flexibility is allowed,' and 'push for 2% ... can be flexible.' The Texas and Long Island provisions therefore require underwriting judgment beyond the stated thresholds. Confidence would improve by adding authority standards for when flexibility is permitted and defining whether the preferred Long Island 2% outcome is mandatory, referral-based, or discretionary."
      },
      source_citation: {
        page_number: "page_2"
      }
    },
    {
      rule_name: "Wind Driven Precipitation Rain",
      rule_type: "pricing_coverage",
      definition: "This rule governs sublimit availability and pricing treatment for wind driven precipitation coverage to manage attritional water intrusion exposure.",
      short_description: "Wind driven precipitation coverage allows no additional premium up to a $100,000 sublimit, charges 1 percent rate on line for extra limit, and calls for minimized sublimits on older or taller properties.",
      rule_description: {
        description: "This rule sets the coverage and pricing framework for wind driven precipitation or rain exposure by defining included capacity, pricing for added limit, and cautionary treatment for certain building profiles. It is significant because it affects both coverage structure and premium treatment for a peril extension that can materially change loss frequency and severity.",
        threshold: "| Coverage Element | Condition | Limit / Pricing | Underwriting Outcome | Note |\n|---|---|---|---|---|\n| Wind Driven Precipitation/Rain | No AP | up to $100k sublimit | Available with no additional premium | Not stated |\n| Wind Driven Precipitation/Rain | Additional limit above included sublimit | 1% ROL for additional limit | Charge additional premium | so $7,500 for $1M limit |\n| Wind Driven Precipitation/Rain | 2000 and older | Not stated | Minimize sublimit | Applies to older properties |\n| Wind Driven Precipitation/Rain | properties over 4 stories | Not stated | Minimize sublimit | Applies to taller properties |"
      },
      confidence: {
        category: "decisional_clarity",
        score: 0.87,
        reason_and_steps_to_boost: "The included sublimit and additional limit pricing are stated clearly, but 'Minimize sublimit' is a soft qualifier that does not specify a required sublimit or approval path. The example '$7,500 for $1M limit' is preserved as stated, but the operational action for older and taller properties remains discretionary. Confidence would improve by providing the target minimum or maximum sublimit for those property profiles."
      },
      source_citation: {
        page_number: "page_3"
      }
    },
    {
      rule_name: "Aluminum Wiring",
      rule_type: "triage",
      definition: "This rule governs eligibility and required structuring for risks with aluminum wiring because protected and unprotected aluminum wiring increases property loss exposure.",
      short_description: "Aluminum wiring is limited to 10 percent on multi-location schedules, single-location schedules are ineligible, quota share is mandatory for new and renewal all risk business, and unprotected wiring requires a $100,000 AOP deductible.",
      rule_description: {
        description: "This rule sets a combined eligibility, coverage applicability, and structuring framework for aluminum wiring exposures across all construction types. It is operationally significant because it imposes both a hard ineligibility boundary for certain schedule configurations and mandatory placement terms for otherwise acceptable all risk submissions.",
        threshold: "| Schedule Type | Aluminum Wiring Type | Construction | Coverage Applicability | Threshold / Requirement | Underwriting Outcome | Additional Term |\n|---|---|---|---|---|---|---|\n| Single Location schedules | Protected & Unprotected | all construction types | All Risk Coverage | Any aluminum wiring presence within stated rule context | INELIGIBLE | Max 10% allowance applies to Multi-Location schedules only. |\n| Multi-Location schedules | Protected & Unprotected | all construction types | All Risk Coverage | Max 10% Protected & Unprotected aluminum wiring | Eligible subject to cap | Does not apply to Wind/Hail Only. |\n| Renewal/New | Protected & Unprotected Aluminum Wiring | all construction types | All Risk Coverage | Mandatory Q/S position | Required structuring | Does not apply to Wind/Hail Only. |\n| Locations with unprotected aluminum wiring | Unprotected | all construction types | All Risk Coverage | Minimum $100k AOP deductible | Required deductible | Does not apply to Wind/Hail Only. |"
      },
      confidence: {
        category: "full",
        score: 0.96,
        reason_and_steps_to_boost: "The eligibility cap, single-location ineligibility, mandatory quota share position, coverage applicability, and minimum AOP deductible are all present in the extracted text. A minor formatting issue in the source created line breaks and bullet artifacts, but the threshold values and outcomes are not affected. Confidence would reach 1.00 with a cleaner source rendering of the bullet structure."
      },
      source_citation: {
        page_number: "page_3"
      }
    },
    {
      rule_name: "Vacancy",
      rule_type: "triage",
      definition: "This rule governs minimum occupancy requirements for AOP coverage to limit vacancy-driven deterioration and loss exposure.",
      short_description: "AOP coverage requires at least a 31 percent occupancy rate, while risks below 31 percent occupancy may be written only on a Windstorm or Hail Only basis.",
      rule_description: {
        description: "This rule establishes the occupancy threshold needed to support broader all other perils coverage and creates a restricted coverage pathway for more vacant risks. It is significant because it acts as a coverage eligibility screen that distinguishes between acceptable occupied property exposure and risks that can only be considered for limited peril capacity.",
        threshold: "| Coverage Requested | Occupancy Rate | Underwriting Outcome | Note |\n|---|---|---|---|\n| AOP Coverage | Minimum 31% Occupancy Rate | Eligible to provide AOP Coverage | except, |\n| Windstorm/Hail Only coverage | occupancy rates <31% | Permitted | Applies where AOP threshold is not met |"
      },
      confidence: {
        category: "full",
        score: 0.98,
        reason_and_steps_to_boost: "The occupancy trigger and resulting coverage outcomes are directly stated and operationally complete. The text includes a stray 'except,' but it does not alter the clear underwriting action. No further clarification is needed beyond routine source normalization."
      },
      source_citation: {
        page_number: "page_3"
      }
    },
    {
      rule_name: "Ineligible TX Counties",
      rule_type: "triage",
      definition: "This rule governs county-based ineligibility in Texas to prohibit submissions from designated counties across all occupancies and classes.",
      short_description: "Texas risks in Hidalgo, Cameron, Willacy, Kenedy, and Brooks counties are prohibited for any occupancy, except incidental exposure up to 10 percent of TIV is acceptable across all classes.",
      rule_description: {
        description: "This rule creates a territorial prohibition for specified Texas counties regardless of occupancy class while preserving a limited allowance for incidental exposure within broader schedules. It is operationally significant because it functions as a hard appetite boundary with a narrowly defined exception tied to total insured value concentration.",
        threshold: "| State | County | Occupancy | Class Applicability | TIV Condition | Underwriting Outcome | Note |\n|---|---|---|---|---|---|---|\n| Texas | Hidalgo | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Cameron | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Willacy | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Kenedy | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Brooks | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Hidalgo, Cameron, Willacy, Kenedy, Brooks | any occupancy | Applies to ALL Classes | incidental exposure of up to 10% of TIV | acceptable | Exception to county prohibition |"
      },
      confidence: {
        category: "full",
        score: 1,
        reason_and_steps_to_boost: "The prohibited counties begin on page 3 and the final county, Brooks, is completed on the bleed page, which is permitted for completion of a trailing rule. The prohibition and the incidental exposure exception are both stated verbatim and create a clear underwriting action. No limitation remains in the extracted rule."
      },
      source_citation: {
        page_number: "page_3"
      }
    }
  ],
  refined_rules: [
    {
      rule_name: "Barrier Islands Line Size Caps",
      rule_type: "pricing_coverage",
      definition: "This rule governs maximum line size capacity for barrier island risks to control concentration and construction-driven exposure in coastal territories.",
      short_description: "Barrier island risks are capped at $10M per line, with Monroe County, Florida limited to $5M for MNC or better construction quality and $2.5M for Frame or Joisted Masonry.",
      rule_description: {
        description: "This rule sets coastal capacity limits for apartments, condos, and hospitality risks on barrier islands, with stricter capacity limits for Monroe County, Florida based on construction quality. It is operationally significant because it restricts deployable insurance capacity in highly exposed coastal areas and requires underwriters to identify whether the location falls within the designated Monroe County ZIP code footprint.",
        threshold: "| Geography | Coverage Position | Construction | Maximum Line | Additional Requirement |\n|---|---|---|---|---|\n| Monroe County Florida | Not stated | Frame/JM | $2.5M | Monroe County ZIP codes: 33001, 33036, 33037, 33040, 33041, 33042, 33043, 33045, 33050, 33051, 33052, 33070 |\n| Monroe County Florida | Not stated | MNC & Better | Max $5M | Monroe County ZIP codes: 33001, 33036, 33037, 33040, 33041, 33042, 33043, 33045, 33050, 33051, 33052, 33070 |\n| Barrier Islands | Primary or Excess | All construction types | $10M Max Line | Applies under line size caps for Apartments, Condos and Hospitality by year built and construction |"
      },
      confidence: {
        category: "terminology_clarity",
        score: "0.72",
        reason_and_steps_to_boost: "Glossary support confirms that 'MNC & Better' means MNC or better construction quality, resolving that terminology issue. The remaining limitation is that 'Barrier Islands' is still not territorially defined within the provided rule set or glossary outside the Monroe County ZIP list. Confidence would move to full with the referenced territorial schedule or attached ZIP code list defining the full barrier island footprint."
      },
      source_citation: {
        page_number: "page_1"
      },
      refined: true
    },
    {
      rule_name: "EIFS",
      rule_type: "triage",
      definition: "This rule governs acceptability and line size treatment for risks with EIFS cladding because EIFS materially affects construction hazard and portfolio quality.",
      short_description: "EIFS is prohibited on Frame or JM risks above 10% or 25% TIV thresholds, while specified MNC, FR, and Superior Construction risks are allowed with no max line size and a 15% to 20% modeling surcharge.",
      rule_description: {
        description: "This rule differentiates between prohibited and permitted EIFS exposures based on construction class, occupancy grouping, and building vintage. It is significant because it creates a hard ineligibility outcome for combustible construction at specified concentration levels while preserving capacity for better construction classes subject to modeled pricing adjustments.",
        threshold: "| EIFS Condition | Construction | Occupancy Group | Threshold / Qualification | Underwriting Outcome | Pricing / Capacity Note |\n|---|---|---|---|---|---|\n| EIFS present | Frame/JM | Apartments/Condos/Hospitality | When Location Values >10% of Scheduled TIV | Prohibited | Not stated |\n| EIFS present | Frame/JM | All Other Occupancies | When Location Values >25% | Prohibited | Not stated |\n| EIFS present | MNC/FR | Not stated | Pre-2000 | Allowed | No Max Line Size (15-20% surcharge on modeling) |\n| EIFS present | Superior Construction | Not stated | Post-2000 | Allowed | No Max Line Size (15-20% surcharge on modeling) |"
      },
      confidence: {
        category: "full",
        score: "0.93",
        reason_and_steps_to_boost: "The glossary resolves both EIFS and 'Superior Construction,' with Superior Construction defined as MNC or better construction quality including MNC, MFR, and FR. The prohibition thresholds, permitted scenarios, and surcharge range are all directly supported and operationally usable. Confidence would increase slightly with direct source confirmation of whether the post-2000 row intends the glossary-equivalent class label or a narrower subset."
      },
      source_citation: {
        page_number: "page_2"
      },
      refined: true
    },
    {
      rule_name: "Named Storm Deductible Minimums",
      rule_type: "pricing_coverage",
      definition: "This rule governs minimum named storm deductible requirements by state, county, construction type, and year built to align retained risk with catastrophe exposure.",
      short_description: "Named storm deductibles range from 1% to 10% by state, county, wind tier, construction, and year built, with approval or flexibility provisions for selected territories.",
      rule_description: {
        description: "This rule sets the minimum deductible structure for named storm exposure across multiple coastal and catastrophe-exposed territories. It is operationally significant because it defines the minimum retained amount required for quoting or binding wind-exposed property risks and introduces construction-specific, territorial, and authority-based variations that directly affect coverage terms.",
        threshold: "| Region / State | Sub-Region / County / Tier | Construction | Year Built | Minimum Deductible | Additional Condition / Outcome | Note |\n|---|---|---|---|---|---|---|\n| Florida | Monroe County (Keys) | Superior Construction | Not stated | 5% | Minimum deductible applies | Exception to 10% Monroe County rule |\n| Florida | Monroe County (Keys) | All other construction not stated as Superior Construction | Not stated | 10% | Minimum deductible applies | Not stated |\n| Florida | Miami-Dade, Broward, Palm Beach Counties | All construction types unless otherwise stated | Not stated | 5% | No less than 5% | Not stated |\n| Florida | Hillsborough & Pinellas | Frame/JM | Not stated | 5% | Minimum deductible applies | Not stated |\n| Florida | Hillsborough & Pinellas | MNC & Better | Not stated | 3% | Minimum deductible applies | Not stated |\n| Florida | Entire state of Florida except as noted | All construction types | Not stated | 3% | Minimum deductible applies | Broad state minimum |\n| Louisiana | Tier 1 | Frame/JM Construction Types | Not stated | 5% | Minimum deductible applies | Not stated |\n| Louisiana | Tier 1 | MNC or Better Construction Types | Not stated | 3% | Minimum deductible applies | Not stated |\n| Louisiana | Tier 2 | Frame or JM construction | Not stated | 2% | Minimum deductible applies | Not stated |\n| Texas | Galveston County | Frame/JM Construction Types | 1990 Year Built & Newer or Pre-1990 not separately stated | 5% | Minimum deductible applies | County-specific floor |\n| Texas | Statewide | All Construction Types | 1990 Year Built & Newer | 3% | Minimum deductible applies | Not stated |\n| Texas | Statewide | All Construction Types | Pre-1990 Year Built | 5% | Flexibility to come down to 3% if loss history is clean with Roof replacement in the past 10 years. | Not stated |\n| All other Cat Wind States (TX-MD, except as mentioned above) | MS - FL (Tier 1) | Frame or JM construction | Not stated | 3% | Minimum deductible applies | Not stated |\n| All other Cat Wind States (TX-MD, except as mentioned above) | GA \u2013 NC (Tier 1) | Frame or JM construction | Not stated | 2% | Minimum deductible applies | Not stated |\n| All other Cat Wind States (TX-MD, except as mentioned above) | VA - MD | All Construction Types | Not stated | 1% | Minimum deductible applies | Not stated |\n| All states TX-NC | Any state TX-NC where percentage deductible applies | All construction types | Not stated | $100,000 minimum per occurrence Named Storm deductible | More flexibility is allowed if the TIV is less than $25,000,000. | Applies for any percentage deductible |\n| Northeast (NJ to ME) | NJ to ME | All construction types | Not stated | $100,000 minimum flat dollar deductibles | Available subject to Senior Underwriter or higher approval. | Flat dollar option |\n| Long Island, NY | Hampton Bay and East | Not stated | Not stated | 2% | Push for 2%; can be flexible and quote 1% if needed, but 2% will sell. | Preference rather than absolute floor |\n| Long Island, NY | Long Island, NY | Not stated | Not stated | 1% Minimum | Minimum deductible applies | Not stated |\n| Hawaii | Hawaii | Not stated | Not stated | 2% Minimum | Minimum deductible applies | Not stated |"
      },
      confidence: {
        category: "decisional_clarity",
        score: "0.83",
        reason_and_steps_to_boost: "Glossary support resolves 'Superior Construction' and wind tier terminology, so the remaining limitation is not terminology but underwriting discretion. Several rows still rely on non-deterministic language such as 'flexibility,' 'push for 2%,' and approval-based exceptions, which prevents fully automated actioning. Confidence would improve with explicit authority criteria for deductible reductions, preferred versus mandatory outcomes, and the approval level definition for the flat-dollar Northeast option."
      },
      source_citation: {
        page_number: "page_2"
      },
      refined: true
    },
    {
      rule_name: "Wind Driven Precipitation Rain",
      rule_type: "pricing_coverage",
      definition: "This rule governs sublimit availability and pricing treatment for wind driven precipitation coverage to manage attritional water intrusion exposure.",
      short_description: "Wind driven precipitation coverage includes up to a $100,000 sublimit at no additional premium, prices extra limit at 1% ROL, and calls for reduced sublimits on pre-2001 or over-4-story properties.",
      rule_description: {
        description: "This rule sets the coverage and pricing framework for wind driven precipitation or rain exposure by defining included capacity, pricing for added limit, and cautionary treatment for certain building profiles. It is significant because it affects both coverage structure and premium treatment for a peril extension that can materially change loss frequency and severity.",
        threshold: "| Coverage Element | Condition | Limit / Pricing | Underwriting Outcome | Note |\n|---|---|---|---|---|\n| Wind Driven Precipitation/Rain | No AP | up to $100k sublimit | Available with no additional premium | Not stated |\n| Wind Driven Precipitation/Rain | Additional limit above included sublimit | 1% ROL for additional limit | Charge additional premium | so $7,500 for $1M limit |\n| Wind Driven Precipitation/Rain | 2000 and older | Not stated | Minimize sublimit | Applies to older properties |\n| Wind Driven Precipitation/Rain | properties over 4 stories | Not stated | Minimize sublimit | Applies to taller properties |"
      },
      confidence: {
        category: "decisional_clarity",
        score: "0.87",
        reason_and_steps_to_boost: "The included sublimit and additional-limit pricing are directly stated and usable. The limiting issue remains the discretionary instruction to 'Minimize sublimit' for older and taller properties, which does not specify a required limit, cap, or referral standard. Confidence would improve with a defined reduced sublimit amount or an approval rule for those property profiles."
      },
      source_citation: {
        page_number: "page_3"
      },
      refined: true
    },
    {
      rule_name: "Aluminum Wiring",
      rule_type: "triage",
      definition: "This rule governs eligibility and required structuring for risks with aluminum wiring because protected and unprotected aluminum wiring increases property loss exposure.",
      short_description: "Aluminum wiring is ineligible for single-location all risk schedules, capped at 10% on multi-location all risk schedules, requires quota share on new and renewal all risk business, and requires a $100,000 AOP deductible for unprotected wiring.",
      rule_description: {
        description: "This rule sets a combined eligibility, coverage applicability, and structuring framework for aluminum wiring exposures across all construction types. It is operationally significant because it imposes both a hard ineligibility boundary for certain schedule configurations and mandatory placement terms for otherwise acceptable all risk submissions.",
        threshold: "| Schedule Type | Aluminum Wiring Type | Construction | Coverage Applicability | Threshold / Requirement | Underwriting Outcome | Additional Term |\n|---|---|---|---|---|---|---|\n| Single Location schedules | Protected & Unprotected | all construction types | All Risk Coverage | Any aluminum wiring presence within stated rule context | INELIGIBLE | Max 10% allowance applies to Multi-Location schedules only. |\n| Multi-Location schedules | Protected & Unprotected | all construction types | All Risk Coverage | Max 10% Protected & Unprotected aluminum wiring | Eligible subject to cap | Does not apply to Wind/Hail Only. |\n| Renewal/New | Protected & Unprotected Aluminum Wiring | all construction types | All Risk Coverage | Mandatory Q/S position | Required structuring | Does not apply to Wind/Hail Only. |\n| Locations with unprotected aluminum wiring | Unprotected | all construction types | All Risk Coverage | Minimum $100k AOP deductible | Required deductible | Does not apply to Wind/Hail Only. |"
      },
      confidence: {
        category: "full",
        score: "0.96",
        reason_and_steps_to_boost: "The eligibility cap, single-location ineligibility, mandatory quota share position, coverage applicability, and minimum AOP deductible are all present in the extracted text. The rule is operationally complete, and remaining issues are limited to source formatting artifacts rather than substantive ambiguity. Confidence would reach 1.00 with a cleaner source rendering of the original bullet structure."
      },
      source_citation: {
        page_number: "page_3"
      },
      refined: true
    },
    {
      rule_name: "Vacancy",
      rule_type: "triage",
      definition: "This rule governs minimum occupancy requirements for AOP coverage to limit vacancy-driven deterioration and loss exposure.",
      short_description: "AOP coverage requires at least 31% occupancy, while risks below 31% occupancy may be written only on a Windstorm or Hail Only basis.",
      rule_description: {
        description: "This rule establishes the occupancy threshold needed to support broader all other perils coverage and creates a restricted coverage pathway for more vacant risks. It is significant because it acts as a coverage eligibility screen that distinguishes between acceptable occupied property exposure and risks that can only be considered for limited peril capacity.",
        threshold: "| Coverage Requested | Occupancy Rate | Underwriting Outcome | Note |\n|---|---|---|---|\n| AOP Coverage | Minimum 31% Occupancy Rate | Eligible to provide AOP Coverage | Not stated |\n| Windstorm/Hail Only coverage | occupancy rates <31% | Permitted | Applies where AOP threshold is not met |"
      },
      confidence: {
        category: "full",
        score: "0.99",
        reason_and_steps_to_boost: "The occupancy trigger and resulting coverage outcomes are directly stated and operationally complete. The stray source artifact has been normalized without affecting the rule logic or thresholds. No substantive limitation remains beyond routine source verification."
      },
      source_citation: {
        page_number: "page_3"
      },
      refined: true
    },
    {
      rule_name: "Ineligible TX Counties",
      rule_type: "triage",
      definition: "This rule governs county-based ineligibility in Texas to prohibit submissions from designated counties across all occupancies and classes.",
      short_description: "Texas risks in Hidalgo, Cameron, Willacy, Kenedy, and Brooks counties are prohibited for any occupancy, except incidental exposure up to 10% of TIV is acceptable across all classes.",
      rule_description: {
        description: "This rule creates a territorial prohibition for specified Texas counties regardless of occupancy class while preserving a limited allowance for incidental exposure within broader schedules. It is operationally significant because it functions as a hard appetite boundary with a narrowly defined exception tied to total insured value concentration.",
        threshold: "| State | County | Occupancy | Class Applicability | TIV Condition | Underwriting Outcome | Note |\n|---|---|---|---|---|---|---|\n| Texas | Hidalgo | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Cameron | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Willacy | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Kenedy | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Brooks | any occupancy | Applies to ALL Classes | Direct county exposure | prohibited | incidental exposure of up to 10% of TIV is acceptable |\n| Texas | Hidalgo, Cameron, Willacy, Kenedy, Brooks | any occupancy | Applies to ALL Classes | incidental exposure of up to 10% of TIV | acceptable | Exception to county prohibition |"
      },
      confidence: {
        category: "full",
        score: "1.00",
        reason_and_steps_to_boost: "The prohibited counties and the incidental exposure exception are both stated verbatim and produce a clear underwriting action. The trailing county completion from the following page does not introduce threshold uncertainty. No material limitation remains in the refined rule."
      },
      source_citation: {
        page_number: "page_3"
      },
      refined: false
    }
  ]
};

export default refinedRulesData;