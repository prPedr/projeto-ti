import React, { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { criarUsuario, editarUsuario, listarUsuarios, redefinirSenha } from '../../../services/usuarios';
import type { Usuario } from '../../../services/usuarios';
import styles from './Usuarios.module.css';

const PERFIS = ['ADMIN', 'TECNICO', 'LEITURA'] as const;

export default function Usuarios() {
  const { usuario: usuarioLogado } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<string>('TECNICO');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(false);

  function carregarUsuarios() {
    setCarregando(true);
    listarUsuarios()
      .then(setUsuarios)
      .catch((erro) => console.error('Erro ao carregar usuários:', erro))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      return;
    }

    try {
      await criarUsuario({ nome: nome.trim(), email: email.trim(), senha, perfil });

      setNome('');
      setEmail('');
      setSenha('');
      setPerfil('TECNICO');
      carregarUsuarios();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao criar usuário.');
    }
  }

  async function handleToggleAtivo(linha: Usuario) {
    try {
      await editarUsuario(linha.id, { ativo: !linha.ativo });
      carregarUsuarios();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao atualizar status do usuário.');
    }
  }

  async function handleTrocarPerfil(linha: Usuario, novoPerfil: string) {
    if (novoPerfil === linha.perfil) {
      return;
    }

    try {
      await editarUsuario(linha.id, { perfil: novoPerfil });
      carregarUsuarios();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao trocar perfil do usuário.');
    }
  }

  async function handleRedefinirSenha(linha: Usuario) {
    const novaSenha = prompt(`Nova senha para "${linha.nome}" (mínimo 8 caracteres):`);
    if (!novaSenha) {
      return;
    }

    if (novaSenha.trim().length < 8) {
      alert('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    try {
      await redefinirSenha(linha.id, novaSenha.trim());
      alert('Senha redefinida com sucesso.');
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao redefinir senha.');
    }
  }

  function corDoStatus(ativo: number): React.CSSProperties {
    return ativo
      ? { backgroundColor: 'var(--status-ativo-fundo)', color: 'var(--status-ativo-texto)' }
      : { backgroundColor: 'var(--status-descartado-fundo)', color: 'var(--status-descartado-texto)' };
  }

  return (
    <>
      <div className={styles.cabecalhoAcoes}>
        <h2>Usuários</h2>
      </div>

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.campo}>
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            className={styles.input}
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Ex: Maria Silva"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ex: maria@empresa.com"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            className={styles.input}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="perfil">Perfil</label>
          <select
            id="perfil"
            className={styles.select}
            value={perfil}
            onChange={(event) => setPerfil(event.target.value)}
          >
            {PERFIS.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.botaoAdicionar}>
          Adicionar
        </button>
      </form>

      <div className={styles.tabelaWrapper}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((linha) => {
              const ehOProprioUsuario = usuarioLogado?.id === linha.id;
              const titleProprioUsuario = ehOProprioUsuario
                ? 'Você não pode alterar sua própria conta'
                : undefined;

              return (
                <tr key={linha.id}>
                  <td>{linha.nome}</td>
                  <td>{linha.email}</td>
                  <td>
                    <select
                      className={styles.selectInline}
                      value={linha.perfil}
                      disabled={ehOProprioUsuario}
                      title={titleProprioUsuario}
                      onChange={(event) => handleTrocarPerfil(linha, event.target.value)}
                    >
                      {PERFIS.map((valor) => (
                        <option key={valor} value={valor}>
                          {valor}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={styles.statusBadge} style={corDoStatus(linha.ativo)}>
                      {linha.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.grupoAcoes}>
                      <button
                        type="button"
                        className={styles.botaoAcaoTabela}
                        disabled={ehOProprioUsuario}
                        title={titleProprioUsuario}
                        onClick={() => handleToggleAtivo(linha)}
                      >
                        {linha.ativo ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        className={styles.botaoAcaoTabela}
                        onClick={() => handleRedefinirSenha(linha)}
                      >
                        Redefinir senha
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!carregando && usuarios.length === 0 && (
          <p className={styles.listaVazia}>Nenhum usuário cadastrado.</p>
        )}
      </div>
    </>
  );
}
