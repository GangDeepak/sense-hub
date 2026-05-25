export interface ApiTool {
  name?: string;
  type: string;
  parameters: any;
  definition: string;
  use_this_tool_when: string;
  do_not_use_this_tool_when: string;
  response_field_description: string;
  short_description: string;
  prompt_instructions: string | null;
  filter_data: {
    enabled: boolean;
    char_threshold: number | null;
  };
  data_path_sequence: string[];
  post_processing: any | null;
  flatten: {
    enabled: boolean;
    child_list_field: string | null;
    preserve_parent_fields: string[];
  };
  drop_if_equals: any | null;
  remove_fields: string[] | null;
  sorting: {
    enabled: boolean;
    column: string | null;
    order: string | null;
    data_type: string | null;
    format: string | null;
  };
}

export const API_TOOLS: Record<string, ApiTool> = {
  exposure_profile: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/exposure-profile"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            },
            "email-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {},
          "required": []
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "- Retrieves high-level summary statistics of exposure characteristics only. Returns aggregate metrics only—no location-level details.\n",
    "use_this_tool_when": "- Count of number of locations\n- Total TIV (Total Insured Value) across all locations. And not location-wise.\n- Overall sprinkler protection percentage. And not location-wise.\n- Average PSF (price per square foot) metrics\n- Average EPSF (expected price per square foot)\n- Overall PSF deviation from benchmark\n- Average rental value\n- Simple, single-number answers about the entire portfolio\n- Questions like: 'how many locations?', 'what's the total TIV?', 'average PSF?'\n",
    "do_not_use_this_tool_when": "- User needs location-specific details or breakdowns (use exposure_data)\n- User asks for lists, examples, or 'show me' queries (use exposure_data)\n- User needs maximum line calculations (use fetch_potential_max_line)\n- User wants construction/occupancy distributions with detail (use exposure_data)\n- Any reasoning, interpretation, or judgment is required\n",
    "response_field_description": "- number_of_locations (integer): Total count of insured properties\n- total_tiv (number): Aggregate Total Insured Value\n- sprinklers (string): Percentage of locations with sprinkler systems\n- eifs (string): EIFS (Exterior Insulation Finish System) availability summary\n- psf (number): Average insured value per square foot\n- average_epsf (number): Average expected value per square foot benchmark\n- psf_diff (number): Difference between actual PSF and expected EPSF\n- avg_rent (number): Average rental value per square foot\n",
    "short_description": "- Retrieves exposure profile analytics for a transaction, summarizing insured location characteristics, valuation adequacy, construction and occupancy mix, geographic concentration, and key underwriting risk indicators. Supports underwriting decisions by highlighting exposure concentrations, benchmark deviations, and compliance with underwriting thresholds.\n",
    "prompt_instructions": null,
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data.exposure_profile"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": [
      "exposure_profile_indicators"
    ],
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  exposure_data: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/exposure-data"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "- Retrieves comprehensive location-level exposure data. And is required for location based analysis.\n",
    "use_this_tool_when": "- Location-level or building-level property information\n- Specific property attributes (addresses, construction type, occupancy, year built, square footage)\n- Information regarding Location is required to check student/subsidized housing, distance to coast, or comparison of the account location with other locations with web search\n- Individual location valuations or TIV breakdowns\n- Construction or occupancy distributions with underlying detail\n- Roof conditions, structure counts, or physical characteristics\n- Geographic data (coordinates, addresses, counties)\n- Hazard related questions (Earthquake, Wildfire, Flood, Wind related risks)\n- Valuation metrics like PSF, EPSF, or deviation analysis\n- Questions requiring drilling into specific locations\n- Requests to 'show me', 'list', 'breakdown by location', 'what are the properties'\n- Analysis requiring grouping or filtering of locations by attributes\n",
    "do_not_use_this_tool_when": "- User only needs high-level summary statistics (use exposure_profile)\n- User wants maximum line or EPSF averages only (use fetch_potential_max_line)\n- Question can be answered with aggregate numbers alone\n",
    "response_field_description": "- sov_id (string): Unique location identifier\n- tiv (number): Total Insured Value\n- construction_type (string): Construction classification\n- air_occupancy_code (number): AIR standardized occupancy code\n- air_occupancy (string): AIR standardized occupancy\n- air_construction_code (number): AIR standardized construction code\n- iso_construction_code (number): ISO standardized construction code\n- iso_description (string): ISO standardized construction classification\n- vac_occupancy_type (string): \n- vac_construction_type (string): \n- location_name (string): Location identifiers\n- location_number (string): Location identifiers\n- full_street_address (string): Address components\n- county (string): Address components\n- state (string): Address components\n- city (string): Address components\n- zip_code (string): Address components\n- latitude (string): Coordinates\n- longitude (string): Coordinates\n- roof_replacement_year (string): Roof attributes\n- air_construction_description (string): AIR standardized construction description\n- air_construction_type (string): AIR standardized construction type\n- air_occupancy_description (string): AIR standardized occupancy description\n- year_built (integer): Construction year\n- year_bucket (string): Year bucket by construction year\n- duplicate_flag (boolean/string): Data quality indicator\n- building_value (number): Coverage breakdown\n- contents_value (number): Coverage breakdown\n- bi_rental_value (number): Coverage breakdown\n- m_and_e_value (number): Limit breakdown\n- other_value (number): Limit breakdown\n- sprinkler_presence (string): Protection features\n- sprinkler_percent (string): Percentage of sprinker protected\n- square_footage (number): Physical size\n- psf (number): Per square foot metric\n- tier_classification (string): Ranking for wind hazard\n- eifs (string): Protection features\n- avg_rent (number):  Average rent\n- stories (string): No. of stories\n- fire_pml (number): Fire loss estimates\n- max_fire_pml_exposed (number): Fire loss estimates\n- epsf (number): Expected per square foot metric\n- weighting_factor (number): \n- weighted_target_itv (number):\n- eq_zone (string): Ranking for earthquake hazard\n- fema_flood_zone (string): Ranking for Flood hazard\n- fema_wildfire_zone (string): Ranking for wildfire hazard\n- crime_grade (string)\": Ranking for criminal activities\n- itv_deviation (string): Variance from benchmark\n- aal (string): Average Annual Loss estimate\n- roof_condition_or_cape_score (string): Excellent/Good/Fair/Poor assessment\n- cape_structure_count (integer): Number of structures\n- risk_count (number): \n- cape_url (string): Link to third-party property intelligence\n- full_address (string): Complete address\n- building_number (string): Identifiers\n- country (string): Geographic identifiers\n- number_of_units (string): Physical size\n- currency (string): Valuation currency\n- other_value_type (number): Limit breakdown\n- property_type (string): Property classification\n- sov_occupancy_description (string): Occupancy details\n- percentage_occupied (string): Percentage occupied per location (100 - vacant)%\n- year_updated (string): Age and renovation\n- sov_construction_description (string): Construction details\n- roof_shape (string): Roof attributes\n- roof_material (string): Roof attributes\n- duplicate_counter (boolean): Data quality indicator\n- street_address (string): Address components\n- house_number (string): Address components\n- number_of_buildings (string): No. of building in the location\n- gross_total (number): Total premium contribution\n- aal_rate_xif (number): AAL rate\n- soil_type (string): Soil classification\n- liquefaction (string): Liquefaction risk indicator\n- cresta (string): CRESTA zone\n- flood_risk_score (number): Composite flood risk score\n- elevation (string): Elevation band\n- fema_zone (string): FEMA zone\n- distance_to_coast (number): Distance to coast from the location\n- wildfire_score (number): Wildfire Score\n- wildfire_category (string): Wildfire category\n- \n- total_tiv_share_percent(string): Percentage of the portfolio's total TIV represented by this location.\n",
    "short_description": "- Retrieves detailed Statement of Values (SOV) location- and building-level exposure records for a transaction, including insured values, construction and occupancy classifications, geospatial data, physical characteristics, and risk features. Supports underwriting analysis, catastrophe modeling, accumulation management, and exposure data quality validation.\n",
    "prompt_instructions": "**Instructions for Exposure related queries**:\n- Always apply TIV weighting for materiality assessment — report issue severity alongside location TIV percentage together in every finding.\n- Filter out locations representing less than 15-20% of total portfolio TIV as immaterial unless explicitly asked.\n- Issue materiality = issue_severity x (location_tiv / total_account_tiv) x 100 — rank issues by materiality score, not just deviation percentage.\n- Never mix SOV exposure data with historical loss run data in the same analysis.\n- For location summaries, always include location count in the header (e.g., 'Property Portfolio Summary (15 Locations)').\n- For geographic analysis, include state/region scope in the header (e.g., 'Geographic Distribution Analysis (3 States)').\n- SOV table columns to include as relevant: Location/Address, State/County, TIV, TIV %, Occupancy, Construction Type, Year Built, Sprinkler.\n- Order SOV tables by highest TIV first for concentration analysis, by relevance for rankings.\n- Always include TIV % column for concentration or issue analysis tables.\n- For list queries, always include counts: '8 unique occupancies' or '12 locations distributed across 3 states'.\n- For long lists greater than 15 items, provide a range or summary instead of enumerating all: '28 unique year built values ranging from 1951 to 2021'.\n- For yes/no questions about SOV data, give a direct answer with one brief supporting fact only — no caveats.\n- Never add 'Data Quality Notes' sections or meta-commentary about data structure.\n- Never expose sov_id, location_id, property_id, ref_id, or any internal identifiers — use descriptive references like 'the manufacturing facility in Chicago' or 'the highest-value property'.\n- Never report issues without TIV weighting context.\n- Translate technical flags to natural language: has_sprinkler = true becomes 'Sprinkler protection is present', construction_class = Frame becomes 'Frame construction'.",
    "filter_data": {
      "enabled": true,
      "char_threshold": 40000
    },
    "data_path_sequence": [
      "data"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": [
      "street_address",
      "vac_construction_type",
      "construction_type",
      "sov_occupancy_description"
    ],
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  fetch_potential_max_line: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/sov-calculated-data"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            },
            "email-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Retrieves potential max-line or calculated max-line value with underlying calculation inputs and underwriting attributes.\n",
    "use_this_tool_when": "- Maximum line or potential max line calculation\n- Underwriting attributes used in max line determination\n",
    "do_not_use_this_tool_when": "- User needs location lists or breakdowns (use exposure_data)\n- User wants overall portfolio summary only (use exposure_profile)\n",
    "response_field_description": "maxline:\n- value (number): Potential max-line value or calculated max-line\n- input_data (object): Underwriting attributes for the max line location:\n    - construction (string): Construction classification\n    - occupancy (string): Occupancy classification\n    - year_built_bucket (string): Age grouping for risk stratification\n    - state (string): Location state\n    - manuscript_form_ind (boolean): Manuscript policy form usage\n    - sp_ind (boolean): Special property coverage indicator\n    - eq_ind (boolean): Earthquake coverage indicator\n    - barrier_island_flag (boolean): Barrier island exposure\n    - csi_forms_ind (boolean): CSI form usage\n    - monroe_ind (boolean): Monroe form usage\n    - tiv_250_ind (boolean): TIV exceeds threshold\n    - eb_removal_ind (boolean): Extra coverage removal indicator\n    - selected_limit (boolean): Selected underwriting limit usage\naverage_epsf:\n- value (number): \n- percent_deviation (number): \n- input_data (object): Underwriting attributes for the average_epsf:\n    - total_epsf (number):\n    - total_epsf_count (number): \n    - total_psf (number): \n    - total_psf_count (number): \n    - total_weighted_target_itv (number):\n",
    "short_description": "- Retrieves summarized exposure profile metrics for a transaction, highlighting maximum single-location exposure (maxline) and valuation consistency indicators such as average EPSF and benchmark deviation. Supports underwriting review, accumulation analysis, pricing validation, and portfolio risk assessment.\n",
    "prompt_instructions": "**Instructions for Exposure related queries**:\n-For PML calculations, required inputs are fire_pml and total_tiv — if either is missing, state in 2-3 sentences without structure.\n- For ITV analysis, required inputs are location_tiv, square_footage, and building_value.\n- For concentration analysis, required inputs are location_tiv, state/county, and total_account_tiv.\n- For 1-2 formulas, present inline in prose. For 3 or more formulas, use a Supporting Details table with columns: Formula Name, Formula, Inputs, Result.\n- When presenting scorecard metrics, always compare to the evaluation threshold and state the assessment as Positive, Warning, or Declining.\n- PSF scorecard example format: 'PSF: $185/SF. Expected: $170/SF. Deviation: +8.8%. Assessment: Adequate valuation.'",
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data.data"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": null,
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  broker_target: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/broker-target"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            },
            "email-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Provides broker-specified target parameters to support premium benchmarking, coverage alignment, and underwriting negotiation context for a given transaction.\n",
    "use_this_tool_when": "- Broker targets or expectations\n- Target, expiring premium or pricing expectations\n- Requested coverage structure or limits\n- Broker-specified deductibles or retentions\n- Desired perils or coverage scope\n- What the broker is asking for\n- Coverage comparison or gap analysis\n- Broker intent or submission requirements\n- Premium benchmarking context\n- Aluminium wiring presence and coverage of the insured\n- Whether locations are under Student Housing (Section 42) or not\n",
    "do_not_use_this_tool_when": "- User needs underwriting analysis or recommendation (use submission_summary)\n- User needs final quoted terms (use pricing)\n- User wants location-level property data (use exposure_data)\n- User needs workflow status (use submission_summary)\n- User needs insured business profile (use insured_insights)\n",
    "response_field_description": "- aluminium_wiring_percentage (string): Percentage of locations with alumiunium wiring\n- aluminium_wiring_presence (boolean): Whether aluminium wiring is present on not\n- expiring_premium (string): expiring premium fetched by model, might be outdated.\n- expiring_premium_value (number): Latest expiring premium value.\n- student_housing (boolean): Tells whether Property was under Section 42 (student housing)\n- target_deductibles (string): Target deductibles or retentions by peril\n- target_peril (string): Specific perils the broker seeks to include or emphasize\n- target_premium (string): target premium fetched by model, might be outdated.\n- target_premium_value (number):  Latest target premium value.\n- broker_name (string): This is the broker office name\n- producer_contact (string): This is the broker name\n",
    "short_description": "- Provides broker-specified target parameters for a transaction, including desired coverages, limits, deductibles, perils, and sub-limits. Supports premium benchmarking, coverage alignment, gap analysis, and underwriting negotiation context.\n",
    "prompt_instructions": null,
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": [
      "updated_date",
      "created_date",
      "txn_id"
    ],
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  loss_profile: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/loss-profile"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            },
            "year_window": {
              "type": "integer"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Retrieves aggregated summary metrics derived from historical loss runs. Returns high-level totals and averages only—no individual claim details.\n",
    "use_this_tool_when": "- Overall totals related to losses(total claims, total incurred losses)\n- Simple averages (average losses per year, average claims per year)\n- High-level counts by loss category (open vs closed, cat vs attritional)\n- Count of years of coverage\n",
    "do_not_use_this_tool_when": "- Individual claim details or examples\n- Condition or filter based loss questions\n- Trends over time (by year, month, quarter)\n- Breakdowns by loss type (e.g., 'AOP'), carrier, or other dimensions\n- Analysis requiring claim-level data (largest claims, specific dates, descriptions)\n- Filtering or sorting claims\n- Questions like 'show me', 'list', 'what are the', 'breakdown by'\n",
    "response_field_description": "- years_of_loss_runs (integer): Count of years covered\n- total_loss_incurred (number): Sum of all incurred losses\n- total_claims_count (integer): Total number of claims\n- average_losses_per_year (number): Mean annual incurred losses\n- average_claims_per_year (number): Mean annual claim count\n- total_catastrophic_claims (integer): Count of catastrophic claims\n- total_attritional_claims (integer): Count of attritional claims\n- total_unknown_claims (integer): Count of unclassified claims\n- total_open_claims (integer): Count of currently open claims\n- total_wind_hail_losses (number): Total incurred losses from wind/hail claims across all years\n- total_wind_hail_losses_last_3_years (number): Total incurred losses from wind/hail claims in the most recent 3-year period\n",
    "short_description": "- Retrieves summarized loss run profile metadata for a transaction, providing high-level metrics on claim frequency, loss severity, claim status, and catastrophic versus attritional loss experience to support underwriting and risk evaluation.\n",
    "prompt_instructions": null,
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data.loss_profile"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": null,
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  loss_data: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/loss-data"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Retrieves granular, claim-level loss run records for a transaction. Each record represents an individual claim with complete details including dates, financials, descriptions, and carrier information.\n",
    "use_this_tool_when": "- Individual claim details or examples\n- Trends or patterns over time (by year, loss type, cat events, carrier, etc.)\n- Breakdowns or groupings (by loss type, carrier, status, etc.)\n- Analysis of specific claims (largest claims, recent claims, open claims with details)\n- Filtering (claims above a threshold, specific loss types, specific dates)\n- Questions requiring claim descriptions, dates, or carrier information\n- Questions containing words like: 'show me', 'list', 'breakdown', 'trend', 'by year', 'which claims'\n",
    "do_not_use_this_tool_when": "- The user only needs simple totals or averages\n- A single summary number would suffice\n- No claim-level detail or analysis is required\n",
    "response_field_description": "- Policy Period (string): Policy term during which the loss occurred. Coverage period or effective date range. Examples: '12/31/2024 - 12/31/2025', '2025-2026' etc.\n- Loss Date (string): Date the loss event occurred. Examples: '06/01/2020', 'October 07, 2025'\n- Valuation Date (string): Date of claim financial valuation. Date up to which all loss, payment, and reserve information is current.\n- Report Date (string): Date loss was reported to carrier\n- Loss Description (string): Detailed narrative of the loss event. Examples: 'Fire caused damage to warehouse', 'Tornado/wind damage to building'\n- Loss Type (string): Loss categorization such as Water Damage, Fire, Weather, Theft/Vandalism, Equipment Breakdown.\n- Normalized Loss Type (string): Standardized loss type categories (categories are: \"water_escape_plumbing_hvac\", \"sprinkler_leakage\", \"lightning\", \"flood\", \"plumbing_heating_ac_service\", \"fire_and_or_explosion\", \"wind_windstorm\", \"water_sewer_service_or_defect\", \"miscellaneous_property_coverage\", \"collapse\", \"sink_hole_settling_movement\", \"vandalism_&_malicious_mischief\", \"vehicle_or_aircraft\", \"hurricane\", \"equipment_breakdown\", \"rain\", \"theft_burglary_robbery\", \"freezing_plumbing_heating_ac\", \"building_service_or_defect\", \"power_surge_failure\", \"electric_service_or_defect\", \"tornado\", \"appliance_service_or_defect\", \"riot_or_civil_commotion\", \"improper_workmanship\", \"wildfire\", \"defective_roof_gutters_etc\", \"cyber\", \"mold_fungi_wet_or_dry_rot\", \"pollutants\", \"annual_aggregate_erosion\", \"earthquake\", \"freezing_general\", \"weight_of_ice_snow_sleet\", \"glass\", \"smoke\", \"infectious_disease\", \"settling\", \"falling_object\", \"hail\", \"earth_movement_mudslide_landslide\", \"service_line\", \"spoilage\", \"animal\") based on Loss Description and Loss Type fields. The listed categories are predefined and fixed; use this column to filter whenever the condition relates to the type of loss.\n- Loss Paid (number): Amount paid for loss damages\n- Expense Paid (number): Amount paid for claim expenses\n- Loss Reserve (number): Reserved amount for future loss payments\n- Expense Reserve (number): Reserved amount for future expenses\n- Total Loss Incurred (number): Total claim cost (paid + reserved)\n- Claim Status (string): Current status of claim (e.g., 'Open', 'Closed'). CLOSED (archived, closed, settled, withdrawn, completed, final, cwp, clwop, bd, wd), OPEN (active, open, pending, current, suit, subrogation, reopened, outstanding), UNKNOWN (den, expected, na, tbd, unknown, confidential).\n- Carrier (string): Extract from sections labeled 'Carrier', 'Insurance Carrier', 'Insurer', or from headers/footers with 'Issued by' or 'Underwritten by'.\n- Cat vs Attr (string): CAT (catastrophic events like flood, hurricane, tornado, hail, wildfire, windstorm, winter storm, lightning), ATTR (routine losses like burst pipe, small fire, slip/fall, equipment damage), UNKNOWN (vague or unclear cause).\n- Litigation Check (boolean): 'Yes' if contains lawsuit, legal, attorney, settlement, court, litigation; otherwise 'No'.\n",
    "short_description": "- Retrieves detailed, claim-level loss run records for a transaction, including policy information, loss characteristics, financials, litigation status, and carrier details. Supports underwriting review, loss modeling, and advanced claims analytics.\n",
    "prompt_instructions": "**Instructions for Loss related queries**:\n- Use exact calendar years from data when relevant — state specific years like '2023-2025', never 'recent years' in answers; apply INSURANCE_DICT time definitions silently.\n- For loss run summaries, always include the full year range in the response header (e.g., 'Loss History Summary (2020-2025)').\n- Order loss run table rows from most recent to oldest.\n- Loss run table columns to include as relevant: Policy Period, Loss Date, No of Claims, Total Incurred, Cat vs Attr, Loss Type.\n- Omit rows where all data is NA or missing — use '-' for non-applicable cells, never '$0' or '0'.\n- Zero claims means verified absence — show supporting details proving what was checked. NA/null means data was not provided — state 'Loss information is not available'.\n- Never use mechanical phrasing like '0 claims' or '$0' in descriptive text.",
    "filter_data": {
      "enabled": true,
      "char_threshold": 40000
    },
    "data_path_sequence": [
      "data.data.lossrun"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": true,
      "child_list_field": "loss_runs",
      "preserve_parent_fields": [
        "file_name"
      ]
    },
    "drop_if_equals": null,
    "remove_fields": [
      "page_index",
      "item_id",
      "group_id",
      "Confidence Score"
    ],
    "sorting": {
      "enabled": true,
      "column": "Policy Period",
      "order": "descending",
      "data_type": "date",
      "format": "%m/%d/%Y - %m/%d/%Y"
    }
  },
  groundup_pricing: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/pricing"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Performs comprehensive pricing analysis and premium calculation for insurance accounts. Evaluates rate adequacy, profitability metrics, and scenario-based outcomes to support underwriting and pricing decisions.\n",
    "use_this_tool_when": "- Pricing analysis or premium calculation\n- Premium suggestion\n- Rate adequacy assessment\n- Profitability metrics (combined ratio, underwriting profit)\n- Scenario simulations (what-if analysis on losses, rates, limits)\n- Limit and deductible sensitivity analysis\n",
    "do_not_use_this_tool_when": "- User needs location-level detail or SOV breakdown (use exposure_data)\n- User wants exposure distribution only (use exposure_profile)\n",
    "response_field_description": "- submission_type (string):\n- submission_date (string):\n- email_recieved_date (string):\n- policy_effective_date (string):\n- submission_status (string):\n- model_run (list): Tells when each model run was done, and its status\n  - run (number): Tells which model run it was\n  - automation_requestid (number): Tells unique id for corresponding model run\n  - created_date (string): Tell when corresponding model run was created\n- automation_requests (datatable):\n  - id (string): Modeling automation request ID\n  - quote_flag (string):\n  - quote_date (string): Date when policy was quoted\n  - pricing (dict):\n    - layer_selection (integer): Layer selection amount\n    - xs_selections (integer): Excess selection amount\n    - aop_selection (integer): All Other Perils selection amount\n    - vru_participation (float): VRU participation percentage (e.g., 0.5 for 50%)\n    - estimated_profit (number): Projected profit after losses and expenses\n    - dtvar_99th (also called as capital usage)(number): Downside Tail Value at Risk at 99th percentile\n    - return_on_dtvar (also called as return on capital) (number): Ratio of estimated profit to DTVAR\n    - dtvar_to_premium (number): Downside risk as proportion of total premium\n    - combined_ratio (number): Sum of loss ratio and expense ratio\n    - total_premium (number): Total premium charged across all coverages\n    - equipment_breakdown_modifier (string): Status - \"Calculated\", \"Rejected\", or \"Flag\"\n    - modeled_perils (datatable):\n      - enabled (boolean): Whether peril is active\n      - premium (number):\n      - peril_code (string): Peril identifier (e.g., \"ST\")\n      - peril_limit (string): Maximum coverage amount for this peril\n      - peril_description (string): Full peril description\n",
    "short_description": "- Provides pricing outputs for an insurance submission, including total premium, layer and deductible selections, peril-level premiums and limits, and key profitability and capital adequacy metrics such as estimated profit, combined ratio, DTVar, and return on capital. Supports underwriting evaluation of pricing adequacy, risk-adjusted performance, and structure selection based on modeled peril contributions.\n",
    "prompt_instructions": null,
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": null,
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  insured_insights: {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/insured-insights"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            },
            "email-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Retrieves insured analysis and business profile insights for a given transaction. It includes core business operations, operational risks and media sentiment.\n",
    "use_this_tool_when": "- Insured information or business profile\n- Who is the insured or named insured\n- Mailing address of insured\n- Business operations or description of the insured's activities\n- Years in business or ownership structure\n- Industry classification or business type\n- Operational scale (employees, revenue, locations)\n- Financial strength or stability indicators of the insured\n- Insured reputation or media coverage\n- Entity type or legal structure\n- Industry-specific risks or operational risks\n",
    "do_not_use_this_tool_when": "- User needs submission analysis or underwriting recommendation (use submission_summary)\n- User wants location-level property data (use exposure_data)\n- User wants premium calculations (use pricing)\n- User needs workflow status (use submission_summary)\n",
    "response_field_description": "- mailing_address (string): Primary mailing address of the insured\n- named_insured (string): Legal name of the named insured entity\n- description (string): Provides comprehensive business profile of Insured containing: Core Business Operations, Operational Risks and Insured Reputation & Media Coverage\n",
    "short_description": "- Retrieves comprehensive insured analysis and business profile insights for a transaction, covering entity identification, business operations, organizational structure, operational scale, risk characteristics, and financial strength. Supports underwriting review, risk evaluation, and submission understanding.\n",
    "prompt_instructions": null,
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": [
      "correlation_id",
      "updated_date",
      "created_date",
      "insight_id",
      "created_by",
      "generated_by",
      "modified_description"
    ],
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  },
  "submission_summary": {
    "type": "api",
    "parameters": {
      "type": "object",
      "properties": {
        "api_name": {
          "type": "string",
          "const": "/api/v1/submission-summary"
        },
        "method": {
          "type": "string",
          "const": "GET"
        },
        "headers": {
          "type": "object",
          "properties": {
            "tenant-id": {
              "type": "string"
            },
            "app-id": {
              "type": "string"
            }
          },
          "required": [
            "tenant-id",
            "app-id"
          ]
        },
        "inputs": {
          "type": "object",
          "properties": {
            "txn_id": {
              "type": "string"
            }
          },
          "required": [
            "txn_id"
          ]
        }
      },
      "required": [
        "api_name",
        "method",
        "headers",
        "inputs"
      ]
    },
    "definition": "Provides comprehensive submission insights by consolidating submission metadata, underwriting analysis, market intelligence, and risk signals into a single, decision-ready view for rapid assessment and informed decision-making.\n",
    "use_this_tool_when": "- Overall submission analysis\n- User asks for email recieved date, policy effective date or whether Type of submission is new or renewal\n- Mandatory or Partial data missing in submission\n- Submission status or amp rules check\n- User asks for a submission scorecard\n- Underwriting recommendation or decision rationale\n- Risk appetite alignment or Underwriter guidelines compliance\n- Submission scorecard or positive/negative factors\n- Winnability assessment or appetite scoring\n- Quote/decline reasoning and strategic factors\n- Submission triage or priority assessment\n",
    "do_not_use_this_tool_when": "- User needs detailed location-level data (use exposure_data)\n- User needs premium calculation or pricing scenarios (use groundup_pricing)\n- User needs raw claim details (use loss_data)\n- If query only requires exposure_profile, loss_profile or pricing_profile then use exposure_profile, loss_profile or groundup_pricing tool. And do not use submission_summary tool\n",
    "response_field_description": "- submission (dict):\n  - policy_number (string): Policy number\n  - account_number (string): Account number\n  - broker_name (string): This is the broker office name\n  - insured_name (string): Name Insured\n  - producer_contact (string): This is the broker name\n  - underwriter (list): List of underwriters assigned with the submission\n  - underwriter_assistant (list): List of underwriter's assistant\n  - submission_type (string): Type of submission (e.g., New Business, Renewal)\n  - submission_date (string): Date submission was received\n  - email_received_date (string): Date email was received\n  - policy_effective_date (string): Requested policy effective date\n  - submission_highlights (dict):\n    - appetite_score (string): Risk appetite alignment score (out of 10)\n    - winnability_score (string): Competitive winnability score (out of 10)\n    - matrix_score (string): Overall submission matrix score\n    - potential_max_line (string): Estimated maximum single-location exposure\n    - avg_itv (string): Average insured value per square foot\n    - itv_deviation (string): Insured-to-value deviation percentage\n    - states_and_locations (string): Geographic distribution of locations\n    - fire_pml (string)\n- triage_summary (dict):\n  - submission_status (string):\n  - quote_status (string):\n  - federato_group_status (string):\n  - scorecard_score (string):\n  - uw_guideline_fail (string):\n  - missing_data_status (string):\n  - ground_up_possible (string):\n  - quote_date (string):\n\n- uw_guidelines (dict):\n  - fire_pml (string): Tells whether fire pml guideline check was passed or not\n  - ineligible_counties (string): Tells whether fire pml guideline check was passed or not\n\n- risk_signals (dict):\n  - exposure_profile (dict)\n  - loss_profile (dict)\n  - pricing_profile (dict).\n\n- broker_targets (dict): (Same as broker_target tool)\n\n- score_card (dict):\n  - positive (object): Numbered list of positive factors (strengths)\n  - negative (object): Numbered list of negative factors (concerns)\n\n- amp_check (dict): tells whether below rules were a pass or fail\n  - product_type\n  - ground_up_possible\n  - eifs\n  - vacancy\n  - return_on_dtvar\n  - primary_year_built\n  - scheduled_coverage\n  - cost_sqft_above_our_minimums\n  - appetite_score\n  - geographic_restrictions\n  - target_to_technical_premium\n  - primary_occupancy\n  - tiv\n  - roof_score\n  - dtvar_to_premium\n  - no_loss\n  - new_business\n\n- missing_data (dict): tells whether mandatory and partial datapoints were available for the submission\n  - mandatory (dict):\n    - eifs_info_missing\n    - roof_update_year_missing_less_than_3_locations\n    - aluminum_wiring_info_missing\n  - partial (dict):\n    - broker_target_premium_missing\n    - occupancy_missing\n    - year_built_missing\n    - loss_run_not_provided_for_at_least_last_3_years\n    - vacancy_missing\n    - loss_run_data_not_provided\n    - construction_missing\n",
    "short_description": "- Provides comprehensive submission insights by consolidating submission metadata, underwriting analysis, market intelligence, and risk signals into a single, decision-ready view. Supports underwriting triage, pricing strategy, appetite assessment, and referral decisions by highlighting material risk drivers, exposure, loss history, and data sufficiency for rapid, informed decision-making.\n",
    "prompt_instructions": null,
    "filter_data": {
      "enabled": false,
      "char_threshold": null
    },
    "data_path_sequence": [
      "data"
    ],
    "post_processing": null,
    "flatten": {
      "enabled": false,
      "child_list_field": null,
      "preserve_parent_fields": []
    },
    "drop_if_equals": null,
    "remove_fields": null,
    "sorting": {
      "enabled": false,
      "column": null,
      "order": null,
      "data_type": null,
      "format": null
    }
  }
};
