import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'CrusherBook';
const SITE_URL = 'https://crusherbook.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/cruhserbook.webp`;

const buildCanonicalUrl = (path = '/') => {
  const normalizedPath = path === '/' ? '' : String(path || '').replace(/\/$/, '');
  return `${SITE_URL}${normalizedPath || ''}` || SITE_URL;
};

export default function Seo({
  title,
  description,
  path = '/',
  keywords,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  schema = null,
}) {
  const canonicalUrl = buildCanonicalUrl(path);
  const normalizedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const keywordContent = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet prioritizeSeoTags>
      <title>{normalizedTitle}</title>
      <meta name="description" content={description} />
      {keywordContent ? <meta name="keywords" content={keywordContent} /> : null}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={normalizedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={normalizedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schema ? (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ) : null}
    </Helmet>
  );
}
