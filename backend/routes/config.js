const express = require('express');
const config = require('../config');

const router = express.Router();

// Rota para obter configurações públicas (como chave pública do Mercado Pago)
router.get('/public', (req, res) => {
  try {
    res.json({
      mercadoPago: {
        publicKey: config.development.mercadoPago.publicKey
      },
      frontend: {
        url: config.development.frontend.url
      }
    });
  } catch (error) {
    console.error('Erro ao obter configurações públicas:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;