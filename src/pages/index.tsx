import { GetStaticProps } from 'next';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';

// type ou interface, tanto faz
type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  // Array precisa receber um tipo. Array<string> ['1', 'a', 'b']
  // Ou podemos usar Episode[]
  lastestEpisodes: Episode[];
  allEpisodes: Episode[];
}


export default function Home({ lastestEpisodes, allEpisodes }: HomeProps) {
  return (
    <div className={styles.homepage}>
      <section className={styles.lastestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {lastestEpisodes.map(episode => {
            return (
              // passamos a prop KEY, com valor unico de cada elemento,
              // quando temos um .map para o react saber qual item precisa atualizar, por exemplo

              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <a href="#">{episode.title}</a>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  // _limit = vai buscar só x registros
  // _sort = ordenados por..;
  // _order = crescente ou decrescente
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  // formatação dos dados
  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    };
  })

  const lastestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      lastestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }
}