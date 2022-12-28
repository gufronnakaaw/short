import supabase from '../helpers/supabase';
import Link from 'next/link';

export default function shortlink({ message }) {
  const { code, statusText, text } = message;

  return (
    <div className="shortlink-container">
      <p>Upsss something is wrong!</p>
      <p>Code: {code}</p>
      <p>StatusText: {statusText}</p>
      <p>message: {text}</p>
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '20px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-arrow-left"
          viewBox="0 0 16 16"
        >
          {' '}
          <path
            fill-rule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
          />{' '}
        </svg>
        <p style={{ margin: '0 2px' }}>Go Back</p>
      </Link>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { shortlink } = params;

  const { data, status, statusText, error } = await supabase
    .from('short')
    .select('originalurl, shorturl, expiredAt, click')
    .eq('shorturl', shortlink);

  // not error
  if (!error) {
    // data exists
    if (data.length > 0) {
      // check expired
      if (Date.now() > data[0].expiredAt) {
        return {
          redirect: {
            destination: '/',
          },
        };
      }

      setTimeout(async () => {
        await supabase
          .from('short')
          .update({ click: data[0].click + 1 })
          .eq('shorturl', shortlink);
      }, 0);

      return {
        redirect: {
          destination: data[0].originalurl,
        },
      };
    } else {
      // data not exists
      // redirect to homepage
      return {
        redirect: {
          destination: '/',
        },
      };
    }
  } else {
    // error
    return {
      props: {
        message: {
          code: status,
          statusText,
          text: error.message,
        },
      },
    };
  }
}
