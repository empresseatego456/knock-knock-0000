/* eslint-disable no-console */
import fs from 'fs';
import dotenv from 'dotenv';
import Instagram from 'instagram-web-api';
dotenv.config();
import logger from './winston/configWinston';
import axios from 'axios';
import { current_search_image } from '.';

const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = process.env;
const client = new Instagram({
  username: INSTAGRAM_USERNAME,
  password: INSTAGRAM_PASSWORD
})

let isLogged = false;
let imagesProcessed: object;

interface IStartInstaPost {
  search_name: string;
}

interface IGetImages {
  search_name: string;
}

export function startRandomTimeInstagram() {

  try {

    const minute = 60 * 1000;
    const max_minutes = 5;
    const tiempo = Math.round(Math.random() * (minute * max_minutes));

    setTimeout(async () => {
      const titulos = definirTitulos();
      const images = await getImages({ search_name: current_search_image });
      if (titulos && images) {
        await postInInstragram(titulos, images);
      }
      startRandomTimeInstagram();
    }, tiempo);

  } catch (error) {
    console.error('Error on instapost worker');
    logger.error(error);
    logger.error(imagesProcessed);
  }


}

async function getImages({ search_name }: IGetImages) {
  try {
    const response = await axios.get('' + search_name);
    return response.data.message;
  } catch (error) {
    console.error('error on getting images');
    console.error(error);
    logger.error(error);
  }
}

async function postInInstragram(titulos: string[], images: string[]) {

  try {

    if (notHaveContent(titulos)) return;
    const resultRandomImage = images[
      Math.round(Math.random() * (images.length))
    ];
    if (!resultRandomImage) return;
    const image = resultRandomImage;
    const titulo = titulos[0];

    if (!isLogged) {
      const response = await client.login({
        username: INSTAGRAM_USERNAME,
        password: INSTAGRAM_PASSWORD
      }, { _sharedData: false });
      isLogged = true;
      console.log('Login success!');
    }
    console.log('uploading image => ', image);
    const { media } = await client.uploadPhoto({
      photo: image,
      caption: titulo,
      post: 'feed',
    });
    console.log(`upload result => https://www.instagram.com/p/${media.code}/`)
    logger.log('image', 'https://www.instagram.com/p/${media.code}/');
    titulos.shift()
    fs.writeFileSync('./instagram/titulos_posteos.txt', titulos.join('-'));

  } catch (error) {
    isLogged = false;
    titulos.shift();
    fs.writeFileSync('./instagram/titulos_posteos.txt', titulos.join('-'));
    logger.error(error);
    console.error(error);
  }

}

function definirTitulos() {
  try {
    const contenidoTiutlos = fs.readFileSync('./instagram/titulos_posteos.txt');
    const titulos = contenidoTiutlos.toString().split('-');
    return titulos;
  } catch (error) {
    console.error('error defining titles');
    logger.error(error);
  }
}

function notHaveContent(titles: string[]) {
  if (titles[0] == '' || titles.length == 0) return true;
}
