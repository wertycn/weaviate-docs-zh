import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.scss';

export default function HomepageCompany() {
  return (
    <div className="container">
      <h2>
        我们相信开源
      </h2>
      <p>
      Weaviate是开源的，任何人都可以在任何地方使用。我们的服务是围绕SaaS，混合SaaS和行业标准服务级别协议创建的。
      </p>
      <div className={styles.links}>
        <Link to="/company/about-us#our_company_values">
          我们的价值观 {'>'}
        </Link>
        <Link href="https://careers.weaviate.io/">职业 {'>'}</Link>
        <Link to="/company/playbook">
          我们的工作方式 - 手册 {'>'}
        </Link>
        <Link to="/company/about-us#meet_the_team">
          认识我们的团队 {'>'}
        </Link>
        <Link to="/company/investors">
          投资者 {'>'}
        </Link>
        <Link to="mailto:hello@weaviate.io">联系我们 {'>'}</Link>
      </div>
    </div>
  );
}
