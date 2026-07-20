import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { realizarLogin } from '../../services/auth';
import styles from './Login.module.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const resultado = await realizarLogin(email, senha);
      login(resultado.token, resultado.usuario);
      navigate('/');
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao entrar.');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.cartao}>
        <h1 className={styles.titulo}>Bem-vindo</h1>
        <p className={styles.subtitulo}>Entre com suas credenciais para continuar</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className={styles.input}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.botao}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
