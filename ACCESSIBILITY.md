# Accessibility

Scribe of Eras is intended to be usable by as many people as practical. Accessibility is an ongoing development responsibility, not a claim that the current application conforms to a particular accessibility standard.

## Commitment

As the interface develops, we aim to:

- Support keyboard navigation and visible focus indicators.
- Use semantic controls, headings, labels, and meaningful names for interactive elements.
- Maintain readable text, adequate contrast, and layouts that remain usable at increased zoom.
- Avoid communicating important information through color alone.
- Provide clear feedback for actions, errors, and state changes.
- Respect reduced-motion preferences where animation is used.
- Make core workflows usable on a range of screen sizes and with assistive technologies.

These are goals to test and improve; they should not be read as verified properties of every screen.

## Current environment and limitations

The project is a browser-based React application built with Vite and deployed through GitHub Pages. Development and playtesting have primarily targeted modern desktop browsers. Mobile layouts, keyboard-only operation, screen-reader behavior, high-contrast modes, and formal WCAG conformance have not yet been comprehensively audited.

Some prototype screens or interactions may therefore have barriers. Please report specific problems rather than assuming a feature is accessible because it renders in a browser.

## Reporting an accessibility barrier

Open a GitHub issue and use the accessibility label if available. Include:

- The page or workflow where the barrier occurs.
- What you were trying to do and what happened.
- Browser, operating system, assistive technology, and input method, if relevant.
- Steps to reproduce and screenshots or recordings, if useful and safe to share.
- Any workaround you found.

You do not need to know the technical cause or use formal accessibility terminology to report a barrier. Please avoid sharing personal or sensitive information in public reports.

Accessibility improvements and reviews are welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md).
