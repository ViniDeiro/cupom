const express = require('express');
const { body, validationResult } = require('express-validator');
const { Product, SpecialDay } = require('../models');
const { authAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Listar produtos (público)
router.get('/', async (req, res) => {
  try {
    const { categoria, busca, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    // Verificar se é dia especial
    const diaEspecial = await SpecialDay.isHojeDiaEspecial();
    
    const whereClause = {
      ativo: true
    };

    // Se não é dia especial, mostrar apenas produtos normais
    if (!diaEspecial) {
      whereClause.disponivel_dias_especiais = false;
    }

    // Filtro por categoria
    if (categoria) {
      whereClause.categoria = categoria;
    }

    // Filtro por busca
    if (busca) {
      whereClause[Op.or] = [
        { nome: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    const { count, rows: produtos } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Formatar produtos com preço atual
    const produtosFormatados = produtos.map(produto => {
      let precoAtual = produto.preco;
      
      // Se é dia especial e produto tem preço especial
      if (diaEspecial && produto.preco_desconto) {
        precoAtual = produto.preco_desconto;
      }

      return {
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        preco_atual: precoAtual,
        categoria: produto.categoria,
        estoque: produto.estoque,
        imagem: produto.imagem,
        disponivel_dias_especiais: produto.disponivel_dias_especiais,
        em_promocao: diaEspecial && produto.preco_desconto && produto.preco_desconto < produto.preco
      };
    });

    res.json({
      produtos: produtosFormatados,
      paginacao: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      dia_especial: diaEspecial ? {
        nome: diaEspecial.nome,
        desconto_geral: diaEspecial.desconto_geral
      } : null
    });

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Obter produto por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const produto = await Product.findByPk(req.params.id);
    
    if (!produto || !produto.ativo) {
      return res.status(404).json({
        erro: 'Produto não encontrado'
      });
    }

    // Verificar se é dia especial
    const diaEspecial = await SpecialDay.isHojeDiaEspecial();
    
    // Se produto é só para dias especiais e não é dia especial
    if (produto.disponivel_dias_especiais && !diaEspecial) {
      return res.status(403).json({
        erro: 'Este produto está disponível apenas em dias especiais'
      });
    }

    let precoAtual = produto.preco;
    if (diaEspecial && produto.preco_desconto) {
      precoAtual = produto.preco_desconto;
    }

    const produtoFormatado = {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      preco_atual: precoAtual,
      categoria: produto.categoria,
      estoque: produto.estoque,
      imagem: produto.imagem,
      disponivel_dias_especiais: produto.disponivel_dias_especiais,
      em_promocao: diaEspecial && produto.preco_desconto && produto.preco_desconto < produto.preco
    };

    res.json({
      produto: produtoFormatado,
      dia_especial: diaEspecial ? {
        nome: diaEspecial.nome,
        desconto_geral: diaEspecial.desconto_geral
      } : null
    });

  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Listar categorias (público)
router.get('/admin/categorias', async (req, res) => {
  try {
    const categorias = await Product.findAll({
      attributes: ['categoria'],
      where: { ativo: true },
      group: ['categoria'],
      raw: true
    });

    const listaCategorias = categorias.map(item => item.categoria);

    res.json({
      categorias: listaCategorias
    });

  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// === ROTAS ADMINISTRATIVAS ===

// Criar produto (admin)
router.post('/', authAdmin, [
  body('nome').trim().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres'),
  body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um valor positivo'),
  body('preco_desconto').optional().isFloat({ min: 0 }).withMessage('Preço de desconto deve ser um valor positivo'),
  body('categoria').trim().notEmpty().withMessage('Categoria é obrigatória'),
  body('estoque').isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro positivo'),
  body('disponivel_dias_especiais').optional().isBoolean().withMessage('Disponivel_dias_especiais deve ser true ou false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const produto = await Product.create(req.body);

    res.status(201).json({
      mensagem: 'Produto criado com sucesso',
      produto
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Atualizar produto (admin)
router.put('/:id', authAdmin, [
  body('nome').optional().trim().isLength({ min: 2, max: 200 }),
  body('preco').optional().isFloat({ min: 0 }),
  body('preco_desconto').optional().isFloat({ min: 0 }),
  body('estoque').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const produto = await Product.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({
        erro: 'Produto não encontrado'
      });
    }

    await produto.update(req.body);

    res.json({
      mensagem: 'Produto atualizado com sucesso',
      produto
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Deletar produto (admin)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const produto = await Product.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({
        erro: 'Produto não encontrado'
      });
    }

    // Soft delete - apenas desativar
    await produto.update({ ativo: false });

    res.json({
      mensagem: 'Produto removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Listar todos os produtos (admin) - incluindo inativos
router.get('/admin/todos', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoria = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Filtro por busca
    if (search) {
      whereClause[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { descricao: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por categoria
    if (categoria) {
      whereClause.categoria = categoria;
    }

    const { count, rows: produtos } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      produtos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar produtos (admin):', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
