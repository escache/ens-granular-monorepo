/**
 * Sidebar configuration for available documentation pages.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'intro',
        'quickstart',
        'installation',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/factory-design',
        'architecture/final-architecture',
        'implementation-status',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/ens-permissions-guide',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'api/cli-summary',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/presentation-script',
      ],
    },
  ],
};

module.exports = sidebars;
