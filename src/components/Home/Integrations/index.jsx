import React from 'react';
import { ButtonContainer } from '../../../theme/Buttons';
import styles from './styles.module.scss';
import { LinkButton } from '/src/theme/Buttons';

export default function HomepageIntegrations() {
  return (
    <div className="container">
      <div className={styles.box}>
        <div className={styles.left}>
          <div className={styles.inside}>
            <span className={styles.logoAI} />
            <span className={styles.logoH} />
            <span className={styles.logoJ} />
          </div>
          <div className={styles.inside}>
            <span className={styles.logoD} />
            <span className={styles.logoCo} />
            <span className={styles.logoW} />
          </div>
        </div>
        <div className={styles.right}>
          <h2>集成</h2>
          <p>
            除了Weaviate的能力可以带入您自己的向量，您还可以选择其中一个带有开箱即用向量化支持的Weaviate模块。您还可以从Weaviate集成的各种知名神经搜索框架中进行选择。
          </p>
          <ButtonContainer position='left'>
            <LinkButton link="/developers/weaviate/modules" newTab={false}>了解Weaviate模块</LinkButton>
          </ButtonContainer>
        </div>
      </div>
    </div>
  );
}
