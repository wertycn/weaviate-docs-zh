import React from 'react';
import {ButtonContainer} from '../../../theme/Buttons';
import styles from './styles.module.scss';
import {LinkButton} from '/src/theme/Buttons';
import Link from '@docusaurus/Link';

export default function HomepageHeader() {
  return (
    <header>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.leftGrid}>
            <p className={styles.title}>
              AI原生<br/>向量数据库
            </p>
            <p className={styles.text}>
              Weaviate是一个开源的向量数据库。
              它允许您存储数据对象和来自您最喜欢的机器学习模型的向量嵌入，并无缝扩展到数十亿的数据对象。
            </p>
            <div className={styles.buttons}>
              <Link className={styles.buttonGradient} to="https://console.weaviate.cloud">
                免费开始
              </Link>
              <Link
                className={styles.buttonOutline}
                to="/developers/weaviate"
              >
                文档
              </Link>
            </div>
          </div>
          <div className={styles.rightGrid}>
            <div className={styles.img}/>
          </div>
        </div>
      </div>
    </header>
  );
}
