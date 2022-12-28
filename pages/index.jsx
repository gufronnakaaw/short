import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import supabase from '../helpers/supabase';
import Swal from 'sweetalert2';

export default function Home() {
  const router = useRouter();

  function generate(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  // state
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  function handleKeyUp(e) {
    setLink(e.target.value.trim());
    if (e.key == 'Enter') {
      insert();
    }
  }

  function handleClick() {
    insert();
  }

  async function insert() {
    // check link
    if (!link) {
      return Swal.fire({
        title: 'Error',
        text: 'Cannot be empty',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e84393',
      });
    }

    // split original link
    let original = link.split(':');
    const http = original.includes('http');
    const https = original.includes('https');

    // check is http or https
    if (http || https) {
      original = original.join(':');
    }

    // http and https doesn't exist
    if (!http && !https) {
      original = `https://${original.join(' ')}`;
    }

    // generate random string
    const random = generate(5);
    const date = new Date();

    // insert object
    const insert = {
      originalurl: original,
      shorturl: random,
      createdAt: date.getTime(),
      expiredAt: date.setDate(date.getDate() + 30),
    };

    // setloading
    setLoading(true);

    // response from insert data
    const response = await supabase.from('short').insert(insert);

    // check error
    if (!response.error) {
      // redirect to success route with query string
      router.push({
        pathname: '/success',
        query: {
          shortlink: random,
        },
      });

      // open swal
      return Swal.fire({
        icon: 'success',
        toast: true,
        position: 'top-right',
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true,
        title: 'Success Generate URL',
        width: 'auto',
      });
    }

    // open swal
    return Swal.fire({
      title: 'Error',
      text: response.error.message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#e84393',
    });
  }

  return (
    <>
      <Head>
        <title>SHORT!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
      </Head>

      <div className="container">
        <div className="card">
          <h1>
            <span>SHO</span>
            <span>RT!</span>
          </h1>
          <div className="input-container">
            <input
              type="text"
              id="link-input"
              onKeyUp={handleKeyUp}
              placeholder="Enter your link here.."
              autoComplete="off"
            />
            <button
              id="link-button"
              onClick={handleClick}
              disabled={loading ? true : false}
            >
              {loading ? (
                <i className="fa fa-circle-o-notch fa-spin"></i>
              ) : (
                'short!'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
