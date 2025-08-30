import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gift, 
  Users, 
  Clock, 
  TrendingUp, 
  Shield, 
  Heart,
  Star,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const About = () => {
  const stats = [
    { number: '10K+', label: 'Usuários Ativos', icon: Users },
    { number: '50K+', label: 'Cupons Vendidos', icon: Gift },
    { number: '95%', label: 'Satisfação', icon: Star },
    { number: '2 Anos', label: 'No Mercado', icon: TrendingUp }
  ];

  const features = [
    {
      icon: Gift,
      title: 'Sistema Inovador de Cupons',
      description: 'Compre cupons antecipadamente e use em dias especiais para economizar muito.'
    },
    {
      icon: Clock,
      title: 'Dias Especiais Exclusivos',
      description: 'Eventos especiais onde apenas portadores de cupons podem comprar com grandes descontos.'
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Seus dados e transações estão protegidos com as melhores tecnologias de segurança.'
    },
    {
      icon: Heart,
      title: 'Experiência Personalizada',
      description: 'Notificações por email e produtos especiais selecionados especialmente para você.'
    }
  ];

  const team = [
    {
      name: 'Ana Silva',
      role: 'CEO & Fundadora',
      description: 'Visionária por trás do conceito inovador de cupons especiais.'
    },
    {
      name: 'Carlos Santos',
      role: 'CTO',
      description: 'Responsável pela tecnologia que torna tudo isso possível.'
    },
    {
      name: 'Marina Costa',
      role: 'Diretora de Marketing',
      description: 'Especialista em conectar produtos incríveis com pessoas incríveis.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-cupom-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cupom-400 bg-opacity-20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Sobre o <span className="text-cupom-300">Eu Tenho Sonhos</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Revolucionando a forma como você economiza com o sistema mais inovador de cupons do mercado
            </p>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary-600" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Nossa História
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  O Eu Tenho Sonhos nasceu de uma ideia simples mas revolucionária: e se as pessoas pudessem comprar seus descontos antecipadamente e usar apenas em momentos especiais?
                </p>
                <p>
                  Em 2022, nossa equipe percebeu que o mercado de e-commerce precisava de algo diferente. Não bastava apenas oferecer produtos - era preciso criar uma experiência única de economia e exclusividade.
                </p>
                <p>
                  Assim criamos o primeiro sistema de cupons especiais do Brasil, onde você compra seu desconto quando quer e usa quando pode economizar de verdade. É como ter um seguro de desconto!
                </p>
                <p>
                  Hoje, somos a plataforma de cupons que mais cresce no país, com milhares de usuários satisfeitos que já descobriram o poder de economizar de forma inteligente.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-cupom-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="text-primary-600 mx-auto mb-4" size={64} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Inovação</h3>
                  <p className="text-gray-600">Sempre pensando no futuro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Diferenciais */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O Que Nos Torna Únicos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nosso sistema foi pensado para proporcionar a melhor experiência de economia do mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Conheça Nossa Equipe
            </h2>
            <p className="text-xl text-gray-600">
              As mentes por trás da revolução dos cupons especiais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-cupom-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-cupom-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8">
            Nossa Missão
          </h2>
          <p className="text-xl mb-8 text-gray-200 leading-relaxed">
            "Democratizar o acesso a descontos exclusivos e criar uma comunidade de compradores inteligentes que economizam de verdade, transformando a forma como as pessoas fazem compras online."
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">Transparência</h3>
              <p className="text-gray-200">Preços claros, sem pegadinhas</p>
            </div>
            <div className="text-center">
              <Heart className="mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">Satisfação</h3>
              <p className="text-gray-200">Seu sucesso é nosso sucesso</p>
            </div>
            <div className="text-center">
              <Sparkles className="mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">Inovação</h3>
              <p className="text-gray-200">Sempre evoluindo para você</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Pronto para Fazer Parte da Nossa História?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de pessoas que já descobriram o poder dos cupons especiais
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="btn-primary text-lg px-8 py-4"
            >
              <Users className="mr-2" size={20} />
              Criar Conta Grátis
            </Link>
            <Link
              to="/produtos"
              className="btn-secondary text-lg px-8 py-4"
            >
              Explorar Produtos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
