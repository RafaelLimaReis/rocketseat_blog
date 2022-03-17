import { GetStaticProps } from 'next';

import * as Prismic from '@prismicio/client';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import PtBR from 'date-fns/locale/pt-BR';
import { FiCalendar } from 'react-icons/fi';
import { BsPerson } from 'react-icons/bs';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import common from '../styles/common.module.scss';

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
  const [nextPosts, setNextPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const formatDate = (date: string): string => {
    return format(new Date(date), 'dd MMM yyyy', { locale: PtBR });
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSeeMore = async () => {
    const response = await fetch(nextPage);
    const data = await response.json();

    setNextPage(data.next_page);

    const posts: Post[] = data.results.map(
      (post: Post) =>
        ({
          uid: post.uid,
          data: {
            author: post.data.author,
            title: post.data.title,
            subtitle: post.data.subtitle,
          },
          first_publication_date: post.first_publication_date,
        } as Post)
    );

    setNextPosts(prevState => [...prevState, ...posts]);
  };
  console.log(nextPosts);
  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>

      <main className={`${styles.content} ${common.limitContent}`}>
        {nextPosts.map(post => (
          <div key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a className={styles.post_link}>
                <strong className={styles.title}>{post.data.title}</strong>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
              </a>
            </Link>
            <div className={styles.info}>
              <time>
                <FiCalendar className={styles.icon_calendar} />
                {formatDate(post.first_publication_date)}
              </time>
              <span className={styles.author}>
                <BsPerson className={styles.icon_author} />
                {post.data.author}
              </span>
            </div>
          </div>
        ))}
        {nextPage && (
          <button
            type="button"
            className={styles.buttonPage}
            onClick={handleSeeMore}
          >
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

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
