import React, { useState } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

function Rastreamento() {
  const [codigoRastreamento, setCodigoRastreamento] = useState('');
  const [dadosRastreamento, setDadosRastreamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);

  const formatarCodigoRastreamento = (codigo) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculo
    const codigoLimpo = codigo.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Formata no padrão AA123456789BR
    if (codigoLimpo.length === 13) {
      return `${codigoLimpo.slice(0, 2)}${codigoLimpo.slice(2, 11)}${codigoLimpo.slice(11, 13)}`;
    }
    
    return codigoLimpo;
  };

  const validarCodigoRastreamento = (codigo) => {
    const codigoLimpo = formatarCodigoRastreamento(codigo);
    // Valida formato: 2 letras + 9 números + 2 letras
    return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(codigoLimpo);
  };

  const buscarRastreamento = async (e) => {
    e.preventDefault();
    
    if (!codigoRastreamento.trim()) {
      toast.error('Digite um código de rastreamento');
      return;
    }

    const codigoFormatado = formatarCodigoRastreamento(codigoRastreamento);
    
    if (!validarCodigoRastreamento(codigoFormatado)) {
      toast.error('Código de rastreamento inválido. Use o formato: AA123456789BR');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/correios/rastrear/${codigoFormatado}`);
      const result = await response.json();

      if (result.success) {
        setDadosRastreamento(result.data);
        setHistorico(result.data.eventos || []);
        toast.success('Rastreamento encontrado!');
      } else {
        toast.error(result.message || 'Objeto não encontrado');
        setDadosRastreamento(null);
        setHistorico([]);
      }
    } catch (error) {
      console.error('Erro ao rastrear:', error);
      toast.error('Erro ao buscar rastreamento. Tente novamente.');
      setDadosRastreamento(null);
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (evento) => {
    const descricao = evento.descricao?.toLowerCase() || '';
    
    if (descricao.includes('entregue') || descricao.includes('entrega')) {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    if (descricao.includes('saiu') || descricao.includes('transporte')) {
      return <Truck className="text-blue-500" size={20} />;
    }
    if (descricao.includes('postado') || descricao.includes('recebido')) {
      return <Package className="text-orange-500" size={20} />;
    }
    if (descricao.includes('tentativa') || descricao.includes('ausente')) {
      return <AlertCircle className="text-yellow-500" size={20} />;
    }
    
    return <Clock className="text-gray-500" size={20} />;
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Rastreamento de Encomendas</h1>
          <p className="text-gray-600">
            Digite o código de rastreamento dos Correios para acompanhar sua encomenda
          </p>
        </div>

        {/* Formulário de busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={buscarRastreamento} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Rastreamento
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={codigoRastreamento}
                  onChange={(e) => setCodigoRastreamento(e.target.value)}
                  placeholder="AA123456789BR"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center font-mono text-lg"
                  maxLength="15"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Rastrear
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Exemplo: AA123456789BR</p>
              <p>O código de rastreamento possui 13 caracteres: 2 letras + 9 números + 2 letras</p>
            </div>
          </form>
        </div>

        {/* Resultado do rastreamento */}
        {dadosRastreamento && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cabeçalho com informações gerais */}
            <div className="bg-primary-50 p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Objeto: {dadosRastreamento.codigo}
                </h2>
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {dadosRastreamento.modalidade || 'Encomenda'}
                </span>
              </div>
              
              {dadosRastreamento.situacaoAtual && (
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon({ descricao: dadosRastreamento.situacaoAtual })}
                    <div>
                      <p className="font-medium text-gray-900">Situação Atual</p>
                      <p className="text-gray-600">{dadosRastreamento.situacaoAtual}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Histórico de eventos */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico de Movimentação</h3>
              
              {historico.length > 0 ? (
                <div className="space-y-4">
                  {historico.map((evento, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(evento)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {evento.descricao}
                            </p>
                            
                            {evento.unidade && (
                              <div className="mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  <span>
                                    {evento.unidade.endereco?.cidade && evento.unidade.endereco?.uf
                                      ? `${evento.unidade.endereco.cidade}/${evento.unidade.endereco.uf}`
                                      : evento.unidade.endereco?.nome || 'Local não informado'
                                    }
                                  </span>
                                </div>
                                {evento.unidade.tipo && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {evento.unidade.tipo}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            {formatarData(evento.dtHrCriado)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Nenhum evento de rastreamento encontrado</p>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            {dadosRastreamento.tipoPostal && (
              <div className="bg-gray-50 p-6 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Informações Adicionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo Postal:</span>
                    <span className="ml-2 font-medium">{dadosRastreamento.tipoPostal}</span>
                  </div>
                  {dadosRastreamento.modalidadeAdicional && (
                    <div>
                      <span className="text-gray-600">Modalidade:</span>
                      <span className="ml-2 font-medium">{dadosRastreamento.modalidadeAdicional}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dicas de rastreamento */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Dicas de Rastreamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Como encontrar o código:</h4>
              <ul className="space-y-1">
                <li>• Verifique o comprovante de postagem</li>
                <li>• Consulte o e-mail de confirmação do pedido</li>
                <li>• Acesse sua conta na loja online</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Problemas com rastreamento:</h4>
              <ul className="space-y-1">
                <li>• Aguarde até 24h após a postagem</li>
                <li>• Verifique se o código está correto</li>
                <li>• Entre em contato com o remetente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rastreamento;