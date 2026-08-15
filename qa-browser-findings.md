# QA browser findings

- Preview URL: https://3000-iat03gm6mwkivgve9bp81-3c2d8d14.us2.manus.computer/
- The home page loads successfully in Arabic by default.
- `document` presentation is RTL in the screenshot; Arabic hero text, stats labels, CTA, and footer render correctly.
- The language switcher is visible and labeled English.
- The preview browser showed stale English feature cards and How It Works text immediately after source edits; a production build/reload is required before re-checking those sections.
- The managed screenshot helper temporarily reported no preview URL after restart, so browser navigation was used for verification.


The language switch was verified in both directions. English renders with LTR layout and translated English copy; switching back restores Arabic RTL layout. The current browser session still displayed English feature-card and How It Works strings while the source had just been edited, indicating the preview served a stale compiled bundle during that check; the source build and TypeScript checks are the authoritative validation until the preview refreshes its bundle.


Mobile QA was completed on the home page at 375×812. Arabic RTL is readable, the hero wraps without horizontal overflow, the header controls remain usable, and the CTA buttons fit the narrow viewport. The English LTR switch was also verified; hero, stats, feature cards, and workflow copy render in English with the opposite direction. The dashboard route could not be inspected because the current browser session had no authentication cookie and correctly showed the localized sign-in boundary.
