import React from 'react';
import styles from './styles.module.scss';
import * as Tabs from '@radix-ui/react-tabs';
import { LinkButton } from '/src/theme/Buttons';
import { ButtonContainer } from '../../../theme/Buttons';

export default function HomepageWhatYouCanDo() {
  return (
    <div className="container">
      <div className={styles.header}>
        <h2 className={styles.title}>你可以用Weaviate做什么</h2>
        <p className={styles.subtitle}>
          超越搜索，Weaviate的下一代向量数据库可以支持各种创新应用。
        </p>
      </div>
      <div className={styles.module}>
        <Tabs.Root className={styles.tabs} defaultValue="tab1">
          <div className={styles.left}>
            <Tabs.List
              className={styles.tabsList}
              aria-label="你可以用Weaviate做什么"
            >
              <Tabs.Trigger
                className={styles.tabsTrigger}
                value="tab1"
                disabled={false}
              >
                <h3>向量搜索</h3>
                <p>
                  在原始向量或数据对象上执行极快的纯向量相似性搜索，即使有过滤器也可以。
                </p>
              </Tabs.Trigger>
              <Tabs.Trigger className={styles.tabsTrigger} value="tab2">
                <h3>混合搜索</h3>
                <p>
                  将基于关键字的搜索与向量搜索技术相结合，获得最先进的结果。
                </p>
              </Tabs.Trigger>
              <Tabs.Trigger className={styles.tabsTrigger} value="tab3">
                <h3>生成式搜索</h3>
                <p>
                  将任何生成模型与您的数据结合使用，例如进行数据集的Q&A。
                </p>
              </Tabs.Trigger>
            </Tabs.List>
          </div>
          <div className={styles.right}>
            <Tabs.Content className={styles.tabsContent} value="tab1">
              <div className={styles.codeContainer}>
                <p className={styles.codeImage + ' ' + styles.code1}></p>
                <ButtonContainer position='left'>
                  <LinkButton
                    link="https://console.weaviate.io/console/query#weaviate_uri=https://demo.dataset.playground.semi.technology&graphql_query=%7B%0A%20%20Get%20%7B%0A%20%20%20%20Publication(%0A%20%20%20%20%20%20nearText%3A%20%7B%0A%20%20%20%20%20%20%20%20concepts%3A%20%5B%22fashion%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%201%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20_additional%20%7B%0A%20%20%20%20%20%20%20%20certainty%0A%20%20%20%20%20%20%20%20distance%0A%20%20%20%20%20%20%20%20vector%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D"
                  >尝试向量搜索</LinkButton>
                </ButtonContainer>
              </div>
            </Tabs.Content>
            <Tabs.Content className={styles.tabsContent} value="tab2">
              <div className={styles.codeContainer}>
                <p className={styles.codeImage + ' ' + styles.code2}></p>

                <ButtonContainer position='left'>
                  <LinkButton
                    link="https://console.weaviate.io/console/query#weaviate_uri=https://demo.dataset.playground.semi.technology&graphql_query=%7B%0A%20%20Get%20%7B%0A%20%20%20%20Article(%0A%20%20%20%20%20%20hybrid%3A%20%7B%0A%20%20%20%20%20%20%20%20query%3A%20%22Board%20games%20people%20are%20looking%20out%20for%22%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%2010%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20summary%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20wordCount%0A%20%20%20%20

%7D%0A%20%20%7D%0A%7D"
                  >尝试混合搜索</LinkButton>
                </ButtonContainer>
              </div>
            </Tabs.Content>
            <Tabs.Content className={styles.tabsContent} value="tab3">
              <div className={styles.codeContainer}>
                <p className={styles.codeImage + ' ' + styles.code3}></p>
                <ButtonContainer position='left'>
                  <LinkButton
                    link="https://console.weaviate.io/console/query#weaviate_uri=https://demo.dataset.playground.semi.technology&graphql_query=%7B%0A%20%20Get%20%7B%0A%20%20%20%20Article(%0A%20%20%20%20%20%20ask%3A%20%7B%0A%20%20%20%20%20%20%20%20question%3A%20%22What%20movie%20did%20Ravensburger%20create%20a%20board%20game%20about%3F%22%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%201%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20summary%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20wordCount%0A%20%20%20%20%20%20_additional%20%7B%0A%20%20%20%20%20%20%20%20answer%20%7B%0A%20%20%20%20%20%20%20%20%20%20result%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D"
                  >尝试生成式搜索</LinkButton>
                </ButtonContainer>
              </div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}
