import React from 'react';
import { ButtonContainer } from '../../../theme/Buttons';
import styles from './styles.module.scss';
import { LinkButton } from '/src/theme/Buttons';

export default function HomePage() {
  return (
    <div className="container">
      <div className={styles.header}>
        <h2>
        开发者体验与社区
        </h2>
        <p>
        因为我们关心你从零开始到产品发布的速度，<br/>我们致力于通过以下方式为我们的社区服务：
        </p>
        <p>
          <i className="fas fa-stars"></i> 发布开源项目<br/>
          <i className="fas fa-stars"></i> 创建有价值的SaaS服务<br/>
          <i className="fas fa-stars"></i> 与您喜欢的嵌入提供商和框架进行集成
        </p>

        <ButtonContainer>
          <LinkButton link="https://weaviate.io/slack">在Slack上加入我们的社区</LinkButton>
        </ButtonContainer>
      </div>
      <div className={styles.features}>
        <div className={styles.box}>
          <p className={styles.icon1}></p>
          <h4 className={styles.title}>向量搜索</h4>
          <p className={styles.subTitle}>
            无论您是带入自己的向量还是使用向量化模块，都可以索引数十亿的数据对象进行搜索。
          </p>
        </div>
        <div className={styles.box}>
          <p className={styles.icon2}></p>
          <h4 className={styles.title}>混合搜索</h4>
          <p className={styles.subTitle}>
            结合多种搜索技术，如基于关键词的搜索和向量搜索，提供最先进的搜索体验。
          </p>
        </div>
        <div className={styles.box}>
          <p className={styles.icon3}></p>
          <h4 className={styles.title}>生成性搜索</h4>
          <p className={styles.subTitle}>
            通过将搜索结果通过LLM模型（如GPT-3）进行处理，提升您的搜索结果，创造下一代搜索体验。
          </p>
        </div>
      </div>
    </div>
  );
}
