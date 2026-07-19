import rateLimit from 'express-rate-limit'

export const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  statusCode: 429,
  message: {
    sucesso: false,
    mensagem: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
  },
})
