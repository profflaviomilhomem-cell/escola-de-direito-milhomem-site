/**
 * Presets de crimes para a calculadora didática.
 *
 * Mín/máx em DIAS (1 ano = 365 dias, 1 mês = 30 dias — art. 11 CP).
 * Lista intencionalmente curta e tipificada nos crimes mais ensinados
 * em concursos. Não substitui consulta legal.
 */

export type CrimePreset = {
  slug: string;
  artigo: string;
  nome: string;
  minDias: number;
  maxDias: number;
};

const ANO = 365;
const MES = 30;

export const crimes: CrimePreset[] = [
  {
    slug: "furto-simples",
    artigo: "CP, art. 155",
    nome: "Furto simples",
    minDias: 1 * ANO,
    maxDias: 4 * ANO,
  },
  {
    slug: "furto-qualificado",
    artigo: "CP, art. 155, §4º",
    nome: "Furto qualificado",
    minDias: 2 * ANO,
    maxDias: 8 * ANO,
  },
  {
    slug: "roubo-simples",
    artigo: "CP, art. 157, caput",
    nome: "Roubo simples",
    minDias: 4 * ANO,
    maxDias: 10 * ANO,
  },
  {
    slug: "latrocinio",
    artigo: "CP, art. 157, §3º, II",
    nome: "Latrocínio",
    minDias: 20 * ANO,
    maxDias: 30 * ANO,
  },
  {
    slug: "estelionato",
    artigo: "CP, art. 171",
    nome: "Estelionato",
    minDias: 1 * ANO,
    maxDias: 5 * ANO,
  },
  {
    slug: "receptacao",
    artigo: "CP, art. 180",
    nome: "Receptação",
    minDias: 1 * ANO,
    maxDias: 4 * ANO,
  },
  {
    slug: "homicidio-simples",
    artigo: "CP, art. 121, caput",
    nome: "Homicídio simples",
    minDias: 6 * ANO,
    maxDias: 20 * ANO,
  },
  {
    slug: "homicidio-qualificado",
    artigo: "CP, art. 121, §2º",
    nome: "Homicídio qualificado",
    minDias: 12 * ANO,
    maxDias: 30 * ANO,
  },
  {
    slug: "lesao-corporal",
    artigo: "CP, art. 129, caput",
    nome: "Lesão corporal leve",
    minDias: 3 * MES,
    maxDias: 1 * ANO,
  },
  {
    slug: "trafico-drogas",
    artigo: "Lei 11.343/06, art. 33",
    nome: "Tráfico de drogas",
    minDias: 5 * ANO,
    maxDias: 15 * ANO,
  },
  {
    slug: "estupro",
    artigo: "CP, art. 213",
    nome: "Estupro",
    minDias: 6 * ANO,
    maxDias: 10 * ANO,
  },
  {
    slug: "estupro-vulneravel",
    artigo: "CP, art. 217-A",
    nome: "Estupro de vulnerável",
    minDias: 8 * ANO,
    maxDias: 15 * ANO,
  },
];

export function findCrime(slug: string): CrimePreset | undefined {
  return crimes.find((c) => c.slug === slug);
}
