import Link from 'next/link';
import styles from './header.module.scss';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function Header() {
  return (
    <Link href="/">
      <header className={styles.container}>
        <div>
          <img src="logo.svg" alt="logo" />
        </div>
      </header>
    </Link>
  );
}
