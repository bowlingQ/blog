import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import avatar from '../../static/img/logo.jpg'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

function Frame(): JSX.Element {
  if (ExecutionEnvironment.canUseDOM) {
    let script = document.querySelector('#script')
    if (script) {
      return null
    }
    script = document.createElement('script')
    script.id = 'script'
    script.innerHTML = `
    (function () {
      let div = document.createElement('div');
      div.id = 'CloudCourierContainer';
      div.style.setProperty('position', 'fixed', 'important');
      div.style.setProperty('right', '20px', 'important');
      div.style.setProperty('bottom', '0', 'important');
      let body = document.querySelector('body');
      body.appendChild(div);
      var s1 = document.createElement('script'),
        s0 = document.getElementsByTagName('script')[0];
      s1.async = true;
      s1.src =
        'https://www.zhangbaolin001.cn/upload/2022/05/CloudCourierInit-bd2daf834a7e44abb619ff1f98c998ae.js';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();`
    document.querySelector('body').appendChild(script)
  }
  return null
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className='container'>
        <div className={styles.avatar}>
          <img src={avatar} alt='avatar' />
        </div>
        <h1 className='hero__title'>{siteConfig.title}</h1>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className='button button--secondary button--lg'
            to='/docs/diary'
          >
            Read my diary
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description='Description will go into a meta tag in <head />'
    >
      <HomepageHeader />
      {/* <main>
        <HomepageFeatures />
      </main> */}
      {/* <Frame /> */}
    </Layout>
  )
}
