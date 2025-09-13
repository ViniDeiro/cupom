const axios = require('axios');
const xml2js = require('xml2js');

class CorreiosService {
  constructor() {
    // URLs dos serviços dos Correios
    this.FRETE_URL = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';
    this.RASTREAMENTO_URL = 'https://www2.correios.com.br/sistemas/rastreamento/ctrl/ctrlRastreamento.cfm';
    
    // Códigos dos serviços dos Correios
    this.SERVICOS = {
      SEDEX: '40010',
      SEDEX_10: '40215',
      SEDEX_HOJE: '40290',
      PAC: '41106',
      SEDEX_A_COBRAR: '40045',
      PAC_A_COBRAR: '41068'
    };
    
    // Configurações padrão
    this.config = {
      nCdEmpresa: process.env.CORREIOS_EMPRESA || '',
      sDsSenha: process.env.CORREIOS_SENHA || '',
      nCdFormato: '1', // Caixa/Pacote
      sCdMaoPropria: 'N',
      nVlValorDeclarado: '0',
      sCdAvisoRecebimento: 'N'
    };
  }

  /**
   * Calcula o frete para um ou múltiplos serviços
   * @param {Object} params - Parâmetros do frete
   * @param {string} params.cepOrigem - CEP de origem
   * @param {string} params.cepDestino - CEP de destino
   * @param {number} params.peso - Peso em kg
   * @param {number} params.comprimento - Comprimento em cm
   * @param {number} params.altura - Altura em cm
   * @param {number} params.largura - Largura em cm
   * @param {number} params.valorDeclarado - Valor declarado (opcional)
   * @param {boolean} params.maoPropria - Mão própria (opcional)
   * @param {boolean} params.avisoRecebimento - Aviso de recebimento (opcional)
   * @param {Array} params.servicos - Array com códigos dos serviços (opcional)
   * @returns {Promise<Array>} Array com os resultados do frete
   */
  async calcularFrete(params) {
    try {
      const {
        cepOrigem,
        cepDestino,
        peso,
        comprimento = 20,
        altura = 5,
        largura = 15,
        valorDeclarado = 0,
        maoPropria = false,
        avisoRecebimento = false,
        servicos = [this.SERVICOS.SEDEX, this.SERVICOS.PAC]
      } = params;

      // Validações básicas
      if (!cepOrigem || !cepDestino || !peso) {
        throw new Error('CEP de origem, destino e peso são obrigatórios');
      }

      // Remove caracteres não numéricos dos CEPs
      const cepOrigemLimpo = cepOrigem.replace(/\D/g, '');
      const cepDestinoLimpo = cepDestino.replace(/\D/g, '');

      if (cepOrigemLimpo.length !== 8 || cepDestinoLimpo.length !== 8) {
        throw new Error('CEPs devem ter 8 dígitos');
      }

      const resultados = [];

      // Calcula frete para cada serviço
      for (const servico of servicos) {
        const queryParams = {
          nCdEmpresa: this.config.nCdEmpresa,
          sDsSenha: this.config.sDsSenha,
          nCdServico: servico,
          sCepOrigem: cepOrigemLimpo,
          sCepDestino: cepDestinoLimpo,
          nVlPeso: peso,
          nCdFormato: this.config.nCdFormato,
          nVlComprimento: comprimento,
          nVlAltura: altura,
          nVlLargura: largura,
          nVlDiametro: '0',
          sCdMaoPropria: maoPropria ? 'S' : 'N',
          nVlValorDeclarado: valorDeclarado,
          sCdAvisoRecebimento: avisoRecebimento ? 'S' : 'N',
          StrRetorno: 'xml'
        };

        const response = await axios.get(this.FRETE_URL, {
          params: queryParams,
          timeout: 10000
        });

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        if (result.Servicos && result.Servicos.cServico) {
          const servicoResult = result.Servicos.cServico[0];
          
          resultados.push({
            codigo: servicoResult.Codigo[0],
            valor: parseFloat(servicoResult.Valor[0].replace(',', '.')),
            prazoEntrega: parseInt(servicoResult.PrazoEntrega[0]),
            valorMaoPropria: parseFloat(servicoResult.ValorMaoPropria[0].replace(',', '.')),
            valorAvisoRecebimento: parseFloat(servicoResult.ValorAvisoRecebimento[0].replace(',', '.')),
            valorValorDeclarado: parseFloat(servicoResult.ValorValorDeclarado[0].replace(',', '.')),
            entregaDomiciliar: servicoResult.EntregaDomiciliar[0] === 'S',
            entregaSabado: servicoResult.EntregaSabado[0] === 'S',
            erro: servicoResult.Erro[0],
            msgErro: servicoResult.MsgErro[0],
            nomeServico: this.getNomeServico(servicoResult.Codigo[0])
          });
        }
      }

      return resultados.filter(r => r.erro === '0'); // Retorna apenas resultados sem erro
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      throw new Error('Erro ao calcular frete dos Correios: ' + error.message);
    }
  }

  /**
   * Rastreia uma encomenda pelos Correios
   * @param {string} codigoRastreamento - Código de rastreamento
   * @returns {Promise<Object>} Dados do rastreamento
   */
  async rastrearEncomenda(codigoRastreamento) {
    try {
      if (!codigoRastreamento) {
        throw new Error('Código de rastreamento é obrigatório');
      }

      // API alternativa para rastreamento (mais confiável)
      const response = await axios.post('https://proxyapp.correios.com.br/v1/sro-rastro/' + codigoRastreamento, {
        resultado: 'T',
        token: process.env.CORREIOS_TOKEN || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      if (response.data && response.data.objetos) {
        const objeto = response.data.objetos[0];
        
        return {
          codigo: objeto.codObjeto,
          modalidade: objeto.modalidade,
          tipoPostal: objeto.tipoPostal,
          habilitaAutoDeclaracao: objeto.habilitaAutoDeclaracao,
          permiteEncargoImportacao: objeto.permiteEncargoImportacao,
          habilitaPercursoAlternativo: objeto.habilitaPercursoAlternativo,
          habilitaCrowdshipping: objeto.habilitaCrowdshipping,
          eventos: objeto.eventos ? objeto.eventos.map(evento => ({
            codigo: evento.codigo,
            descricao: evento.descricao,
            dtHrCriado: evento.dtHrCriado,
            tipo: evento.tipo,
            unidade: evento.unidade ? {
              endereco: evento.unidade.endereco,
              tipo: evento.unidade.tipo
            } : null,
            urlIcone: evento.urlIcone
          })) : [],
          modalidadeAdicional: objeto.modalidadeAdicional,
          formatoAdicional: objeto.formatoAdicional,
          situacaoAtual: objeto.eventos && objeto.eventos.length > 0 ? objeto.eventos[0].descricao : 'Sem informações'
        };
      }

      throw new Error('Objeto não encontrado ou dados inválidos');
    } catch (error) {
      console.error('Erro ao rastrear encomenda:', error);
      
      // Fallback para método alternativo de rastreamento
      return this.rastrearEncomendaAlternativo(codigoRastreamento);
    }
  }

  /**
   * Método alternativo de rastreamento (scraping)
   * @param {string} codigoRastreamento - Código de rastreamento
   * @returns {Promise<Object>} Dados básicos do rastreamento
   */
  async rastrearEncomendaAlternativo(codigoRastreamento) {
    try {
      // Este é um método simplificado que pode ser expandido
      return {
        codigo: codigoRastreamento,
        situacaoAtual: 'Consulte diretamente no site dos Correios',
        eventos: [],
        erro: 'Serviço de rastreamento temporariamente indisponível'
      };
    } catch (error) {
      console.error('Erro no rastreamento alternativo:', error);
      throw new Error('Não foi possível rastrear a encomenda');
    }
  }

  /**
   * Retorna o nome do serviço baseado no código
   * @param {string} codigo - Código do serviço
   * @returns {string} Nome do serviço
   */
  getNomeServico(codigo) {
    const nomes = {
      '40010': 'SEDEX',
      '40215': 'SEDEX 10',
      '40290': 'SEDEX Hoje',
      '41106': 'PAC',
      '40045': 'SEDEX a Cobrar',
      '41068': 'PAC a Cobrar'
    };
    
    return nomes[codigo] || 'Serviço Desconhecido';
  }

  /**
   * Valida se um CEP é válido
   * @param {string} cep - CEP a ser validado
   * @returns {boolean} True se válido
   */
  validarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }

  /**
   * Formata um CEP
   * @param {string} cep - CEP a ser formatado
   * @returns {string} CEP formatado
   */
  formatarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  }
}

module.exports = new CorreiosService();