import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const features = [
  {
    title: 'Granular Permissions',
    description: (
      <>
        Fine-grained delegation control with individual operation permissions,
        allowing you to grant specific capabilities without compromising security.
      </>
    ),
  },
  {
    title: 'Factory Pattern',
    description: (
      <>
        Each project gets its own isolated delegate contract, ensuring security,
        scalability, and clear permission boundaries.
      </>
    ),
  },
  {
    title: 'ENSIP-19 Compliance',
    description: (
      <>
        Full support for the ENSIP-19 specification, providing standardized
        metadata handling across the ecosystem.
      </>
    ),
  },
  {
    title: 'Marketplace Integration',
    description: (
      <>
        Built-in OpenSea Seaport protocol support for seamless domain trading
        and marketplace functionality.
      </>
    ),
  },
  {
    title: 'CLI Tools',
    description: (
      <>
        Powerful command-line interface for efficient domain management
        operations with comprehensive command support.
      </>
    ),
  },
  {
    title: 'TypeScript SDK',
    description: (
      <>
        Complete programmatic access with full type safety and comprehensive
        API coverage for all operations.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="feature-card">
        <div className="feature-card__title">{title}</div>
        <div className="feature-card__description">{description}</div>
      </div>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description={siteConfig.tagline}>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/intro')}>
              Get Started
            </Link>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/quickstart')}>
              Quick Start
            </Link>
          </div>
        </div>
      </header>
      <main>
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
        <section className="padding-vert--xl">
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <div className="text--center">
                  <h2>Ready to get started?</h2>
                  <p>
                    ENS Granular provides everything you need to manage ENS domains
                    with granular permissions and delegation controls.
                  </p>
                  <div className="margin-top--lg">
                    <Link
                      className="button button--primary button--lg"
                      to={useBaseUrl('docs/intro')}>
                      View Documentation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;