const rulesData = [
  {
    rule_name: "Barrier Islands Line Size Caps",
    rule_type: "pricing_coverage",
    definition:
      "This rule governs maximum line size capacity for barrier island risks to control concentration and construction-driven exposure in coastal territories.",
    short_description:
      "Barrier island risks are capped at $10M per line, and Monroe County, Florida is capped at $5M for MNC or better and $2.5M for Frame or JM construction.",
    rule_description: {
      description:
        "This rule establishes coastal capacity limits for apartments, condos, and hospitality risks located on barrier islands, with a stricter construction-based cap for Monroe County, Florida. It is operationally significant because it directly limits deployable insurance capacity in highly exposed coastal areas and requires underwriters to identify whether the location falls within the designated Monroe County ZIP code footprint.",
      threshold: [
        {
          geography: "Barrier Islands",
          coverage_position: "Primary or Excess",
          construction: "All construction types",
          maximum_line: "$10M Max Line",
          additional_requirement:
            "Applies under line size caps for Apartments, Condos and Hospitality by year built and construction",
        },
        {
          geography: "Monroe County Florida",
          coverage_position: "Not stated",
          construction: "MNC & Better",
          maximum_line: "Max $5M",
          additional_requirement: "See attached Zip Codes List",
        },
        {
          geography: "Monroe County Florida",
          coverage_position: "Not stated",
          construction: "Frame/JM",
          maximum_line: "$2.5M",
          additional_requirement: "See attached Zip Codes List",
        },
        {
          geography: "Monroe County Florida ZIP Codes",
          coverage_position: "Not stated",
          construction: "Not stated",
          zip_codes: [
            33001, 33036, 33037, 33040, 33041, 33042, 33043, 33045, 33050,
            33051, 33052, 33070,
          ],
          note: "County identification list",
        },
      ],
    },
    confidence: {
      category: "terminology_clarity",
      score: 0.67,
      reason_and_steps_to_boost:
        "The line caps and county ZIP identifiers are stated verbatim, but the trigger phrase 'Barrier Islands' is not fully defined within the extracted pages and relies partly on the attached ZIP code reference. The term 'MNC & Better' is supported by the glossary, but the precise barrier island footprint outside Monroe County is not shown in this chunk. Confidence would improve by ingesting the referenced attached ZIP code list or territorial schedule defining all barrier island locations.",
    },
    source_citation: {
      page_number: "page_1",
    },
  },
  {
    rule_name: "EIFS",
    rule_type: "triage",
    definition:
      "This rule governs acceptability and line size treatment for risks with EIFS cladding because EIFS materially affects construction hazard and portfolio quality.",
    short_description:
      "EIFS is prohibited on Frame or JM risks above stated TIV share thresholds, while certain MNC, FR, and superior construction risks are allowed with no max line size and a 15 to 20 percent modeling surcharge.",
    rule_description: {
      description:
        "This rule differentiates between prohibited and permitted EIFS exposures based on construction class, occupancy grouping, and building vintage. It is significant because it creates a hard ineligibility outcome for combustible construction at specified concentration levels while preserving capacity for better construction classes subject to modeled pricing adjustments.",
      threshold: [
        {
          eifs_condition: "EIFS present",
          construction: "Frame/JM",
          occupancy_group: "Apartments/Condos/Hospitality",
          threshold_qualification: "When Location Values >10% of Scheduled TIV",
          underwriting_outcome: "Prohibited",
          pricing_capacity_note: "Not stated",
        },
        {
          eifs_condition: "EIFS present",
          construction: "Frame/JM",
          occupancy_group: "All Other Occupancies",
          threshold_qualification: "When Location Values >25%",
          underwriting_outcome: "Prohibited",
          pricing_capacity_note: "Not stated",
        },
        {
          eifs_condition: "EIFS present",
          construction: "MNC/FR",
          occupancy_group: "Not stated",
          threshold_qualification: "Pre-2000",
          underwriting_outcome: "Allowed",
          pricing_capacity_note: "No Max Line Size (15-20% surcharge on modeling)",
        },
        {
          eifs_condition: "EIFS present",
          construction: "Superior Construction",
          occupancy_group: "Not stated",
          threshold_qualification: "Post-2000",
          underwriting_outcome: "Allowed",
          pricing_capacity_note: "No Max Line Size (15-20% surcharge on modeling)",
        },
      ],
    },
    confidence: {
      category: "terminology_clarity",
      score: 0.66,
      reason_and_steps_to_boost:
        "The prohibition thresholds and surcharge range are stated directly, but 'Superior Construction' is an undefined programme-specific term in the extracted pages. The phrase 'sourced from SOV' indicates a source system rather than a coverage condition and does not impair the core rule. Confidence would improve with the carrier construction class mapping or glossary entry defining 'Superior Construction'.",
    },
    source_citation: {
      page_number: "page_2",
    },
  },
  {
    rule_name: "Named Storm Deductible Minimums",
    rule_type: "pricing_coverage",
    definition:
      "This rule governs minimum named storm deductible requirements by state, county, construction type, and year built to align retained risk with catastrophe exposure.",
    short_description:
      "Named storm deductibles range from 1 percent to 10 percent depending on state, county, tier, construction, and year built, with approval requirements and flexibility notes for certain territories.",
    rule_description: {
      description:
        "This rule sets the minimum deductible structure for named storm exposure across multiple coastal and catastrophe-exposed territories. It is operationally significant because it defines the minimum retained amount required for quoting or binding wind-exposed property risks and introduces construction-specific, territorial, and authority-based variations that directly affect coverage terms.",
      threshold: [
        {
          region_state: "Florida",
          sub_region: "Monroe County (Keys)",
          construction: "Superior Construction",
          year_built: "Not stated",
          minimum_deductible: "5%",
          additional_condition: "Minimum deductible applies",
          note: "Exception to 10% Monroe County rule",
        },
        {
          region_state: "Florida",
          sub_region: "Monroe County (Keys)",
          construction: "All other construction not stated as Superior Construction",
          year_built: "Not stated",
          minimum_deductible: "10%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Florida",
          sub_region: "Miami-Dade, Broward, Palm Beach Counties",
          construction: "All construction types unless otherwise stated",
          year_built: "Not stated",
          minimum_deductible: "5%",
          additional_condition: "No less than 5%",
          note: "Not stated",
        },
        {
          region_state: "Florida",
          sub_region: "Hillsborough & Pinellas",
          construction: "Frame/JM",
          year_built: "Not stated",
          minimum_deductible: "5%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Florida",
          sub_region: "Hillsborough & Pinellas",
          construction: "MNC & Better",
          year_built: "Not stated",
          minimum_deductible: "3%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Florida",
          sub_region: "Entire state of Florida except as noted",
          construction: "All construction types",
          year_built: "Not stated",
          minimum_deductible: "3%",
          additional_condition: "Minimum deductible applies",
          note: "Broad state minimum",
        },
        {
          region_state: "Louisiana",
          sub_region: "Tier 1",
          construction: "Frame/JM Construction Types",
          year_built: "Not stated",
          minimum_deductible: "5%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Louisiana",
          sub_region: "Tier 1",
          construction: "MNC or Better Construction Types",
          year_built: "Not stated",
          minimum_deductible: "3%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Louisiana",
          sub_region: "Tier 2",
          construction: "Frame or JM construction",
          year_built: "Not stated",
          minimum_deductible: "2%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Texas",
          sub_region: "Galveston County",
          construction: "Frame/JM Construction Types",
          year_built: "1990 Year Built & Newer or Pre-1990 not separately stated",
          minimum_deductible: "5%",
          additional_condition: "Minimum deductible applies",
          note: "County-specific floor",
        },
        {
          region_state: "Texas",
          sub_region: "Statewide",
          construction: "All Construction Types",
          year_built: "1990 Year Built & Newer",
          minimum_deductible: "3%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Texas",
          sub_region: "Statewide",
          construction: "All Construction Types",
          year_built: "Pre-1990 Year Built",
          minimum_deductible: "5%",
          additional_condition:
            "Flexibility to come down to 3% if loss history is clean with Roof replacement in the past 10 years.",
          note: "Not stated",
        },
        {
          region_state: "All other Cat Wind States (TX-MD, except as mentioned above)",
          sub_region: "MS - FL (Tier 1)",
          construction: "Frame or JM construction",
          year_built: "Not stated",
          minimum_deductible: "3%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "All other Cat Wind States (TX-MD, except as mentioned above)",
          sub_region: "GA - NC (Tier 1)",
          construction: "Frame or JM construction",
          year_built: "Not stated",
          minimum_deductible: "2%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "All other Cat Wind States (TX-MD, except as mentioned above)",
          sub_region: "VA - MD",
          construction: "All Construction Types",
          year_built: "Not stated",
          minimum_deductible: "1%",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "All states TX-NC",
          sub_region: "Any state TX-NC where percentage deductible applies",
          construction: "All construction types",
          year_built: "Not stated",
          minimum_deductible: "$100,000 minimum per occurrence Named Storm deductible",
          additional_condition:
            "More flexibility is allowed if the TIV is less than $25,000,000.",
          note: "Applies for any percentage deductible",
        },
        {
          region_state: "Northeast (NJ to ME)",
          sub_region: "NJ to ME",
          construction: "All construction types",
          year_built: "Not stated",
          minimum_deductible: "$100,000 minimum flat dollar deductibles",
          additional_condition:
            "Available subject to Senior Underwriter or higher approval.",
          note: "Flat dollar option",
        },
        {
          region_state: "Long Island, NY",
          sub_region: "Hampton Bay and East",
          construction: "Not stated",
          year_built: "Not stated",
          minimum_deductible: "2%",
          additional_condition:
            "Push for 2%; can be flexible and quote 1% if needed, but 2% will sell.",
          note: "Preference rather than absolute floor",
        },
        {
          region_state: "Long Island, NY",
          sub_region: "Long Island, NY",
          construction: "Not stated",
          year_built: "Not stated",
          minimum_deductible: "1% Minimum",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
        {
          region_state: "Hawaii",
          sub_region: "Hawaii",
          construction: "Not stated",
          year_built: "Not stated",
          minimum_deductible: "2% Minimum",
          additional_condition: "Minimum deductible applies",
          note: "Not stated",
        },
      ],
    },
    confidence: {
      category: "decisional_clarity",
      score: 0.81,
      reason_and_steps_to_boost:
        "Most deductible values are verbatim, but several provisions use soft qualifiers that do not create a strictly deterministic action, including 'Flexibility to come down to 3%,' 'More flexibility is allowed,' and 'push for 2% ... can be flexible.' The Texas and Long Island provisions therefore require underwriting judgment beyond the stated thresholds. Confidence would improve by adding authority standards for when flexibility is permitted and defining whether the preferred Long Island 2% outcome is mandatory, referral-based, or discretionary.",
    },
    source_citation: {
      page_number: "page_2",
    },
  },
  {
    rule_name: "Wind Driven Precipitation Rain",
    rule_type: "pricing_coverage",
    definition:
      "This rule governs sublimit availability and pricing treatment for wind driven precipitation coverage to manage attritional water intrusion exposure.",
    short_description:
      "Wind driven precipitation coverage allows no additional premium up to a $100,000 sublimit, charges 1 percent rate on line for extra limit, and calls for minimized sublimits on older or taller properties.",
    rule_description: {
      description:
        "This rule sets the coverage and pricing framework for wind driven precipitation or rain exposure by defining included capacity, pricing for added limit, and cautionary treatment for certain building profiles. It is significant because it affects both coverage structure and premium treatment for a peril extension that can materially change loss frequency and severity.",
      threshold: [
        {
          coverage_element: "Wind Driven Precipitation/Rain",
          condition: "No AP",
          limit_pricing: "Up to $100k sublimit",
          underwriting_outcome: "Available with no additional premium",
          note: "Not stated",
        },
        {
          coverage_element: "Wind Driven Precipitation/Rain",
          condition: "Additional limit above included sublimit",
          limit_pricing: "1% ROL for additional limit",
          underwriting_outcome: "Charge additional premium",
          note: "So $7,500 for $1M limit",
        },
        {
          coverage_element: "Wind Driven Precipitation/Rain",
          condition: "2000 and older",
          limit_pricing: "Not stated",
          underwriting_outcome: "Minimize sublimit",
          note: "Applies to older properties",
        },
        {
          coverage_element: "Wind Driven Precipitation/Rain",
          condition: "Properties over 4 stories",
          limit_pricing: "Not stated",
          underwriting_outcome: "Minimize sublimit",
          note: "Applies to taller properties",
        },
      ],
    },
    confidence: {
      category: "decisional_clarity",
      score: 0.87,
      reason_and_steps_to_boost:
        "The included sublimit and additional limit pricing are stated clearly, but 'Minimize sublimit' is a soft qualifier that does not specify a required sublimit or approval path. The example '$7,500 for $1M limit' is preserved as stated, but the operational action for older and taller properties remains discretionary. Confidence would improve by providing the target minimum or maximum sublimit for those property profiles.",
    },
    source_citation: {
      page_number: "page_3",
    },
  },
  {
    rule_name: "Aluminum Wiring",
    rule_type: "triage",
    definition:
      "This rule governs eligibility and required structuring for risks with aluminum wiring because protected and unprotected aluminum wiring increases property loss exposure.",
    short_description:
      "Aluminum wiring is limited to 10 percent on multi-location schedules, single-location schedules are ineligible, quota share is mandatory for new and renewal all risk business, and unprotected wiring requires a $100,000 AOP deductible.",
    rule_description: {
      description:
        "This rule sets a combined eligibility, coverage applicability, and structuring framework for aluminum wiring exposures across all construction types. It is operationally significant because it imposes both a hard ineligibility boundary for certain schedule configurations and mandatory placement terms for otherwise acceptable all risk submissions.",
      threshold: [
        {
          schedule_type: "Single Location schedules",
          aluminum_wiring_type: "Protected & Unprotected",
          construction: "All construction types",
          coverage_applicability: "All Risk Coverage",
          threshold_requirement: "Any aluminum wiring presence within stated rule context",
          underwriting_outcome: "INELIGIBLE",
          additional_term: "Max 10% allowance applies to Multi-Location schedules only.",
        },
        {
          schedule_type: "Multi-Location schedules",
          aluminum_wiring_type: "Protected & Unprotected",
          construction: "All construction types",
          coverage_applicability: "All Risk Coverage",
          threshold_requirement: "Max 10% Protected & Unprotected aluminum wiring",
          underwriting_outcome: "Eligible subject to cap",
          additional_term: "Does not apply to Wind/Hail Only.",
        },
        {
          schedule_type: "Renewal/New",
          aluminum_wiring_type: "Protected & Unprotected Aluminum Wiring",
          construction: "All construction types",
          coverage_applicability: "All Risk Coverage",
          threshold_requirement: "Mandatory Q/S position",
          underwriting_outcome: "Required structuring",
          additional_term: "Does not apply to Wind/Hail Only.",
        },
        {
          schedule_type: "Locations with unprotected aluminum wiring",
          aluminum_wiring_type: "Unprotected",
          construction: "All construction types",
          coverage_applicability: "All Risk Coverage",
          threshold_requirement: "Minimum $100k AOP deductible",
          underwriting_outcome: "Required deductible",
          additional_term: "Does not apply to Wind/Hail Only.",
        },
      ],
    },
    confidence: {
      category: "full",
      score: 0.96,
      reason_and_steps_to_boost:
        "The eligibility cap, single-location ineligibility, mandatory quota share position, coverage applicability, and minimum AOP deductible are all present in the extracted text. A minor formatting issue in the source created line breaks and bullet artifacts, but the threshold values and outcomes are not affected. Confidence would reach 1.00 with a cleaner source rendering of the bullet structure.",
    },
    source_citation: {
      page_number: "page_3",
    },
  },
  {
    rule_name: "Vacancy",
    rule_type: "triage",
    definition:
      "This rule governs minimum occupancy requirements for AOP coverage to limit vacancy-driven deterioration and loss exposure.",
    short_description:
      "AOP coverage requires at least a 31 percent occupancy rate, while risks below 31 percent occupancy may be written only on a Windstorm or Hail Only basis.",
    rule_description: {
      description:
        "This rule establishes the occupancy threshold needed to support broader all other perils coverage and creates a restricted coverage pathway for more vacant risks. It is significant because it acts as a coverage eligibility screen that distinguishes between acceptable occupied property exposure and risks that can only be considered for limited peril capacity.",
      threshold: [
        {
          coverage_requested: "AOP Coverage",
          occupancy_rate: "Minimum 31% Occupancy Rate",
          underwriting_outcome: "Eligible to provide AOP Coverage",
          note: "except,",
        },
        {
          coverage_requested: "Windstorm/Hail Only coverage",
          occupancy_rate: "occupancy rates <31%",
          underwriting_outcome: "Permitted",
          note: "Applies where AOP threshold is not met",
        },
      ],
    },
    confidence: {
      category: "full",
      score: 0.98,
      reason_and_steps_to_boost:
        "The occupancy trigger and resulting coverage outcomes are directly stated and operationally complete. The text includes a stray 'except,' but it does not alter the clear underwriting action. No further clarification is needed beyond routine source normalization.",
    },
    source_citation: {
      page_number: "page_3",
    },
  },
  {
    rule_name: "Ineligible TX Counties",
    rule_type: "triage",
    definition:
      "This rule governs county-based ineligibility in Texas to prohibit submissions from designated counties across all occupancies and classes.",
    short_description:
      "Texas risks in Hidalgo, Cameron, Willacy, Kenedy, and Brooks counties are prohibited for any occupancy, except incidental exposure up to 10 percent of TIV is acceptable across all classes.",
    rule_description: {
      description:
        "This rule creates a territorial prohibition for specified Texas counties regardless of occupancy class while preserving a limited allowance for incidental exposure within broader schedules. It is operationally significant because it functions as a hard appetite boundary with a narrowly defined exception tied to total insured value concentration.",
      threshold: [
        {
          state: "Texas",
          county: "Hidalgo",
          occupancy: "Any occupancy",
          class_applicability: "Applies to ALL Classes",
          tiv_condition: "Direct county exposure",
          underwriting_outcome: "Prohibited",
          note: "Incidental exposure of up to 10% of TIV is acceptable",
        },
        {
          state: "Texas",
          county: "Cameron",
          occupancy: "Any occupancy",
          class_applicability: "Applies to ALL Classes",
          tiv_condition: "Direct county exposure",
          underwriting_outcome: "Prohibited",
          note: "Incidental exposure of up to 10% of TIV is acceptable",
        },
        {
          state: "Texas",
          county: "Willacy",
          occupancy: "Any occupancy",
          class_applicability: "Applies to ALL Classes",
          tiv_condition: "Direct county exposure",
          underwriting_outcome: "Prohibited",
          note: "Incidental exposure of up to 10% of TIV is acceptable",
        },
        {
          state: "Texas",
          county: "Kenedy",
          occupancy: "Any occupancy",
          class_applicability: "Applies to ALL Classes",
          tiv_condition: "Direct county exposure",
          underwriting_outcome: "Prohibited",
          note: "Incidental exposure of up to 10% of TIV is acceptable",
        },
        {
          state: "Texas",
          county: "Brooks",
          occupancy: "Any occupancy",
          class_applicability: "Applies to ALL Classes",
          tiv_condition: "Direct county exposure",
          underwriting_outcome: "Prohibited",
          note: "Incidental exposure of up to 10% of TIV is acceptable",
        },
        {
          state: "Texas",
          county: "Hidalgo, Cameron, Willacy, Kenedy, Brooks",
          occupancy: "Any occupancy",
          class_applicability: "Applies to ALL Classes",
          tiv_condition: "Incidental exposure of up to 10% of TIV",
          underwriting_outcome: "Acceptable",
          note: "Exception to county prohibition",
        },
      ],
    },
    confidence: {
      category: "full",
      score: 1,
      reason_and_steps_to_boost:
        "The prohibited counties begin on page 3 and the final county, Brooks, is completed on the bleed page, which is permitted for completion of a trailing rule. The prohibition and the incidental exposure exception are both stated verbatim and create a clear underwriting action. No limitation remains in the extracted rule.",
    },
    source_citation: {
      page_number: "page_3",
    },
  },
];

export default rulesData;