/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
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
        'architecture/granular-permissions',
        'architecture/delegation-hierarchy',
        'architecture/security-model',
      ],
    },
    {
      type: 'category',
      label: 'Implementation',
      items: [
        'implementation/ensip19-compliance',
        'implementation/audit-logging',
        'implementation/metadata-management',
        'implementation/permissions-integration',
        'implementation/tooling-organization',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/delegation-system',
        'guides/ens-permissions',
        'guides/naming-delegation',
        'guides/ensip19-quickstart',
        'guides/practical-solutions',
        'guides/ui-permissions',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/cli-commands',
        'api/typescript-sdk',
        'api/smart-contracts',
        'api/marketplace-integration',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/production-setup',
        'deployment/seaport-integration',
        'deployment/verification',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/complete-delegation-tree',
        'examples/secondary-delegate-visual',
        'examples/presentation-script',
        'examples/schema-preview-editor',
      ],
    },
    {
      type: 'category',
      label: 'Comparisons',
      items: [
        'comparisons/ens-vs-delegation',
        'comparisons/feature-table',
        'comparisons/contract-naming',
      ],
    },
  ],
};

module.exports = sidebars;
