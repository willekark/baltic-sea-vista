/**
 * Navigation configuration - single source of truth for all navigation elements
 * Used by header, footer, CTAs, and any navigation components
 */

import { ROUTE_CANON, type CanonicalRoute } from './routes';

export interface NavItem {
  label: string;
  href: CanonicalRoute;
  description?: string;
  icon?: string;
  testId: string;
  external?: boolean;
  newTab?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Header navigation
export const HEADER_NAV: NavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Return to homepage",
    testId: "nav-home"
  },
  {
    label: "Intelligence",
    href: "/intelligence",
    description: "Maritime intelligence dashboard",
    testId: "nav-intelligence"
  },
  {
    label: "Eutrophication",
    href: "/eutrophication", 
    description: "Environmental monitoring reports",
    testId: "nav-eutrophication"
  },
  {
    label: "Shadow Fleet",
    href: "/shadow-fleet",
    description: "Vessel tracking and analysis",
    testId: "nav-shadow-fleet"
  },
  {
    label: "Port Agent",
    href: "/port-agent",
    description: "Port operations dashboard",
    testId: "nav-port-agent"
  },
  {
    label: "Investor Intelligence",
    href: "/investor",
    description: "Baltic investment analytics",
    testId: "nav-investor"
  },
  {
    label: "AI Orchestrator",
    href: "/ai-orchestrator",
    description: "Unified AI intelligence platform",
    testId: "nav-ai-orchestrator"
  },
  {
    label: "Financial Reports",
    href: "/financial-reports",
    description: "AI-powered financial intelligence reports",
    testId: "nav-financial-reports"
  },
  {
    label: "AI Report Generator",
    href: "/ai-reports",
    description: "Interactive maritime intelligence report generator",
    testId: "nav-ai-reports"
  }
];

// Hero section CTAs
export const HERO_CTAS: NavItem[] = [
  {
    label: "Get Started",
    href: "/intelligence",
    description: "Access intelligence dashboard",
    testId: "cta-get-started"
  },
  {
    label: "Port Services", 
    href: "/port-agent",
    description: "Access port agent dashboard",
    testId: "cta-port-services"
  },
  {
    label: "Track Vessels",
    href: "/shadow-fleet", 
    description: "Monitor vessel movements",
    testId: "cta-track-vessels"
  }
];

// Dashboard quick actions
export const DASHBOARD_ACTIONS: NavItem[] = [
  {
    label: "Port Agent Services",
    href: "/port-agent",
    description: "Comprehensive port operations suite",
    testId: "action-port-agent"
  },
  {
    label: "Intelligence Hub", 
    href: "/intelligence",
    description: "Maritime intelligence and analytics",
    testId: "action-intelligence"
  },
  {
    label: "Fleet Tracker",
    href: "/shadow-fleet",
    description: "Advanced vessel monitoring",
    testId: "action-fleet-tracker"
  }
];

// Footer navigation sections
export const FOOTER_NAV: NavSection[] = [
  {
    title: "Platform",
    items: [
      {
        label: "Intelligence Dashboard",
        href: "/intelligence",
        testId: "footer-intelligence"
      },
      {
        label: "Environmental Reports", 
        href: "/eutrophication",
        testId: "footer-eutrophication"
      },
      {
        label: "Shadow Fleet Tracker",
        href: "/shadow-fleet", 
        testId: "footer-shadow-fleet"
      },
      {
        label: "Port Agent Services",
        href: "/port-agent",
        testId: "footer-port-agent"
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        label: "Sign In",
        href: "/auth",
        testId: "footer-auth"
      }
    ]
  }
];

// Features section navigation
export const FEATURES_NAV: NavItem[] = [
  {
    label: "Explore Intelligence",
    href: "/intelligence", 
    testId: "feature-intelligence"
  },
  {
    label: "Try Port Services",
    href: "/port-agent",
    testId: "feature-port-agent"
  }
];

// Utility function to get nav item by test ID
export const getNavItemByTestId = (testId: string): NavItem | undefined => {
  const allNavItems = [
    ...HEADER_NAV,
    ...HERO_CTAS, 
    ...DASHBOARD_ACTIONS,
    ...FOOTER_NAV.flatMap(section => section.items),
    ...FEATURES_NAV
  ];
  
  return allNavItems.find(item => item.testId === testId);
};

// Utility to validate all nav hrefs are canonical
export const validateNavigation = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const allNavItems = [
    ...HEADER_NAV,
    ...HERO_CTAS,
    ...DASHBOARD_ACTIONS, 
    ...FOOTER_NAV.flatMap(section => section.items),
    ...FEATURES_NAV
  ];
  
  allNavItems.forEach(item => {
    if (!(item.href in ROUTE_CANON)) {
      errors.push(`Invalid route in nav: ${item.href} (${item.label})`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};