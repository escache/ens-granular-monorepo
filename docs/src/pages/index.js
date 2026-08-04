import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const icons = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  factory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21h16" />
      <path d="M2 21V10l6-3 3 3 3-3 6 3v11" />
      <rect x="10" y="14" width="4" height="7" />
      <rect x="6" y="14" width="4" height="7" />
      <rect x="14" y="14" width="4" height="7" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

const features = [
  {
    title: 'Granular Permissions',
    icon: icons.shield,
    description: (
      <>
        Grant precise, individual operation permissions to delegates without
        handing over full control of your ENS domains.
      </>
    ),
  },
  {
    title: 'Factory Pattern',
    icon: icons.factory,
    description: (
      <>
        Deploy isolated delegate contracts per project so bugs, upgrades, and
        permission changes stay safely compartmentalized.
      </>
    ),
  },
  {
    title: 'ENSIP-19 Compliance',
    icon: icons.file,
    description: (
      <>
        Follow the ENSIP-19 specification for standardized metadata, ensuring
        broad compatibility across the ENS ecosystem.
      </>
    ),
  },
  {
    title: 'Marketplace Integration',
    icon: icons.store,
    description: (
      <>
        Trade domains through OpenSea Seaport with built-in order validation
        and delegated listing support.
      </>
    ),
  },
  {
    title: 'CLI Tools',
    icon: icons.terminal,
    description: (
      <>
        Automate deployments, delegation, and batch operations from the terminal
        with a fully typed command-line interface.
      </>
    ),
  },
  {
    title: 'TypeScript SDK',
    icon: icons.code,
    description: (
      <>
        Build custom integrations with full type safety and comprehensive
        coverage of the entire ENS Granular API surface.
      </>
    ),
  },
];

const highlights = [
  { value: '6', label: 'Core Modules' },
  { value: '16+', label: 'Management Tabs' },
  { value: '100%', label: 'TypeScript' },
  { value: '0', label: 'Central Admin Keys' },
];

function Feature({ title, icon, description }) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <div className={styles.featureTitle}>{title}</div>
        <div className={styles.featureDescription}>{description}</div>
      </div>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description={siteConfig.tagline}>
      <header className={clsx('hero', styles.heroBanner)}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
            <p className={styles.heroSubtitle}>
              Fine-grained ENS domain delegation with factory-isolated projects,
              marketplace integration, and programmable permissions.
            </p>
            <div className={styles.buttons}>
              <Link
                className={clsx(
                  'button button--primary button--lg',
                  styles.getStarted,
                )}
                to={useBaseUrl('docs/intro')}>
                Get Started
              </Link>
              <Link
                className={clsx(
                  'button button--outline button--lg',
                  styles.buttonGhost,
                )}
                to={useBaseUrl('docs/quickstart')}>
                Quick Start
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.highlights}>
          <div className="container">
            <div className={styles.highlightGrid}>
              {highlights.map((item, idx) => (
                <div className={styles.highlightItem} key={idx}>
                  <div className={styles.highlightValue}>{item.value}</div>
                  <div className={styles.highlightLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={styles.codeSection}>
          <div className="container">
            <div className={styles.codeGrid}>
              <div className={styles.codeText}>
                <h2 className={styles.sectionTitle}>Deploy in minutes</h2>
                <p className={styles.sectionLead}>
                  Spin up a dedicated delegate contract for your project, set
                  granular permissions, and start managing ENS names
                  programmatically.
                </p>
                <Link
                  className="button button--primary button--lg"
                  to={useBaseUrl('docs/quickstart')}>
                  Read the Quickstart
                </Link>
              </div>
              <div className={styles.codeWindow}>
                <div className={styles.codeTabs}>
                  <span className={styles.codeDot} />
                  <span className={styles.codeDot} />
                  <span className={styles.codeDot} />
                </div>
                <pre className={styles.codePre}>
                  <code>
                    {`npm install -g @ens-granular/cli

ens-granular factory create --name "MyProject"
ens-granular delegate set example.eth \\
  --primary 0x1234...abcd \\
  --permissions create-subdomain,set-resolver`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Ready to get started?</h2>
              <p className={styles.ctaText}>
                Explore the documentation to deploy your first factory contract,
                configure permissions, and integrate ENS Granular into your
                workflow.
              </p>
              <div className={styles.buttons}>
                <Link
                  className="button button--primary button--lg"
                  to={useBaseUrl('docs/intro')}>
                  View Documentation
                </Link>
                <Link
                  className={clsx('button button--outline button--lg', styles.buttonGhostAlt)}
                  to={useBaseUrl('docs/architecture/overview')}>
                  Architecture
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
