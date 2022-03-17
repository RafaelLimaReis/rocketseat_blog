import Link from 'next/link';

import styles from './styles.module.scss';
import common from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${styles.logo} ${common.limitContent}`}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
