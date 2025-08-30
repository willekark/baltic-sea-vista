// CTA Generation Logic for Baltic Data Hub
interface PilotKPI {
  id: string;
  title: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'adequate' | 'warning' | 'alert';
  trend: 'improving' | 'stable' | 'declining';
  lastUpdate: string;
  dataSource: string;
  confidence: number;
}

interface CTARecommendation {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  actions: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  estimated_impact: {
    kpi_improvement: string;
    co2_reduction_tonnes: number;
    cost_estimate_eur: string;
    roi_timeline: string;
  };
  implementation: {
    stakeholders: string[];
    timeline_months: number;
    budget_sources: string[];
    success_metrics: string[];
  };
  evidence: {
    data_sources: string[];
    baseline_values: { [key: string]: number };
    benchmarks: string;
  };
  regulatory_framework: {
    eu_directives: string[];
    national_legislation: string[];
    local_permits: string[];
  };
  co_benefits: string[];
  risks: string[];
}

export const generateCTARecommendations = (municipalityId: string, kpis: PilotKPI[]): CTARecommendation[] => {
  const recommendations: CTARecommendation[] = [];

  // Analyze each KPI and generate relevant CTAs
  kpis.forEach(kpi => {
    switch (kpi.id) {
      case 'bathing_performance':
        if (kpi.status === 'warning' || kpi.status === 'alert' || kpi.value < 85) {
          recommendations.push(generateBathingWaterCTA(municipalityId, kpi));
        }
        break;
      case 'eutrophication_pressure':
        if (kpi.status === 'warning' || kpi.status === 'alert' || kpi.trend === 'declining') {
          recommendations.push(generateEutrophicationCTA(municipalityId, kpi));
        }
        break;
      case 'oxygen_stress':
        if (kpi.value > 10 || kpi.status === 'warning' || kpi.status === 'alert') {
          recommendations.push(generateHypoxiaCTA(municipalityId, kpi));
        }
        break;
      case 'wastewater_compliance':
        if (kpi.value < 95 || kpi.status !== 'excellent') {
          recommendations.push(generateWastewaterCTA(municipalityId, kpi));
        }
        break;
      case 'protected_waters':
        if (kpi.value < 25 || kpi.status === 'adequate') {
          recommendations.push(generateMPACTA(municipalityId, kpi));
        }
        break;
      case 'flood_resilience':
        if (kpi.value < 80 || kpi.status === 'warning') {
          recommendations.push(generateFloodResilienceCTA(municipalityId, kpi));
        }
        break;
    }
  });

  // Add cross-cutting recommendations
  recommendations.push(...generateCrossCuttingCTAs(municipalityId, kpis));

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
};

const generateBathingWaterCTA = (municipalityId: string, kpi: PilotKPI): CTARecommendation => ({
  id: 'bathing-water-improvement',
  title: 'Implement Advanced Bathing Water Quality Monitoring & Treatment',
  category: 'Water Quality Management',
  priority: kpi.value < 70 ? 'critical' : 'high',
  description: `Deploy real-time monitoring systems and targeted pollution source control to achieve >90% excellent/good bathing sites, addressing current ${kpi.value}% compliance rate through evidence-based interventions.`,
  actions: {
    short_term: [
      'Install IoT-based water quality sensors at all designated bathing sites with real-time data transmission to municipal control center',
      'Conduct comprehensive microbiological source tracking (MST) using fecal indicator bacteria and molecular markers',
      'Implement emergency response protocols for pollution events with automated alert systems to health authorities',
      'Establish citizen reporting mobile app for pollution incidents with GPS-tagged photo documentation'
    ],
    medium_term: [
      'Upgrade storm water infrastructure with first-flush diversions and bioretention systems in priority catchments',
      'Install UV disinfection systems at combined sewer overflow (CSO) discharge points affecting bathing areas',
      'Implement green infrastructure corridors with constructed wetlands for non-point source pollution control',
      'Develop predictive water quality models using machine learning algorithms incorporating weather, tide, and discharge data'
    ],
    long_term: [
      'Complete separation of combined sewer systems in watersheds draining to bathing areas',
      'Establish marine protected buffer zones around high-priority bathing sites with restricted vessel discharge',
      'Deploy advanced membrane bioreactor (MBR) technology for tertiary wastewater treatment affecting coastal waters',
      'Create integrated coastal zone management plan with land use restrictions in sensitive catchment areas'
    ]
  },
  estimated_impact: {
    kpi_improvement: '+15-25%',
    co2_reduction_tonnes: 450,
    cost_estimate_eur: '€2.5-4.2M',
    roi_timeline: '3-5 years'
  },
  implementation: {
    stakeholders: [
      'Municipal Environmental Department',
      'Regional Health Authority (Folkhälsomyndigheten)',
      'SMHI (Swedish Meteorological Institute)',
      'Local water utilities',
      'Coastal property developers',
      'Tourism boards',
      'Environmental NGOs'
    ],
    timeline_months: 36,
    budget_sources: [
      'EU LIFE Programme for environmental protection',
      'Swedish Environmental Protection Agency grants',
      'Regional development funds (ERDF)',
      'Municipal environmental bonds',
      'Blue finance mechanisms',
      'Tourism tax revenue allocation'
    ],
    success_metrics: [
      'Percentage of bathing sites achieving "excellent" classification',
      'Reduction in pollution incident frequency and duration',
      'Real-time compliance with EU Bathing Water Directive standards',
      'Tourist satisfaction scores and beach visitation rates',
      'Pathogen detection time from hours to minutes'
    ]
  },
  evidence: {
    data_sources: [
      'EEA Bathing Water Quality Database (2020-2024)',
      'SMHI coastal monitoring network',
      'Municipal health authority monitoring reports',
      'Satellite imagery analysis for pollution plume tracking'
    ],
    baseline_values: {
      'Current excellent sites (%)': kpi.value,
      'Annual pollution events': 12,
      'Average response time (hours)': 6,
      'Tourist complaints per season': 45
    },
    benchmarks: 'Best-performing Baltic municipalities (Malmö: 95% excellent, Copenhagen: 92% excellent) and HELCOM assessment criteria'
  },
  regulatory_framework: {
    eu_directives: [
      'Bathing Water Directive 2006/7/EC',
      'Water Framework Directive 2000/60/EC',
      'Urban Wastewater Treatment Directive 91/271/EEC',
      'Marine Strategy Framework Directive 2008/56/EC'
    ],
    national_legislation: [
      'Swedish Environmental Code (Miljöbalken)',
      'Water Management Regulation (2004:660)',
      'Health Protection Act regarding bathing waters',
      'Planning and Building Act for coastal development'
    ],
    local_permits: [
      'Water extraction permits for treatment systems',
      'Discharge permits for storm water infrastructure',
      'Construction permits for monitoring installations',
      'Environmental impact assessments for major works'
    ]
  },
  co_benefits: [
    'Enhanced coastal ecosystem health and biodiversity',
    'Increased tourism revenue and coastal property values',
    'Reduced healthcare costs from waterborne illnesses',
    'Improved climate resilience of coastal infrastructure',
    'Strengthened environmental monitoring capabilities',
    'Job creation in environmental technology sector'
  ],
  risks: [
    'High upfront capital costs may strain municipal budgets',
    'Technical complexity requires specialized maintenance staff',
    'Climate change may overwhelm mitigation efforts',
    'Regulatory changes could affect system requirements',
    'Public resistance to construction disruptions'
  ]
});

const generateEutrophicationCTA = (municipalityId: string, kpi: PilotKPI): CTARecommendation => ({
  id: 'eutrophication-control',
  title: 'Deploy Precision Nutrient Management & Algal Bloom Early Warning System',
  category: 'Eutrophication Control',
  priority: kpi.trend === 'declining' ? 'critical' : 'high',
  description: `Implement AI-powered nutrient load monitoring and precision management to reduce eutrophication pressure by 30%, targeting current ${kpi.value}/100 pressure index through watershed-scale interventions.`,
  actions: {
    short_term: [
      'Deploy autonomous buoy network with real-time chlorophyll-a, nutrient, and oxygen sensors across municipal waters',
      'Implement satellite-based algal bloom detection using Sentinel-2/3 data with automated municipal alert system',
      'Conduct high-resolution watershed nutrient mapping using GIS analysis and soil/water sampling protocols',
      'Establish nutrient trading program pilot with agricultural stakeholders in priority sub-catchments'
    ],
    medium_term: [
      'Install smart agricultural extension services with precision fertilizer application guidance for watershed farmers',
      'Deploy constructed treatment wetlands at 5-8 strategic locations for non-point source nutrient interception',
      'Implement advanced biological nutrient removal (A2O process) at municipal wastewater treatment plants',
      'Create coastal algae harvesting program for biomass recovery and nutrient removal with local energy production'
    ],
    long_term: [
      'Establish comprehensive watershed nutrient management plan with binding pollution reduction targets',
      'Deploy large-scale seaweed cultivation zones for commercial nutrient extraction and blue carbon sequestration',
      'Implement circular economy approach linking wastewater nutrients to sustainable aquaculture systems',
      'Create regional nutrient credit system connected to Baltic Sea Action Plan implementation mechanisms'
    ]
  },
  estimated_impact: {
    kpi_improvement: '+20-35%',
    co2_reduction_tonnes: 850,
    cost_estimate_eur: '€3.8-6.5M',
    roi_timeline: '4-7 years'
  },
  implementation: {
    stakeholders: [
      'Swedish Agency for Marine and Water Management (HaV)',
      'County Administrative Board (Länsstyrelsen)',
      'Agricultural extension services (Hushållningssällskap)',
      'SMHI Ocean and Climate Department',
      'Local farmers associations',
      'Aquaculture industry representatives',
      'HELCOM Baltic Marine Environment Protection Commission'
    ],
    timeline_months: 48,
    budget_sources: [
      'EU Common Agricultural Policy (CAP) environmental measures',
      'LIFE+ Nature and Biodiversity Programme',
      'Swedish Rural Development Programme',
      'Baltic Sea Action Plan funding mechanisms',
      'Blue Bond financing for marine projects',
      'Carbon credit revenue from blue carbon projects'
    ],
    success_metrics: [
      'Reduction in total nitrogen and phosphorus loads to coastal waters',
      'Decrease in harmful algal bloom frequency and intensity',
      'Improvement in water transparency (Secchi depth measurements)',
      'Increase in oxygen levels in bottom waters during stratified periods',
      'Economic value of algal biomass harvested for beneficial use'
    ]
  },
  evidence: {
    data_sources: [
      'SMHI SHARKdata marine monitoring database',
      'CMEMS Baltic Sea biogeochemical models',
      'Copernicus Sentinel satellite imagery analysis',
      'HELCOM eutrophication assessment data',
      'Municipal wastewater discharge monitoring'
    ],
    baseline_values: {
      'Eutrophication pressure index': kpi.value,
      'Annual bloom days': 25,
      'Average Secchi depth (m)': 3.2,
      'Total N load (tonnes/year)': 145,
      'Total P load (tonnes/year)': 18
    },
    benchmarks: 'HELCOM eutrophication targets, MSFD Good Environmental Status criteria, and reference conditions for Baltic Proper sub-basin'
  },
  regulatory_framework: {
    eu_directives: [
      'Nitrates Directive 91/676/EEC',
      'Water Framework Directive 2000/60/EC',
      'Marine Strategy Framework Directive 2008/56/EC',
      'Common Agricultural Policy regulations'
    ],
    national_legislation: [
      'Swedish Environmental Quality Objectives',
      'Water Management Plans (vattenmyndigheternas förvaltningsplaner)',
      'Agricultural Environmental Compensation regulations',
      'Environmental Code provisions for water protection'
    ],
    local_permits: [
      'Discharge permits for constructed wetlands',
      'Agricultural land use change permits',
      'Marine area use permits for algae cultivation',
      'Research permits for monitoring equipment deployment'
    ]
  },
  co_benefits: [
    'Enhanced fish populations and commercial fisheries productivity',
    'Reduced costs for municipal drinking water treatment',
    'Creation of sustainable blue economy opportunities',
    'Improved recreational water use and ecosystem services',
    'Climate change mitigation through blue carbon sequestration',
    'Strengthened agricultural sustainability and competitiveness'
  ],
  risks: [
    'Climate-driven changes may overwhelm nutrient reduction efforts',
    'Agricultural sector resistance to land use changes',
    'Complex multi-jurisdictional coordination requirements',
    'Uncertain long-term effectiveness of constructed treatment systems',
    'Market volatility for algal biomass products'
  ]
});

const generateHypoxiaCTA = (municipalityId: string, kpi: PilotKPI): CTARecommendation => ({
  id: 'hypoxia-mitigation',
  title: 'Deploy Integrated Hypoxia Prevention & Deep Water Restoration Program',
  category: 'Oxygen Management',
  priority: kpi.value > 20 ? 'critical' : 'high',
  description: `Implement comprehensive oxygen management system to reduce hypoxic episodes from current ${kpi.value} days/quarter to <5 days through targeted interventions and ecosystem restoration.`,
  actions: {
    short_term: [
      'Install continuous dissolved oxygen monitoring network with depth-profiling capabilities and emergency alert systems',
      'Implement mobile oxygenation units for emergency intervention during critical hypoxic events',
      'Conduct benthic habitat mapping using multibeam sonar and ROV surveys to identify restoration priority areas',
      'Establish fish kill monitoring protocol with rapid response team and stakeholder notification system'
    ],
    medium_term: [
      'Deploy innovative bubble plume aeration systems at strategic deep water locations during summer stratification',
      'Restore 50-100 hectares of coastal blue mussel beds for enhanced water filtration and oxygen production',
      'Implement precision aquaculture with integrated multi-trophic systems (IMTS) for nutrient cycling optimization',
      'Create shallow water eelgrass restoration zones for oxygen production and carbon sequestration'
    ],
    long_term: [
      'Establish large-scale sediment remediation program targeting phosphorus-rich bottom sediments',
      'Deploy wave-powered oxygenation systems for sustainable long-term oxygen enhancement',
      'Create deep-water marine protected areas with fishing restrictions to allow ecosystem recovery',
      'Implement comprehensive watershed management for long-term nutrient load reduction'
    ]
  },
  estimated_impact: {
    kpi_improvement: '+60-80%',
    co2_reduction_tonnes: 320,
    cost_estimate_eur: '€2.1-3.8M',
    roi_timeline: '5-8 years'
  },
  implementation: {
    stakeholders: [
      'Swedish University of Agricultural Sciences (SLU) marine research',
      'Institute of Marine Research',
      'Commercial and recreational fishing organizations',
      'Marine technology companies',
      'Environmental consulting firms',
      'Coastal municipalities network',
      'NGOs focused on marine conservation'
    ],
    timeline_months: 42,
    budget_sources: [
      'EU Horizon Europe marine research funding',
      'Swedish Research Council environmental grants',
      'Blue growth investment fund',
      'Fisheries compensation and restoration funds',
      'Municipal environmental investment bonds',
      'Private sector marine technology partnerships'
    ],
    success_metrics: [
      'Reduction in number of hypoxic days per quarter',
      'Improvement in bottom water oxygen concentrations',
      'Recovery of benthic fauna biodiversity indices',
      'Increase in commercial fish stock assessments',
      'Expansion of restored habitat coverage area'
    ]
  },
  evidence: {
    data_sources: [
      'SMHI oceanographic monitoring data',
      'Institute of Marine Research fish stock assessments',
      'Autonomous underwater vehicle (AUV) oxygen surveys',
      'Commercial fishing catch statistics',
      'Benthic community monitoring reports'
    ],
    baseline_values: {
      'Hypoxic days per quarter': kpi.value,
      'Average bottom DO (mg/L)': 1.8,
      'Benthic species richness': 12,
      'Fish biomass (kg/hectare)': 45,
      'Mussel bed coverage (hectares)': 23
    },
    benchmarks: 'HELCOM core indicators for oxygen debt, MSFD criteria for seafloor integrity, and reference conditions from 1960s monitoring data'
  },
  regulatory_framework: {
    eu_directives: [
      'Marine Strategy Framework Directive 2008/56/EC',
      'Habitats Directive 92/43/EEC for protected species',
      'Water Framework Directive for coastal waters',
      'Environmental Impact Assessment Directive'
    ],
    national_legislation: [
      'Swedish Species Protection Ordinance',
      'Fisheries Act and regulations',
      'Environmental Code marine provisions',
      'Maritime Spatial Planning legislation'
    ],
    local_permits: [
      'Marine construction permits for aeration equipment',
      'Aquaculture licensing for restoration activities',
      'Research permits for sediment intervention',
      'Habitat restoration authorizations'
    ]
  },
  co_benefits: [
    'Enhanced commercial and recreational fisheries',
    'Improved coastal ecosystem resilience to climate change',
    'Increased carbon sequestration in restored marine habitats',
    'Development of marine technology innovation cluster',
    'Enhanced marine biodiversity and ecosystem services',
    'Improved coastal tourism and recreational opportunities'
  ],
  risks: [
    'Climate change may exacerbate oxygen depletion trends',
    'Technological systems require specialized maintenance',
    'Habitat restoration success depends on environmental conditions',
    'Potential conflicts with existing marine uses',
    'Long-term commitment required for ecosystem recovery'
  ]
});

const generateWastewaterCTA = (municipalityId: string, kpi: PilotKPI): CTARecommendation => ({
  id: 'wastewater-upgrade',
  title: 'Advanced Wastewater Treatment Technology Implementation',
  category: 'Wastewater Management',
  priority: kpi.value < 90 ? 'high' : 'medium',
  description: `Upgrade municipal wastewater infrastructure to achieve >98% UWWTD compliance and implement advanced nutrient removal, improving from current ${kpi.value}% compliance through cutting-edge treatment technologies.`,
  actions: {
    short_term: [
      'Conduct comprehensive infrastructure assessment using AI-powered condition monitoring and predictive analytics',
      'Install real-time monitoring systems for all treatment stages with automated regulatory reporting',
      'Implement enhanced biological phosphorus removal (EBPR) optimization protocols',
      'Establish emergency backup systems and redundancy for critical treatment processes'
    ],
    medium_term: [
      'Deploy membrane bioreactor (MBR) technology for tertiary treatment and nutrient polishing',
      'Install advanced anaerobic digestion with biogas capture for renewable energy production',
      'Implement smart sludge management with thermal hydrolysis and resource recovery systems',
      'Create decentralized treatment systems for new development areas using nature-based solutions'
    ],
    long_term: [
      'Establish full-scale water reuse facility with advanced treatment for industrial and irrigation applications',
      'Deploy innovative nutrient recovery systems for phosphorus and nitrogen extraction as fertilizer products',
      'Implement AI-driven process optimization for energy efficiency and treatment performance',
      'Create regional wastewater treatment cooperation with neighboring municipalities'
    ]
  },
  estimated_impact: {
    kpi_improvement: '+8-15%',
    co2_reduction_tonnes: 1200,
    cost_estimate_eur: '€15-25M',
    roi_timeline: '8-12 years'
  },
  implementation: {
    stakeholders: [
      'Municipal water and wastewater utility',
      'Swedish Water and Wastewater Association (SWWA)',
      'Technology vendors and engineering consultants',
      'Environmental regulators (County Administration)',
      'Energy companies for biogas utilization',
      'Industrial water users',
      'Environmental monitoring agencies'
    ],
    timeline_months: 60,
    budget_sources: [
      'EU Cohesion Fund for environmental infrastructure',
      'Swedish National Board of Housing grants',
      'Green bonds for sustainable infrastructure',
      'User fee adjustments and tariff optimization',
      'Energy savings reinvestment programs',
      'Technology demonstration project funding'
    ],
    success_metrics: [
      'UWWTD compliance percentage across all parameters',
      'Nutrient removal efficiency (N and P)',
      'Energy self-sufficiency from biogas production',
      'Sludge volume reduction and beneficial reuse rates',
      'Water reuse volume for non-potable applications'
    ]
  },
  evidence: {
    data_sources: [
      'EEA Urban Wastewater Treatment Directive monitoring',
      'Municipal discharge monitoring reports',
      'Energy consumption and biogas production data',
      'Sludge quality and disposal cost records',
      'Regulatory compliance audit reports'
    ],
    baseline_values: {
      'UWWTD compliance (%)': kpi.value,
      'Total N removal (%)': 75,
      'Total P removal (%)': 82,
      'Energy consumption (kWh/m³)': 0.65,
      'Biogas production (m³/day)': 450
    },
    benchmarks: 'Best available techniques (BAT) reference documents, advanced treatment facilities in Denmark and Netherlands'
  },
  regulatory_framework: {
    eu_directives: [
      'Urban Wastewater Treatment Directive 91/271/EEC',
      'Water Framework Directive 2000/60/EC',
      'Waste Framework Directive 2008/98/EC',
      'Renewable Energy Directive 2009/28/EC'
    ],
    national_legislation: [
      'Swedish Environmental Code wastewater provisions',
      'Water Services Act (2006:412)',
      'Waste Management regulations',
      'Energy legislation for biogas production'
    ],
    local_permits: [
      'Environmental permits for treatment plant modifications',
      'Construction permits for facility expansion',
      'Biogas production and utilization permits',
      'Sludge handling and disposal authorizations'
    ]
  },
  co_benefits: [
    'Reduced municipal energy costs through biogas production',
    'Enhanced water security through reuse applications',
    'Creation of valuable fertilizer products from waste streams',
    'Improved public health protection',
    'Reduced carbon footprint of wastewater operations',
    'Enhanced municipal climate resilience'
  ],
  risks: [
    'High capital investment requirements',
    'Technical complexity and operational risks',
    'Regulatory changes affecting design requirements',
    'Market risks for recovered product sales',
    'Long-term financing and debt service obligations'
  ]
});

const generateMPACTA = (municipalityId: string, kpi: PilotKPI): CTARecommendation => ({
  id: 'marine-protection-expansion',
  title: 'Strategic Marine Protected Area Expansion & Management Enhancement',
  category: 'Marine Conservation',
  priority: kpi.value < 20 ? 'high' : 'medium',
  description: `Expand marine protected area coverage from current ${kpi.value}% to 30% of municipal waters through evidence-based conservation planning and stakeholder engagement.`,
  actions: {
    short_term: [
      'Conduct systematic conservation planning using Marxan optimization software with biodiversity and socioeconomic data',
      'Establish stakeholder engagement platform including fishing industry, tourism operators, and conservation groups',
      'Map critical habitats using underwater drones, acoustic monitoring, and environmental DNA sampling',
      'Develop marine spatial planning framework with conflict resolution mechanisms for multiple use areas'
    ],
    medium_term: [
      'Designate new marine protected areas focusing on spawning grounds, nursery areas, and migration corridors',
      'Implement smart monitoring systems with underwater cameras, acoustic sensors, and satellite surveillance',
      'Create blue corridors connecting existing protected areas for enhanced ecological connectivity',
      'Establish sustainable financing mechanisms including blue bonds and payment for ecosystem services'
    ],
    long_term: [
      'Achieve 30% protection target aligned with EU Biodiversity Strategy 2030 and CBD Global Framework',
      'Implement adaptive management protocols based on climate change scenarios and ecosystem monitoring',
      'Create transboundary marine conservation network with neighboring municipalities and countries',
      'Develop blue carbon offset programs linking marine conservation to carbon credit markets'
    ]
  },
  estimated_impact: {
    kpi_improvement: '+35-50%',
    co2_reduction_tonnes: 680,
    cost_estimate_eur: '€1.2-2.8M',
    roi_timeline: '6-10 years'
  },
  implementation: {
    stakeholders: [
      'Swedish Agency for Marine and Water Management (HaV)',
      'County Administrative Board conservation officers',
      'Commercial and recreational fishing organizations',
      'Marine tourism and diving operators',
      'Research institutions and marine biologists',
      'Environmental NGOs and local conservation groups',
      'Indigenous and local communities with traditional fishing rights'
    ],
    timeline_months: 48,
    budget_sources: [
      'EU LIFE Programme for biodiversity conservation',
      'Swedish Environmental Protection Agency grants',
      'Blue finance and conservation bonds',
      'Sustainable tourism tax revenue',
      'International climate finance mechanisms',
      'Corporate sponsorship and conservation partnerships'
    ],
    success_metrics: [
      'Percentage of municipal waters under protection designation',
      'Fish biomass recovery in protected areas',
      'Compliance rates with protection regulations',
      'Stakeholder satisfaction and support levels',
      'Economic benefits from sustainable marine tourism'
    ]
  },
  evidence: {
    data_sources: [
      'HELCOM underwater biotope mapping',
      'Swedish Species Information Centre (ArtDatabanken)',
      'Commercial fishing statistics and VMS data',
      'Marine habitat suitability modeling results',
      'Socioeconomic impact assessment studies'
    ],
    baseline_values: {
      'Current MPA coverage (%)': kpi.value,
      'Fish species richness': 28,
      'Commercial fish biomass (tonnes)': 180,
      'Tourism revenue (€M/year)': 2.3,
      'Fishing industry employment': 145
    },
    benchmarks: 'CBD 30x30 targets, EU Biodiversity Strategy requirements, HELCOM Baltic Sea Action Plan conservation objectives'
  },
  regulatory_framework: {
    eu_directives: [
      'Habitats Directive 92/43/EEC',
      'Birds Directive 2009/147/EC',
      'Marine Strategy Framework Directive 2008/56/EC',
      'Maritime Spatial Planning Directive 2014/89/EU'
    ],
    national_legislation: [
      'Swedish Environmental Code nature conservation provisions',
      'Species Protection Ordinance',
      'Cultural Environment Act for underwater heritage',
      'Fisheries legislation and quota regulations'
    ],
    local_permits: [
      'Nature reserve establishment procedures',
      'Marine area use permits and zoning changes',
      'Tourism operation licensing in protected areas',
      'Research and monitoring activity permits'
    ]
  },
  co_benefits: [
    'Enhanced fish stocks benefiting commercial and recreational fishing',
    'Increased marine tourism and diving opportunities',
    'Improved coastal protection through healthy ecosystems',
    'Enhanced carbon sequestration in marine habitats',
    'Strengthened climate adaptation through ecosystem resilience',
    'Educational and research opportunities for marine science'
  ],
  risks: [
    'Stakeholder opposition from fishing and maritime industries',
    'Enforcement challenges in remote marine areas',
    'Climate change impacts on protected ecosystem functionality',
    'Limited funding for long-term management and monitoring',
    'Potential displacement of fishing pressure to unprotected areas'
  ]
});

const generateFloodResilienceCTA = (municipalityId: string, kpi: PilotKPI): CTARecommendation => ({
  id: 'coastal-resilience-enhancement',
  title: 'Comprehensive Coastal Flood Resilience & Adaptation Infrastructure',
  category: 'Climate Adaptation',
  priority: kpi.value < 75 ? 'high' : 'medium',
  description: `Enhance coastal flood resilience from current ${kpi.value}/100 index to >85 through integrated infrastructure, nature-based solutions, and smart early warning systems.`,
  actions: {
    short_term: [
      'Deploy advanced sea level and wave monitoring network with real-time data integration to municipal emergency systems',
      'Conduct high-resolution flood modeling using LIDAR data and climate projections for 1m, 2m, and 5m sea level rise scenarios',
      'Implement early warning system with automated alerts to residents, businesses, and infrastructure operators',
      'Create rapid response protocols with pre-positioned flood barriers and emergency equipment deployment strategies'
    ],
    medium_term: [
      'Construct living shoreline projects combining engineered structures with salt marsh and eelgrass restoration',
      'Implement smart flood barriers with sensor-controlled operation and predictive deployment algorithms',
      'Restore coastal dunes and create sacrificial beach nourishment programs using sustainable sand sources',
      'Upgrade critical infrastructure with flood-proofing measures including elevated utilities and waterproof building codes'
    ],
    long_term: [
      'Develop comprehensive managed retreat strategy for highest-risk coastal areas with community relocation support',
      'Create regional flood risk management cooperation with shared infrastructure and cost-sharing agreements',
      'Implement floating infrastructure for critical services that can adapt to varying water levels',
      'Establish blue-green infrastructure corridors that provide flood protection while enhancing biodiversity'
    ]
  },
  estimated_impact: {
    kpi_improvement: '+20-30%',
    co2_reduction_tonnes: 280,
    cost_estimate_eur: '€8-15M',
    roi_timeline: '10-15 years'
  },
  implementation: {
    stakeholders: [
      'Swedish Meteorological and Hydrological Institute (SMHI)',
      'Swedish Civil Contingencies Agency (MSB)',
      'Coastal property owners and developers',
      'Insurance companies and risk assessment firms',
      'Engineering consultancies specializing in coastal protection',
      'Tourism industry representatives',
      'Emergency services and municipal crisis management'
    ],
    timeline_months: 72,
    budget_sources: [
      'EU Cohesion Fund for climate adaptation',
      'UN Green Climate Fund applications',
      'Swedish National Adaptation Fund',
      'Insurance industry risk reduction investments',
      'Municipal adaptation bonds and special assessments',
      'Private-public partnership for critical infrastructure'
    ],
    success_metrics: [
      'Flood resilience index improvement',
      'Reduction in flood damage costs per extreme event',
      'Population and assets protected from 100-year flood scenarios',
      'Early warning system accuracy and response times',
      'Ecosystem service provision from nature-based solutions'
    ]
  },
  evidence: {
    data_sources: [
      'SMHI sea level and wave measurement stations',
      'MSB flood risk assessment maps',
      'Historical flood damage insurance claims data',
      'LIDAR elevation surveys and bathymetric mapping',
      'Climate projection ensemble models'
    ],
    baseline_values: {
      'Current resilience index': kpi.value,
      'Properties at risk (1m SLR)': 230,
      'Annual flood damage (€M)': 1.2,
      'Critical infrastructure at risk': 8,
      'Early warning lead time (hours)': 4
    },
    benchmarks: 'Netherlands Delta Works standards, Copenhagen cloud burst management, OECD coastal adaptation best practices'
  },
  regulatory_framework: {
    eu_directives: [
      'Floods Directive 2007/60/EC',
      'Environmental Impact Assessment Directive',
      'Strategic Environmental Assessment Directive',
      'Public Procurement Directive for infrastructure'
    ],
    national_legislation: [
      'Planning and Building Act (2010:900)',
      'Civil Protection Act',
      'Environmental Code for coastal construction',
      'Crisis Management and Civil Defence legislation'
    ],
    local_permits: [
      'Coastal construction and modification permits',
      'Environmental permits for nature-based solutions',
      'Emergency management plan approvals',
      'Land use planning and zoning modifications'
    ]
  },
  co_benefits: [
    'Enhanced coastal ecosystem services and biodiversity',
    'Increased property values in protected areas',
    'Improved municipal bond ratings and borrowing capacity',
    'Enhanced tourism resilience and destination attractiveness',
    'Job creation in green infrastructure and adaptation sectors',
    'Reduced insurance premiums for protected properties'
  ],
  risks: [
    'Accelerated sea level rise may exceed design parameters',
    'High capital costs may strain municipal finances',
    'Nature-based solutions require long establishment periods',
    'Community resistance to managed retreat strategies',
    'Maintenance requirements for complex adaptive systems'
  ]
});

const generateCrossCuttingCTAs = (municipalityId: string, kpis: PilotKPI[]): CTARecommendation[] => {
  const recommendations: CTARecommendation[] = [];

  // Digital twin and smart city integration
  recommendations.push({
    id: 'digital-twin-integration',
    title: 'Municipal Digital Twin for Integrated Environmental Management',
    category: 'Digital Innovation',
    priority: 'medium',
    description: 'Deploy comprehensive digital twin platform integrating all environmental monitoring systems for predictive management and optimization of ecological performance across all KPI areas.',
    actions: {
      short_term: [
        'Establish unified data platform integrating all environmental monitoring systems with standardized APIs',
        'Deploy IoT sensor networks for comprehensive environmental parameter monitoring',
        'Implement machine learning algorithms for predictive environmental modeling and early warning systems',
        'Create citizen engagement portal for environmental data access and community reporting'
      ],
      medium_term: [
        'Develop 3D digital twin model incorporating real-time environmental data streams',
        'Implement scenario planning tools for climate adaptation and infrastructure investment decisions',
        'Deploy AI-powered optimization algorithms for integrated resource management',
        'Create virtual reality training systems for environmental emergency response'
      ],
      long_term: [
        'Establish regional digital twin network connecting Baltic Sea municipalities',
        'Implement blockchain-based environmental data verification and carbon credit systems',
        'Deploy autonomous monitoring systems with self-maintaining sensor networks',
        'Create predictive policy modeling tools for long-term environmental planning'
      ]
    },
    estimated_impact: {
      kpi_improvement: '+10-15%',
      co2_reduction_tonnes: 420,
      cost_estimate_eur: '€2.8-4.5M',
      roi_timeline: '5-7 years'
    },
    implementation: {
      stakeholders: [
        'Municipal IT department',
        'Technology vendors and system integrators',
        'Research universities and innovation centers',
        'Environmental monitoring agencies',
        'Data analytics and AI companies',
        'Citizen groups and environmental organizations',
        'Regional municipal cooperation networks'
      ],
      timeline_months: 36,
      budget_sources: [
        'EU Digital Europe Programme funding',
        'Swedish Innovation Agency (Vinnova) grants',
        'Smart city development funds',
        'Technology vendor partnerships',
        'Municipal digitization budgets',
        'Research and development tax incentives'
      ],
      success_metrics: [
        'Integration of environmental data streams',
        'Predictive model accuracy for environmental events',
        'Reduction in environmental management costs',
        'Citizen engagement with environmental platforms',
        'Decision support system utilization rates'
      ]
    },
    evidence: {
      data_sources: [
        'All existing municipal environmental monitoring systems',
        'Satellite imagery and remote sensing data',
        'Weather and climate modeling outputs',
        'Citizen science and crowdsourced environmental data',
        'Academic research and monitoring programs'
      ],
      baseline_values: {
        'Data integration level (%)': 25,
        'Predictive accuracy (%)': 65,
        'Response time (hours)': 8,
        'Citizen engagement rate (%)': 15,
        'System maintenance costs (€K/year)': 180
      },
      benchmarks: 'Barcelona smart city initiatives, Amsterdam circular city dashboard, Singapore smart nation environmental programs'
    },
    regulatory_framework: {
      eu_directives: [
        'Open Data Directive 2019/1024',
        'GDPR for citizen data protection',
        'Digital Services Act requirements',
        'Cybersecurity Directive (NIS2)'
      ],
      national_legislation: [
        'Swedish Public Access to Information Act',
        'Personal Data Act implementation',
        'Digital government service requirements',
        'Cybersecurity and information security laws'
      ],
      local_permits: [
        'Data processing and privacy approvals',
        'Technology procurement compliance',
        'Telecommunications infrastructure permits',
        'Public information system authorizations'
      ]
    },
    co_benefits: [
      'Enhanced municipal operational efficiency',
      'Improved citizen services and transparency',
      'Attraction of technology industry and innovation',
      'Strengthened emergency response capabilities',
      'Enhanced regional cooperation and knowledge sharing',
      'Development of exportable municipal technology solutions'
    ],
    risks: [
      'Cybersecurity vulnerabilities and data breaches',
      'High technology investment and maintenance costs',
      'Staff training and capacity building requirements',
      'Technology obsolescence and upgrade needs',
      'Privacy concerns and citizen acceptance challenges'
    ]
  });

  return recommendations;
};