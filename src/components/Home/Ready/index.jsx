import React from 'react';
import styles from './styles.module.scss';
import Link from '@docusaurus/Link';

export default function HomepageReady() {
  return (
    <div className="container">
      <p className={styles.logo} />
      <h2 className={styles.title}>准备好开始了吗？</h2>
      <div className={styles.links}>
        <p>
          跟随{' '}
          <Link to="/developers/weaviate/quickstart">
            快速开始教程 {'>'}{' '}
          </Link>
        </p>
        <p>
          或者申请访问{' '}
          <Link className={styles.color} to="https://console.weaviate.cloud">
            Weaviate Cloud Services {'>'}{' '}
          </Link>
        </p>
      </div>
    </div>
  );
}
