const express = require('express');
const router = express.Router();
const correiosService = require('../services/correiosService');
const { authUser } = require('../middleware/auth');

/**
 * @route POST /api/correios/calcular-frete
 * @desc Calcula o frete usando os Correios
 * @access Public
 */
router.post('/calcular-frete', async (req, res) => {
  try {
    const {
      cepOrigem,
      cepDestino,
      peso,
      comprimento,
      altura,
      largura,
      valorDeclarado,
      maoPropria,
      avisoRecebimento,
      servicos
    } = req.body;

    // Validações básicas
    if (!cepOrigem || !cepDestino || !peso) {
      return res.status(400).json({
        success: false,
        message: 'CEP de origem, destino e peso são obrigatórios'
      });
    }

    // Valida CEPs
    if (!correiosService.validarCEP(cepOrigem) || !correiosService.validarCEP(cepDestino)) {
      return res.status(400).json({
        success: false,
        message: 'CEPs inválidos. Devem conter 8 dígitos'
      });
    }

    // Valida peso
    if (peso <= 0 || peso > 30) {
      return res.status(400).json({
        success: false,
        message: 'Peso deve ser entre 0.1kg e 30kg'
      });
    }

    const resultados = await correiosService.calcularFrete({
      cepOrigem,
      cepDestino,
      peso,
      comprimento,
      altura,
      largura,
      valorDeclarado,
      maoPropria,
      avisoRecebimento,
      servicos
    });

    if (resultados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Não foi possível calcular o frete para os parâmetros informados'
      });
    }

    res.json({
      success: true,
      data: {
        cepOrigem: correiosService.formatarCEP(cepOrigem),
        cepDestino: correiosService.formatarCEP(cepDestino),
        peso,
        resultados
      }
    });
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao calcular frete',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/correios/rastrear/:codigo
 * @desc Rastreia uma encomenda pelos Correios
 * @access Public
 */
router.get('/rastrear/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código de rastreamento é obrigatório'
      });
    }

    // Valida formato básico do código de rastreamento
    const codigoLimpo = codigo.trim().toUpperCase();
    if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(codigoLimpo)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de código de rastreamento inválido. Use o formato: AA123456789BR'
      });
    }

    const resultado = await correiosService.rastrearEncomenda(codigoLimpo);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao rastrear encomenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao rastrear encomenda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/correios/rastrear-multiplos
 * @desc Rastreia múltiplas encomendas
 * @access Private
 */
router.post('/rastrear-multiplos', authUser, async (req, res) => {
  try {
    const { codigos } = req.body;

    if (!Array.isArray(codigos) || codigos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array de códigos de rastreamento é obrigatório'
      });
    }

    if (codigos.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 10 códigos por consulta'
      });
    }

    const resultados = [];
    
    for (const codigo of codigos) {
      try {
        const codigoLimpo = codigo.trim().toUpperCase();
        if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(codigoLimpo)) {
          resultados.push({
            codigo: codigo,
            erro: 'Formato inválido'
          });
          continue;
        }

        const resultado = await correiosService.rastrearEncomenda(codigoLimpo);
        resultados.push({
          codigo: codigoLimpo,
          dados: resultado
        });
      } catch (error) {
        resultados.push({
          codigo: codigo,
          erro: error.message
        });
      }
    }

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    console.error('Erro ao rastrear múltiplas encomendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/correios/servicos
 * @desc Lista os serviços disponíveis dos Correios
 * @access Public
 */
router.get('/servicos', (req, res) => {
  try {
    const servicos = [
      {
        codigo: '40010',
        nome: 'SEDEX',
        descricao: 'Serviço expresso com prazo de entrega de 1 a 2 dias úteis'
      },
      {
        codigo: '40215',
        nome: 'SEDEX 10',
        descricao: 'Entrega no próximo dia útil até às 10h'
      },
      {
        codigo: '40290',
        nome: 'SEDEX Hoje',
        descricao: 'Entrega no mesmo dia'
      },
      {
        codigo: '41106',
        nome: 'PAC',
        descricao: 'Encomenda econômica com prazo de 3 a 8 dias úteis'
      },
      {
        codigo: '40045',
        nome: 'SEDEX a Cobrar',
        descricao: 'SEDEX com cobrança na entrega'
      },
      {
        codigo: '41068',
        nome: 'PAC a Cobrar',
        descricao: 'PAC com cobrança na entrega'
      }
    ];

    res.json({
      success: true,
      data: servicos
    });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/correios/validar-cep
 * @desc Valida um CEP
 * @access Public
 */
router.post('/validar-cep', (req, res) => {
  try {
    const { cep } = req.body;

    if (!cep) {
      return res.status(400).json({
        success: false,
        message: 'CEP é obrigatório'
      });
    }

    const valido = correiosService.validarCEP(cep);
    const cepFormatado = valido ? correiosService.formatarCEP(cep) : null;

    res.json({
      success: true,
      data: {
        cep: cep,
        valido,
        cepFormatado
      }
    });
  } catch (error) {
    console.error('Erro ao validar CEP:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/correios/status
 * @desc Verifica o status da integração com os Correios
 * @access Private (Admin)
 */
router.get('/status', authUser, (req, res) => {
  try {
    const status = {
      servicoAtivo: true,
      credenciaisConfiguradas: {
        empresa: !!process.env.CORREIOS_EMPRESA,
        senha: !!process.env.CORREIOS_SENHA,
        token: !!process.env.CORREIOS_TOKEN
      },
      servicosDisponiveis: ['SEDEX', 'PAC', 'SEDEX 10', 'SEDEX Hoje'],
      limitePeso: '30kg',
      formatosSuportados: ['Caixa/Pacote']
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;