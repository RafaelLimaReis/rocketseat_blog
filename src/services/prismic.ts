import * as Prismic from '@prismicio/client';

export function getPrismicClient(): Prismic.Client {
  const prismic = Prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {});

  return prismic;
}
