/**
 * Canonical route configuration for the Maritime Intelligence Platform
 * Single source of truth for all routes and expected anchors
 */

export const ROUTE_CANON = {
  "/": { 
    title: "Maritime Intelligence Platform",
    anchors: ["hero", "marine-data", "intelligence-section", "interactive-map-section", "dashboard", "features"],
    description: "Real-time Baltic Sea maritime intelligence and analytics"
  },
  "/intelligence": { 
    title: "Intelligence Dashboard",
    anchors: ["overview", "alerts", "map", "cards", "summary", "provenance"],
    description: "Comprehensive maritime intelligence dashboard"
  },
  "/intelligence/integrated": { 
    title: "Integrated Intelligence",
    anchors: ["decision-hub"],
    description: "Advanced decision support and integrated analysis"
  },
  "/shipping": { 
    title: "Shipping Intelligence Hub",
    anchors: ["insights", "routes", "arbitrage", "contracts"],
    description: "Comprehensive maritime intelligence platform for shipping operations"
  },
  "/eutrophication": {
    title: "Eutrophication Reports",
    anchors: ["reports", "data-explorer"],
    description: "Baltic Sea eutrophication monitoring and reports"
  },
  "/shadow-fleet": { 
    title: "Shadow Fleet Tracker",
    anchors: ["tracker", "analysis", "alerts"],
    description: "Advanced vessel tracking and anomaly detection"
  },
  "/port-agent": { 
    title: "Port Agent Dashboard",
    anchors: ["dashboard", "services", "analytics"],
    description: "Port operations and agent services platform"
  },
  "/ecology": { 
    title: "Baltic Data Hub - Ecological Reporting",
    anchors: ["scorecard", "kpis", "ctas", "map", "evidence", "exports"],
    description: "Automated ecological scorecards and sustainability reporting for Baltic municipalities"
  },
  "/investor": {
    title: "Baltic Investor Intelligence",
    anchors: ["overview", "macro", "esg", "infrastructure", "risk", "blue", "analytics", "portfolio"],
    description: "Investment intelligence platform for Baltic region fund and asset managers"
  },
  "/energy": {
    title: "Energy Intelligence Hub",
    anchors: ["prices", "flows", "offshore-wind", "ops", "bunkering", "municipal"],
    description: "Grid prices, renewable output, OPS adoption, and green fuel infrastructure analytics"
  },
  "/ai-orchestrator": {
    title: "AI Orchestrator",
    anchors: ["analysis", "realtime", "reports"],
    description: "Unified Claude and OpenAI intelligence platform for comprehensive maritime analysis"
  },
  "/financial-reports": {
    title: "Financial Reports",
    anchors: ["reports", "analytics", "ai-consensus"],
    description: "AI-powered maritime financial intelligence and strategic decision making reports"
  },
  "/ai-reports": {
    title: "AI Report Generator",
    anchors: ["generator", "controls", "report"],
    description: "Interactive AI-powered Baltic Sea maritime intelligence report generator"
  },
  "/auth": { 
    title: "Authentication",
    anchors: [],
    description: "User authentication and access control"
  }
} as const;

export const ROUTE_REDIRECTS = {
  "/marine-data": "/",
  "/marine": "/", 
  "/dashboard": "/intelligence",
  "/login": "/auth",
  "/signup": "/auth",
  "/pilot-east-sweden": "/ecology"
} as const;

// Type helpers
export type CanonicalRoute = keyof typeof ROUTE_CANON;
export type RouteRedirect = keyof typeof ROUTE_REDIRECTS;

export const isValidRoute = (path: string): path is CanonicalRoute => {
  return path in ROUTE_CANON;
};

export const getCanonicalRoute = (path: string): CanonicalRoute => {
  if (isValidRoute(path)) return path;
  if (path in ROUTE_REDIRECTS) return ROUTE_REDIRECTS[path as RouteRedirect];
  return "/";
};

export const getRouteTitle = (path: string): string => {
  const canonical = getCanonicalRoute(path);
  return ROUTE_CANON[canonical].title;
};

export const getRouteDescription = (path: string): string => {
  const canonical = getCanonicalRoute(path);
  return ROUTE_CANON[canonical].description;
};

export const hasAnchor = (path: string, anchor: string): boolean => {
  const canonical = getCanonicalRoute(path);
  return (ROUTE_CANON[canonical].anchors as readonly string[]).includes(anchor);
};