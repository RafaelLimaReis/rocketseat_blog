import { GetStaticProps } from 'next';

import * as Prismic from '@prismicio/client';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import PtBR from 'date-fns/locale/pt-BR';
import { FiCalendar } from 'react-icons/fi';
import { BsPerson } from 'react-icons/bs';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>

      <main className={styles.content}>
        {postsPagination.results.map(post => (
          <div key={post.uid} className={styles.post}>
            <Link href="/">
              <a className={styles.post_link}>
                <strong className={styles.title}>{post.data.title}</strong>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
              </a>
            </Link>
            <div className={styles.info}>
              <time>
                <FiCalendar className={styles.icon_calendar} />
                {post.first_publication_date}
              </time>
              <span className={styles.author}>
                <BsPerson className={styles.icon_author} />
                {post.data.author}
              </span>
            </div>
          </div>
        ))}
        {postsPagination.next_page && (
          <button type="button" className={styles.buttonPage}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicate.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: PtBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse?.next_page ?? null,
        results: posts,
      },
    },
  };
};
