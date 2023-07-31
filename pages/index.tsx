import Head from 'next/head';
import { NextPageContext } from 'next';
import Image from 'next/image';

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
          src={'/images/order-image.png'}
          width={1450}
          height={800}
        />
      </main>
    </>
  );
}
