const rulesData = {
  rules: [
    {
      rule_name: "Barrier Islands Line Size Caps",
      rule_type: "pricing_coverage",
      definition:
        "This rule governs maximum line size capacity for barrier island risks to control concentration and construction-driven exposure in coastal territories.",
      short_description:
        "Barrier island risks are capped at $10M per line.",
      source_citation: {
        page_number: "page_1",
      },
    },
    {
      rule_name: "EIFS",
      rule_type: "triage",
      definition:
        "This rule governs acceptability and line size treatment for risks with EIFS cladding.",
      short_description:
        "EIFS is prohibited on Frame or JM risks above thresholds.",
      source_citation: {
        page_number: "page_2",
      },
    },
    {
      rule_name: "Named Storm Deductible Minimums",
      rule_type: "pricing_coverage",
      definition:
        "This rule governs minimum named storm deductible requirements.",
      short_description:
        "Named storm deductibles range from 1% to 10%.",
      source_citation: {
        page_number: "page_2",
      },
    },
    {
      rule_name: "Wind Driven Precipitation Rain",
      rule_type: "pricing_coverage",
      definition:
        "This rule governs sublimit availability and pricing treatment.",
      short_description:
        "Coverage allows no additional premium up to $100,000 sublimit.",
      source_citation: {
        page_number: "page_3",
      },
    },
    {
      rule_name: "Aluminum Wiring",
      rule_type: "triage",
      definition:
        "This rule governs eligibility and required structuring for risks with aluminum wiring.",
      short_description:
        "Aluminum wiring is limited to 10 percent on multi-location schedules.",
      source_citation: {
        page_number: "page_3",
      },
    },
    {
      rule_name: "Vacancy",
      rule_type: "triage",
      definition:
        "This rule governs minimum occupancy requirements for AOP coverage.",
      short_description:
        "AOP coverage requires at least a 31 percent occupancy rate.",
      source_citation: {
        page_number: "page_3",
      },
    },
    {
      rule_name: "Ineligible TX Counties",
      rule_type: "triage",
      definition:
        "This rule governs county-based ineligibility in Texas.",
      short_description:
        "Texas risks in certain counties are prohibited.",
      source_citation: {
        page_number: "page_3",
      },
    },
  ],
};

export default rulesData;