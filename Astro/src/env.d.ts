/// <reference types="astro/client" />

/**
 * Custom attributes used by the original Webflow markup. They are read by the
 * Webflow IX3 runtime (webflow.js) to attach scroll/entrance interactions.
 */
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    parallax?: string;
    'heading-rebuild'?: string;
    'title-animation'?: string;
  }
}

/** Lenis smooth-scroll library, loaded from a CDN script in BaseLayout. */
declare const Lenis: new (options?: Record<string, unknown>) => { raf(time: number): void };
