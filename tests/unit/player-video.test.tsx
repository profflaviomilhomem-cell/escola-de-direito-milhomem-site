import { render, screen } from "@testing-library/react";

import { PlayerVideo } from "@/components/aluno/player-video";
import type { MockLesson } from "@/lib/course/types";

/**
 * Renderização do player da aula.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * Em 24/08/2026 o player foi corrigido para **dizer a verdade quando não há
 * vídeo**, em vez de exibir uma superfície com gradiente que parecia um player
 * carregando. Aquele commit fechou o defeito e deixou uma dívida declarada na
 * própria nota de sessão: "o player não tem teste de renderização — cobri as
 * regras de progresso, não a interface".
 *
 * É essa dívida que este arquivo paga. O ponto não é estilo: é que hoje as 10
 * aulas do curso estão com `videoId` vazio no banco de produção, então o ramo
 * "sem vídeo" é **o único que um aluno pagante veria**. Um player falso ali é a
 * diferença entre "ainda não subiu" e "paguei e não funciona".
 */

jest.mock("@/lib/lessons/cloudflare-stream", () => ({
  carregarStreamSdk: jest.fn(async () => null),
}));
jest.mock("@/lib/lessons/progress-client", () => ({
  patchLessonProgress: jest.fn(async () => undefined),
}));
jest.mock("@/lib/analytics/track", () => ({ track: jest.fn() }));

const aula: MockLesson = {
  id: "aula-01",
  slug: "aula-01",
  title: "Introdução à prova digital e cadeia de custódia",
  description: "Aula inaugural.",
  durationSec: 1075,
  position: 1,
  moduleSlug: "modulo-01",
  moduleTitle: "Cadeia de custódia",
  status: "nao-iniciada",
  watchedSec: 0,
  cover: { from: "#000", to: "#111" },
  summary: "",
  keyPoints: [],
  materials: [],
};

describe("PlayerVideo — sem vídeo", () => {
  it("diz que a aula não está disponível, em vez de fingir um player", () => {
    render(<PlayerVideo lesson={aula} />);

    expect(screen.getByText("Vídeo em preparação")).toBeInTheDocument();
    expect(
      screen.getByText(/ainda não está disponível para assistir/i),
    ).toBeInTheDocument();
  });

  it("não renderiza elemento de vídeo nem iframe quando não há vídeo", () => {
    // A regressão a evitar: alguém devolve a superfície decorativa e o aluno
    // volta a ver algo com cara de player que nunca vai tocar.
    const { container } = render(<PlayerVideo lesson={aula} />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("anuncia o estado para leitor de tela", () => {
    render(<PlayerVideo lesson={aula} />);
    // `role="status"` faz o leitor de tela anunciar a indisponibilidade; sem
    // ele, quem não enxerga o aviso simplesmente não encontra vídeo nenhum.
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("mostra o título da aula, para o aluno saber qual não subiu", () => {
    render(<PlayerVideo lesson={aula} />);
    expect(screen.getByText(aula.title)).toBeInTheDocument();
  });
});

describe("PlayerVideo — escolha do player", () => {
  it("usa o player nativo quando há arquivo local", () => {
    const { container } = render(
      <PlayerVideo
        lesson={{ ...aula, videoSrc: "/curso/aula-01/video.mp4" }}
      />,
    );
    expect(container.querySelector("video")).not.toBeNull();
    expect(screen.queryByText("Vídeo em preparação")).not.toBeInTheDocument();
  });

  it("Cloudflare Stream tem precedência sobre o arquivo local", () => {
    // Quando os vídeos subirem para o Stream, o `videoSrc` antigo pode
    // continuar preenchido no banco. O Stream precisa ganhar — senão o upload
    // acontece e o aluno continua recebendo o MP4 que não existe em produção.
    const { container } = render(
      <PlayerVideo
        lesson={{
          ...aula,
          videoId: "abc123streamuid",
          videoSrc: "/curso/aula-01/video.mp4",
        }}
      />,
    );
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByText("Vídeo em preparação")).not.toBeInTheDocument();
  });
});
