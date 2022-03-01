import Link from 'next/link';

import styles from './styles.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.logo}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
