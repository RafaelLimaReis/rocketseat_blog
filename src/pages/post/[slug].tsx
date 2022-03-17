/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';

import * as Prismic from '@prismicio/client';
import { format } from 'date-fns';
import PtBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar } from 'react-icons/fi';
import { BiTimeFive } from 'react-icons/bi';
import { BsPerson } from 'react-icons/bs';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formatDate = (date: string): string => {
    return format(new Date(date), 'dd MMM yyyy', { locale: PtBR });
  };

  return (
    <>
      <div className={styles.contentImage}>
        <img
          src={post.data.banner.url}
          alt={post.data.title}
          className={styles.image}
        />
      </div>
      <main className={styles.container}>
        <h1>{post.data.title}</h1>
        <span className={styles.container_info}>
          <time>
            <FiCalendar className={styles.icon_calendar} />
            {formatDate(post.first_publication_date)}
          </time>
          <span>
            <BsPerson className={styles.icon_author} />
            {post.data.author}
          </span>
          <span>
            <BiTimeFive className={styles.icon_time} />4 min
          </span>
        </span>
        <section>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h1>{content.heading}</h1>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slug'],
    }
  );

  const params = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug));
  const post: Post = {
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url ?? '',
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
    uid: response.uid,
    first_publication_date: response.first_publication_date,
  };

  return {
    props: { post },
  };
};
