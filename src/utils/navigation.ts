/**
 * Navigation utilities and smooth scrolling functions
 */

import { ROUTE_CANON, getCanonicalRoute, hasAnchor } from '@/config/routes';

/**
 * Smooth scroll to anchor accounting for fixed header
 */
export const scrollToHash = (hash: string, offset: number = 80): void => {
  const element = document.getElementById(hash);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
  
  // Update URL hash
  window.history.replaceState(null, '', `#${hash}`);
};

/**
 * Navigate with hash support for React Router
 */
export const navigateWithHash = (
  navigate: (path: string) => void, 
  path: string, 
  hash?: string
): void => {
  if (hash && hasAnchor(path, hash)) {
    navigate(`${path}#${hash}`);
    // Scroll to element after navigation
    setTimeout(() => scrollToHash(hash), 100);
  } else {
    navigate(path);
  }
};

/**
 * Validate if a link target is safe and accessible
 */
export const validateLinkTarget = (href: string): {
  valid: boolean;
  external: boolean;
  secure: boolean;
  canonical?: string;
} => {
  try {
    const url = new URL(href, window.location.origin);
    const isExternal = url.origin !== window.location.origin;
    const isSecure = url.protocol === 'https:' || url.hostname === 'localhost';
    
    if (isExternal) {
      return {
        valid: true,
        external: true,
        secure: isSecure
      };
    }
    
    // Internal link validation
    const canonical = getCanonicalRoute(url.pathname);
    const isValidRoute = canonical in ROUTE_CANON;
    
    return {
      valid: isValidRoute,
      external: false,
      secure: true,
      canonical
    };
    
  } catch (error) {
    return {
      valid: false,
      external: false,
      secure: false
    };
  }
};

/**
 * Get proper link attributes for external links
 */
export const getExternalLinkProps = (href: string) => {
  const validation = validateLinkTarget(href);
  
  if (validation.external) {
    return {
      target: '_blank',
      rel: 'noopener noreferrer'
    };
  }
  
  return {};
};