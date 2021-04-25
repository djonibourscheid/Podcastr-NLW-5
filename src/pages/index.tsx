import { GetStaticProps } from 'next';
import { api } from '../services/api';

// type ou interface, tanto faz
type Episode = {
  id: string;
  title: string;
  members: string;
  // ...
}

type HomeProps = {
  // Array precisa receber um tipo. Array<string> ['1', 'a', 'b']
  // Ou podemos usar Episode[]
  episodes: Episode[];
}


export default function Home(props: HomeProps) {
  return (
    <h1>index</h1>
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

  return {
    props: {
      episodes: data,
    },
    revalidate: 60 * 60 * 8,
  }
}