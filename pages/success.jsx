import { useRef } from 'react';
import supabase from '../helpers/supabase';
import Swal from 'sweetalert2';

export default function success({ success }) {
  const { host, shortlink } = success;
  const inputRef = useRef();

  function handleCopy() {
    // check window is secure
    if (window.isSecureContext) {
      inputRef.current.select();
      inputRef.current.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(inputRef.current.value);

      return Swal.fire({
        icon: 'success',
        toast: true,
        position: 'top-right',
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
        title: `URL Copied`,
        width: 'auto',
      });
    }

    // window not secure
    return Swal.fire({
      title: 'Error',
      text: 'Cannot copy. Window is not secure',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#e84393',
    });
  }

  return (
    <div className="success-container">
      <h1>
        <span>YOUR</span>
        <span>LINK</span>
      </h1>
      <div className="input-container">
        <input
          type="text"
          readOnly
          defaultValue={`${host}/${shortlink}`}
          ref={inputRef}
        />
        <button onClick={handleCopy}>Copy</button>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, query }) {
  const { shortlink } = query;
  if (!shortlink) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const { data } = await supabase
    .from('short')
    .select('shorturl')
    .eq('shorturl', shortlink);

  if (data.length < 1) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const { headers } = req;

  return {
    props: {
      success: {
        host: headers.host,
        shortlink,
      },
    },
  };
}
