import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const dateFormatted = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce((total, contentItem) => {
    const headingTime = contentItem.heading.split(/\s+/).length;
    const wordsTime = RichText.asText(contentItem.body).split(/\s+/).length;

    return total + headingTime + wordsTime;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  return (
    <>
      <img
        className={styles.image}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <main className={commonStyles.container}>
        <section className={styles.post}>
          <h1>{post.data.title}</h1>
          <div>
            <time>
              <FiCalendar size={20} /> {dateFormatted}
            </time>
            <span>
              <FiUser size={20} /> {post.data.author}
            </span>
            <span>
              <FiClock /> {`${readTime} min`}
            </span>
          </div>
        </section>

        {post.data.content.map(content => {
          return (
            <article className={styles.contentBody} key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug));

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
