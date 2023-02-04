import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const formattedPosts = postsPagination.results.map(post => ({
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
  }));

  const [posts, setPosts] = useState<Post[]>(formattedPosts);

  async function handleNextPage(): Promise<void> {
    if (nextPage === null) {
      return;
    }

    const postsResults = await fetch(nextPage).then(response =>
      response.json()
    );
    setNextPage(postsResults.next_page);

    const newPosts = postsResults.results.map((post: Post) => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          { locale: ptBR }
        ),
      };
    });

    setPosts(prevState => [...prevState, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Posts | Challenge</title>
      </Head>

      <main className={commonStyles.container}>
        {posts.map(post => {
          return (
            <article className={styles.post} key={post.uid}>
              <div>
                <Link href={`/post/${post.uid}`}>
                  <a>{post.data.title}</a>
                </Link>
                <p>{post.data.subtitle}</p>
              </div>
              <footer>
                <time>
                  <FiCalendar size={20} /> {post.first_publication_date}
                </time>
                <span>
                  <FiUser size={20} /> {post.data.author}
                </span>
              </footer>
            </article>
          );
        })}
        <article>
          <div>
            <header />
            <p />
          </div>
          <footer />
        </article>

        {nextPage && (
          <button
            type="button"
            className={styles.nextPage}
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('post', {
    pageSize: 1,
    orderings: {
      field: 'last_publication_date',
      direction: 'desc',
    },
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
