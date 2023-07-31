import Layout from '../components/layout';

import '@/styles/style.scss';

export default function App({ Component, pageProps: { ...pageProps } }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
