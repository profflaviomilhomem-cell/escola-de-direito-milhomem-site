import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IniciarLancamentoPanel } from "@/components/admin/iniciar-lancamento-panel";

/**
 * O que estes testes protegem é o passo de confirmação, não o visual.
 *
 * Disparar o lançamento inscreve a lista inteira numa sequência de 7 e-mails,
 * em nome de um Promotor de Justiça em atividade, e não há desfazer em massa.
 * Um clique acidental num painel que também mostra receita e pedidos seria
 * caro. Por isso o caso mais importante aqui é o negativo: **clicar em
 * "Iniciar lançamento" não pode chamar a API**.
 */

const fetchMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchMock as unknown as typeof fetch;
});

function respostaOk(body: {
  total: number;
  enrolled: number;
  skipped: number;
}) {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true, ...body }),
  });
}

describe("IniciarLancamentoPanel", () => {
  it("sem ninguém na lista, o botão fica desabilitado", () => {
    render(<IniciarLancamentoPanel elegiveis={0} />);

    expect(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    ).toBeDisabled();
    expect(screen.getByText(/ninguém na lista/i)).toBeInTheDocument();
  });

  it("mostra quantas pessoas receberiam hoje", () => {
    render(<IniciarLancamentoPanel elegiveis={1240} />);

    expect(screen.getByText("1240")).toBeInTheDocument();
    expect(screen.getByText(/pessoas receberiam, hoje/i)).toBeInTheDocument();
  });

  it("o primeiro clique NÃO dispara nada — só pede confirmação", async () => {
    const user = userEvent.setup();
    render(<IniciarLancamentoPanel elegiveis={42} />);

    await user.click(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Confirmar o disparo para 42/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/não existe desfazer em massa/i),
    ).toBeInTheDocument();
  });

  it("cancelar volta ao início sem chamar a API", async () => {
    const user = userEvent.setup();
    render(<IniciarLancamentoPanel elegiveis={42} />);

    await user.click(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    );
    await user.click(screen.getByRole("button", { name: /^Cancelar$/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    ).toBeInTheDocument();
  });

  it("confirmar chama a rota e mostra o resultado", async () => {
    const user = userEvent.setup();
    respostaOk({ total: 10, enrolled: 7, skipped: 3 });
    render(<IniciarLancamentoPanel elegiveis={10} />);

    await user.click(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /Confirmar disparo/i }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/email/launch/start", {
      method: "POST",
    });
    expect(await screen.findByText(/Lançamento iniciado/i)).toBeInTheDocument();
    expect(screen.getByText(/7 inscrito\(s\) agora/i)).toBeInTheDocument();
    expect(screen.getByText(/3 pulado\(s\)/i)).toBeInTheDocument();
  });

  it("deixa claro que o e-mail não sai neste instante, e sim quando o agendador rodar", async () => {
    const user = userEvent.setup();
    respostaOk({ total: 1, enrolled: 1, skipped: 0 });
    render(<IniciarLancamentoPanel elegiveis={1} />);

    await user.click(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /Confirmar disparo/i }),
    );

    expect(
      await screen.findByText(/Nada é enviado neste instante/i),
    ).toBeInTheDocument();
  });

  it("erro da API aparece para o operador, com a mensagem do servidor", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Apenas administradores podem iniciar o lançamento.",
      }),
    });
    render(<IniciarLancamentoPanel elegiveis={5} />);

    await user.click(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /Confirmar disparo/i }),
    );

    expect(
      await screen.findByText(/Apenas administradores podem iniciar/i),
    ).toBeInTheDocument();
  });

  it("queda de rede não deixa dúvida sobre ter disparado ou não", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<IniciarLancamentoPanel elegiveis={5} />);

    await user.click(
      screen.getByRole("button", { name: /Iniciar lançamento/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /Confirmar disparo/i }),
    );

    expect(await screen.findByText(/Nada foi disparado/i)).toBeInTheDocument();
  });
});
