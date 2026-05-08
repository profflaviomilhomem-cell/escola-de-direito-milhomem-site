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

  // --- Crimes contra a pessoa (vida e integridade) ---
  {
    slug: "homicidio-culposo",
    artigo: "CP, art. 121, §3º",
    nome: "Homicídio culposo",
    minDias: 1 * ANO,
    maxDias: 3 * ANO,
  },
  {
    slug: "feminicidio",
    artigo: "CP, art. 121, §2º, VI",
    nome: "Feminicídio",
    minDias: 12 * ANO,
    maxDias: 30 * ANO,
  },
  {
    slug: "induzimento-suicidio",
    artigo: "CP, art. 122",
    nome: "Induzimento, instigação ou auxílio ao suicídio",
    minDias: 6 * MES,
    maxDias: 2 * ANO,
  },
  {
    slug: "infanticidio",
    artigo: "CP, art. 123",
    nome: "Infanticídio",
    minDias: 2 * ANO,
    maxDias: 6 * ANO,
  },
  {
    slug: "aborto-gestante",
    artigo: "CP, art. 124",
    nome: "Aborto provocado pela gestante",
    minDias: 1 * ANO,
    maxDias: 3 * ANO,
  },
  {
    slug: "lesao-corporal-grave",
    artigo: "CP, art. 129, §1º",
    nome: "Lesão corporal grave",
    minDias: 1 * ANO,
    maxDias: 5 * ANO,
  },
  {
    slug: "lesao-corporal-gravissima",
    artigo: "CP, art. 129, §2º",
    nome: "Lesão corporal gravíssima",
    minDias: 2 * ANO,
    maxDias: 8 * ANO,
  },
  {
    slug: "lesao-seguida-de-morte",
    artigo: "CP, art. 129, §3º",
    nome: "Lesão corporal seguida de morte",
    minDias: 4 * ANO,
    maxDias: 12 * ANO,
  },
  {
    slug: "lesao-violencia-domestica",
    artigo: "CP, art. 129, §9º",
    nome: "Lesão corporal — violência doméstica",
    minDias: 3 * MES,
    maxDias: 3 * ANO,
  },

  // --- Crimes contra a honra ---
  {
    slug: "calunia",
    artigo: "CP, art. 138",
    nome: "Calúnia",
    minDias: 6 * MES,
    maxDias: 2 * ANO,
  },
  {
    slug: "difamacao",
    artigo: "CP, art. 139",
    nome: "Difamação",
    minDias: 3 * MES,
    maxDias: 1 * ANO,
  },
  {
    slug: "injuria",
    artigo: "CP, art. 140, caput",
    nome: "Injúria",
    minDias: 1 * MES,
    maxDias: 6 * MES,
  },
  {
    slug: "injuria-racial",
    artigo: "Lei 7.716/89, art. 2º-A",
    nome: "Injúria racial (racismo)",
    minDias: 2 * ANO,
    maxDias: 5 * ANO,
  },

  // --- Crimes contra a liberdade individual ---
  {
    slug: "ameaca",
    artigo: "CP, art. 147",
    nome: "Ameaça",
    minDias: 1 * MES,
    maxDias: 6 * MES,
  },
  {
    slug: "perseguicao-stalking",
    artigo: "CP, art. 147-A",
    nome: "Perseguição (stalking)",
    minDias: 6 * MES,
    maxDias: 2 * ANO,
  },
  {
    slug: "sequestro-carcere-privado",
    artigo: "CP, art. 148, caput",
    nome: "Sequestro e cárcere privado",
    minDias: 1 * ANO,
    maxDias: 3 * ANO,
  },

  // --- Crimes contra o patrimônio (complementares) ---
  {
    slug: "extorsao",
    artigo: "CP, art. 158, caput",
    nome: "Extorsão",
    minDias: 4 * ANO,
    maxDias: 10 * ANO,
  },
  {
    slug: "extorsao-mediante-sequestro",
    artigo: "CP, art. 159, caput",
    nome: "Extorsão mediante sequestro",
    minDias: 8 * ANO,
    maxDias: 15 * ANO,
  },
  {
    slug: "apropriacao-indebita",
    artigo: "CP, art. 168, caput",
    nome: "Apropriação indébita",
    minDias: 1 * ANO,
    maxDias: 4 * ANO,
  },
  {
    slug: "apropriacao-indebita-previdenciaria",
    artigo: "CP, art. 168-A",
    nome: "Apropriação indébita previdenciária",
    minDias: 2 * ANO,
    maxDias: 5 * ANO,
  },
  {
    slug: "dano",
    artigo: "CP, art. 163, caput",
    nome: "Dano",
    minDias: 1 * MES,
    maxDias: 6 * MES,
  },

  // --- Crimes contra a dignidade sexual (complementares) ---
  {
    slug: "importunacao-sexual",
    artigo: "CP, art. 215-A",
    nome: "Importunação sexual",
    minDias: 1 * ANO,
    maxDias: 5 * ANO,
  },
  {
    slug: "assedio-sexual",
    artigo: "CP, art. 216-A",
    nome: "Assédio sexual",
    minDias: 1 * ANO,
    maxDias: 2 * ANO,
  },
  {
    slug: "divulgacao-cena-estupro",
    artigo: "CP, art. 218-C",
    nome: "Divulgação de cena de estupro ou pornografia de vingança",
    minDias: 1 * ANO,
    maxDias: 5 * ANO,
  },

  // --- Crimes contra a fé pública ---
  {
    slug: "falsificacao-documento-publico",
    artigo: "CP, art. 297",
    nome: "Falsificação de documento público",
    minDias: 2 * ANO,
    maxDias: 6 * ANO,
  },
  {
    slug: "falsificacao-documento-particular",
    artigo: "CP, art. 298",
    nome: "Falsificação de documento particular",
    minDias: 1 * ANO,
    maxDias: 5 * ANO,
  },
  {
    slug: "falsidade-ideologica",
    artigo: "CP, art. 299 (documento público)",
    nome: "Falsidade ideológica (documento público)",
    minDias: 1 * ANO,
    maxDias: 5 * ANO,
  },
  {
    slug: "falsa-identidade",
    artigo: "CP, art. 307",
    nome: "Falsa identidade",
    minDias: 3 * MES,
    maxDias: 1 * ANO,
  },

  // --- Crimes contra a administração pública ---
  {
    slug: "peculato",
    artigo: "CP, art. 312, caput",
    nome: "Peculato",
    minDias: 2 * ANO,
    maxDias: 12 * ANO,
  },
  {
    slug: "concussao",
    artigo: "CP, art. 316, caput",
    nome: "Concussão",
    minDias: 2 * ANO,
    maxDias: 12 * ANO,
  },
  {
    slug: "corrupcao-passiva",
    artigo: "CP, art. 317",
    nome: "Corrupção passiva",
    minDias: 2 * ANO,
    maxDias: 12 * ANO,
  },
  {
    slug: "corrupcao-ativa",
    artigo: "CP, art. 333",
    nome: "Corrupção ativa",
    minDias: 2 * ANO,
    maxDias: 12 * ANO,
  },
  {
    slug: "prevaricacao",
    artigo: "CP, art. 319",
    nome: "Prevaricação",
    minDias: 3 * MES,
    maxDias: 1 * ANO,
  },
  {
    slug: "resistencia",
    artigo: "CP, art. 329",
    nome: "Resistência",
    minDias: 2 * MES,
    maxDias: 2 * ANO,
  },
  {
    slug: "desacato",
    artigo: "CP, art. 331",
    nome: "Desacato",
    minDias: 6 * MES,
    maxDias: 2 * ANO,
  },

  // --- Legislação penal especial ---
  {
    slug: "associacao-para-o-trafico",
    artigo: "Lei 11.343/06, art. 35",
    nome: "Associação para o tráfico",
    minDias: 3 * ANO,
    maxDias: 10 * ANO,
  },
  {
    slug: "porte-ilegal-arma-uso-permitido",
    artigo: "Lei 10.826/03, art. 14",
    nome: "Porte ilegal de arma de fogo de uso permitido",
    minDias: 2 * ANO,
    maxDias: 4 * ANO,
  },
  {
    slug: "lavagem-de-dinheiro",
    artigo: "Lei 9.613/98, art. 1º",
    nome: "Lavagem de dinheiro",
    minDias: 3 * ANO,
    maxDias: 10 * ANO,
  },
];

export function findCrime(slug: string): CrimePreset | undefined {
  return crimes.find((c) => c.slug === slug);
}
