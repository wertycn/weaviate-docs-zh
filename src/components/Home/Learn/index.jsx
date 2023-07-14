import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.scss';

export default function HomepageLearn() {
  return (
    <div className="container">
      <div className={styles.header}>
        <h2>学习并获取灵感</h2>
        <p>
          学习如何使用Weaviate，看看人们用它建造了什么。
        </p>
      </div>
      <div className={styles.cards}>
        <div className={styles.left}>
          <Link to="/podcast">
            <h3 className={styles.title}>
              播客:
              <br /> 听取行业专家的见解
            </h3>
          </Link>
          <div className={styles.links}>
            <Link to="https://www.youtube.com/playlist?list=PLTL2JUbrY6tW-KOQfOek8dtUmPgGQj3F0">
              在YouTube上观看 {'>'}{' '}
            </Link>
            <Link to="https://open.spotify.com/show/4TlG6dnrWYdgN2YHpoSnM7">
              在Spotify上收听 {'>'}{' '}
            </Link>
          </div>
        </div>
        <div className={styles.middle}>
          <div className={styles.smallUp}>
            <h3 className={styles.title}>
              向量库对比向量数据库
            </h3>
            <div className={styles.linksSmall}>
              <Link to="/blog/vector-library-vs-vector-database">
                阅读博客 {'>'}{' '}
              </Link>
            </div>
          </div>
          <div className={styles.smallDown}>
            <h3 className={styles.title}>
              Weaviate + Jina AI用于图像搜索
            </h3>
            <div className={styles.linksSmall}>
              <Link to="https://www.youtube.com/watch?v=rBKvoIGihnY">
                观看教程 {'>'}{' '}
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.smallUp}>
            <h3 className={styles.title}>Weaviate的备份和恢复</h3>
            <div className={styles.linksSmall}>
              <Link to="/blog/tutorial-backup-and-restore-in-weaviate">
                阅读教程 {'>'}{' '}
              </Link>
            </div>
          </div>
          <div className={styles.smallDown}>
            <h3 className={styles.title}>为什么向量搜索如此快速？</h3>
            <div className={styles.linksSmall}>
              <Link to="/blog/why-is-vector-search-so-fast">
                阅读博客 {'>'}{' '}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
