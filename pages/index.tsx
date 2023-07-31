import Head from 'next/head';
import { NextPageContext } from 'next';
import Image, { ImageLoaderProps } from 'next/image';
import { ImageLoader } from 'next/dist/client/image';

const contentfulImageLoader: ImageLoader = ({
  src,
  width,
}: ImageLoaderProps) => {
  return `${src}?w=${width}`;
};

export async function getServerSideProps(ctx: NextPageContext) {
  return {
    props: {},
  };
}

export default function Home() {
  return (
    <>
      <Head>
        <title>PRODUCT AND ORDER MANAGEMEMNT SYSTEM</title>
        <meta name="description" content="OMS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="header-home">
        <div className="dashboard-text dashboard">
          Welcome, Admin! Home Dashboard coming soon.
        </div>
      </div>
      <main>
        <Image
          className="logo"
          alt="logo"
          src={'https://testanush.s3.us-west-1.amazonaws.com/order-image.jpeg'}
          width={1450}
          height={800}
          loader={contentfulImageLoader}
        />
      </main>
    </>
  );
}
