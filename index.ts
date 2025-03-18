/* eslint-disable no-console */
import fs from 'fs';
import dotenv from 'dotenv';
import Instagram from 'instagram-web-api';
dotenv.config();
import axios from 'axios';

const TITLES_PATH = './instagram/titles_post.txt';

// Conection to the account
const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = process.env;
const client = new Instagram({
  username: INSTAGRAM_USERNAME,
  password: INSTAGRAM_PASSWORD
});
let isLogged = false;

export function startRandomTimeInstagram() {

  try {

    const minute = 60 * 1000;
    const max_minutes = 5;
    const tiempo = Math.round(
      Math.random() * (minute * max_minutes)
    );

    setTimeout(async () => {
      const titles = defineTitles();
      const images = await getImage();
      if (titles && images) {
        await postInInstragram(titles, images);
      }
      startRandomTimeInstagram();
    }, tiempo);

  } catch (error) {

    console.error('Error on instapost worker => ', error);

  }

}

// Taking the image from somewhere
async function getImage() {

  try {

    const response = await axios.get('');
    return response.data.message;

  } catch (error) {

    console.error('error on getting images => ', error);

  }

}

async function postInInstragram(titles: string[], images: string[]) {

  try {

    if (notHaveContent(titles)) return;
    const resultRandomImage = images[
      Math.round(Math.random() * (images.length))
    ];
    if (!resultRandomImage) return;

    const image = resultRandomImage;
    const title = titles[0];

    if (!isLogged) {

      await client.login({
        username: INSTAGRAM_USERNAME,
        password: INSTAGRAM_PASSWORD
      }, { _sharedData: false });
      isLogged = true;
      console.log('Login success!');

    }

    const { media } = await client.uploadPhoto({
      photo: image,
      caption: title,
      post: 'feed',
    });

    console.log(`[ Result ] uploaded => https://www.instagram.com/p/${media.code}/`)
    titles.shift()
    fs.writeFileSync(TITLES_PATH, titles.join('-'));

  } catch (error) {

    isLogged = false;
    titles.shift();
    fs.writeFileSync(TITLES_PATH, titles.join('-'));
    console.error(error);

  }

}

function defineTitles() {

  try {

    const contenidoTiutlos = fs.readFileSync(TITLES_PATH);
    const titulos = contenidoTiutlos.toString().split('-');
    return titulos;

  } catch (error) {

    console.error('error defining titles => ', error);

  }

}

function notHaveContent(titles: string[]) {

  if (titles[0] == '' || titles.length == 0) return true;

}

