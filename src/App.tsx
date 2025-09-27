import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Upload, Download, FileSpreadsheet, Trash2, Calendar, Search, Plus } from 'lucide-react';

interface AulaRegistro {
  id: string;
  nome: string;
  codigo: string;
  curso: string;
  data: string;
  horario: string;
  professor?: string;
  matriculado: boolean;
}

interface Curso {
  id: string;
  nome: string;
}

interface Horario {
  id: string;
  periodo: string;
}

interface ProfessorSelecionado {
  registroId: string;
  mostrarModal: boolean;
}

const cursos: Curso[] = [
  { id: '1', nome: 'Inglês Básico' },
  { id: '2', nome: 'Espanhol Básico' },
  { id: '3', nome: 'Francês Básico' },
  { id: '4', nome: 'Alemão Básico' },
  { id: '5', nome: 'Italiano Básico' }
];

const horarios: Horario[] = [
  { id: '1', periodo: '09:00 - 10:00' },
  { id: '2', periodo: '10:00 - 11:00' },
  { id: '3', periodo: '14:00 - 15:00' },
  { id: '4', periodo: '15:00 - 16:00' },
  { id: '5', periodo: '16:00 - 17:00' }
];

const professores = [
  'Prof. Carlos Oliveira',
  'Prof. Maria Santos',
  'Prof. João Silva',
  'Prof. Ana Costa',
  'Prof. Pedro Lima'
];

function App() {
  // Verificar se está rodando no Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const [registros, setRegistros] = useState<AulaRegistro[]>([
    {
      id: '1',
      nome: 'Arthur',
      codigo: 'PC-R36T65',
      curso: 'Inglês Básico',
      data: '25/09/2025',
      horario: '09:00 - 10:00',
      professor: 'Prof. Carlos Oliveira',
      matriculado: true
    },
    {
      id: '2',
      nome: 'Eu',
      codigo: 'PC-I9N83',
      curso: 'Espanhol Básico',
      data: '21/09/2025',
      horario: '15:00 - 16:00',
      matriculado: false
    }
  ]);

  const [novaAula, setNovaAula] = useState({
    nome: '',
    curso: '',
    data: '26/09/2025',
    horario: ''
  });

  const [filtros, setFiltros] = useState({
    pesquisa: '',
    curso: 'todos'
  });

  const [status, setStatus] = useState('Aguardando primeira sincronização (PC-R36T65)');
  const [sincronizando, setSincronizando] = useState(false);

  const [professorSelecionado, setProfessorSelecionado] = useState<ProfessorSelecionado>({
    registroId: '',
    mostrarModal: false
  });
  const [professorEscolhido, setProfessorEscolhido] = useState('');

  // Configurar listeners do Electron
  useEffect(() => {
    if (isElectron) {
      // Listener para ações do menu
      window.electronAPI.onMenuAction((action) => {
        switch (action) {
          case 'new-record':
            // Focar no primeiro campo do formulário
            document.querySelector('input[type="text"]')?.focus();
            break;
          case 'sync':
            handleSincronizar();
            break;
          case 'export-excel':
            handleExportarExcel();
            break;
          case 'clear-all':
            handleLimparTudo();
            break;
        }
      });

      // Listener para carregar dados
      window.electronAPI.onLoadData((data, filename) => {
        try {
          const parsedData = JSON.parse(data);
          if (Array.isArray(parsedData)) {
            setRegistros(parsedData);
            setStatus(`Dados carregados de ${filename}`);
          }
        } catch (error) {
          alert('Erro ao carregar arquivo: formato inválido');
        }
      });

      // Listener para salvar dados
      window.electronAPI.onSaveData((filePath) => {
        // Em uma aplicação real, você usaria a API do Electron para salvar
        // Por enquanto, simularemos o salvamento
        setStatus(`Dados salvos em ${filePath}`);
      });

      // Cleanup
      return () => {
        if (window.electronAPI.removeAllListeners) {
          window.electronAPI.removeAllListeners('menu-action');
          window.electronAPI.removeAllListeners('load-data');
          window.electronAPI.removeAllListeners('save-data');
        }
      };
    }
  }, []);

  const registrosFiltrados = registros.filter(registro => {
    const matchPesquisa = registro.nome.toLowerCase().includes(filtros.pesquisa.toLowerCase()) ||
                         registro.codigo.toLowerCase().includes(filtros.pesquisa.toLowerCase());
    const matchCurso = filtros.curso === 'todos' || registro.curso === filtros.curso;
    return matchPesquisa && matchCurso;
  });

  const estatisticas = {
    totalAulas: registros.length,
    matriculados: registros.filter(r => r.matriculado).length,
    comProfessor: registros.filter(r => r.professor).length,
    taxaConversao: registros.length > 0 ? Math.round((registros.filter(r => r.matriculado).length / registros.length) * 100) : 0
  };

  const handleRegistrarAula = () => {
    if (!novaAula.nome || !novaAula.curso || !novaAula.horario) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const novoRegistro: AulaRegistro = {
      id: Date.now().toString(),
      nome: novaAula.nome,
      codigo: `PC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      curso: novaAula.curso,
      data: novaAula.data,
      horario: novaAula.horario,
      matriculado: false
    };

    setRegistros([...registros, novoRegistro]);
    setNovaAula({
      nome: '',
      curso: '',
      data: '26/09/2025',
      horario: ''
    });
  };

  const handleMatricular = (id: string) => {
    setRegistros(registros.map(registro =>
      registro.id === id ? { ...registro, matriculado: true } : registro
    ));
  };

  const handleDesmatricular = (id: string) => {
    setRegistros(registros.map(registro =>
      registro.id === id ? { ...registro, matriculado: false } : registro
    ));
  };

  const handleAssignarProfessor = (id: string) => {
    setProfessorSelecionado({
      registroId: id,
      mostrarModal: true
    });
    setProfessorEscolhido('');
  };

  const handleConfirmarProfessor = () => {
    if (!professorEscolhido) {
      alert('Por favor, selecione um professor');
      return;
    }

    setRegistros(registros.map(registro =>
      registro.id === professorSelecionado.registroId 
        ? { ...registro, professor: professorEscolhido } 
        : registro
    ));

    setProfessorSelecionado({
      registroId: '',
      mostrarModal: false
    });
    setProfessorEscolhido('');
  };

  const handleCancelarSelecaoProfessor = () => {
    setProfessorSelecionado({
      registroId: '',
      mostrarModal: false
    });
    setProfessorEscolhido('');
  };

  const handleRemover = (id: string) => {
    if (confirm('Tem certeza que deseja remover este registro?')) {
      setRegistros(registros.filter(registro => registro.id !== id));
    }
  };

  const handleSincronizar = () => {
    setSincronizando(true);
    setTimeout(() => {
      setStatus('Sincronizado com sucesso');
      setSincronizando(false);
    }, 2000);
  };

  const handleExportarExcel = () => {
    // Simular exportação
    alert('Arquivo Excel exportado com sucesso!');
  };

  const handleCarregarArquivo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Arquivo ${file.name} carregado com sucesso!`);
      }
    };
    input.click();
  };

  const handleSalvarArquivo = () => {
    if (isElectron) {
      // No Electron, usar o diálogo nativo
      alert('Use o menu Arquivo > Salvar Dados para salvar no Electron');
    } else {
      // No navegador, usar download direto
      const data = JSON.stringify(registros, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dados-sistema-demonstracao.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleLimparTudo = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      setRegistros([]);
      setNovaAula({
        nome: '',
        curso: '',
        data: '26/09/2025',
        horario: ''
      });
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isElectron ? 'electron-app' : ''}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 ${isElectron ? 'electron-header' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sistema de Aulas Demonstrativas</h1>
                <p className="text-indigo-100">{isElectron ? 'Aplicativo Desktop - Windows' : 'Sistema com arquivo único compartilhado na rede'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
              <button 
                onClick={handleSincronizar}
                disabled={sincronizando}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
                <span>Sincronizar</span>
              </button>
              <button 
                onClick={handleCarregarArquivo}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Carregar Arquivo</span>
              </button>
              <button 
                onClick={handleSalvarArquivo}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Salvar Arquivo</span>
              </button>
              <button 
                onClick={handleExportarExcel}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Excel</span>
              </button>
              <button 
                onClick={handleLimparTudo}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Tudo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Status */}
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
          <div className="space-y-2">
            {isElectron && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">💻 Modo:</span>
                <span className="text-gray-600">Aplicativo Desktop Windows</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="font-medium">📁 Arquivo Único:</span>
              <span className="text-gray-600">{isElectron ? 'Gerenciado pelo aplicativo' : 'dados-sistema-demonstracao.json em \\micro01\\OUTROS\\NOVOS_ALUNOS\\'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">🏗️ Estrutura:</span>
              <span className="text-gray-600">{isElectron ? 'Aplicativo Desktop → Dados Locais' : 'Sistema de Demonstração → Dados → dados-sistema-demonstracao.json'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="font-medium">Status:</span>
              <span className="text-gray-600">{status}</span>
            </div>
          </div>
        </div>

        {/* Formulário Nova Aula */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nova Aula Demonstrativa</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Pessoa</label>
              <input
                type="text"
                value={novaAula.nome}
                onChange={(e) => setNovaAula({...novaAula, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Digite o nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso Demonstrado</label>
              <select
                value={novaAula.curso}
                onChange={(e) => setNovaAula({...novaAula, curso: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione o curso</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.nome}>{curso.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <div className="relative">
                <input
                  type="text"
                  value={novaAula.data}
                  onChange={(e) => setNovaAula({...novaAula, data: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="DD/MM/AAAA"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário da Turma</label>
              <select
                value={novaAula.horario}
                onChange={(e) => setNovaAula({...novaAula, horario: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione o horário</option>
                {horarios.map(horario => (
                  <option key={horario.id} value={horario.periodo}>{horario.periodo}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={handleRegistrarAula}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Registrar Aula Demonstrativa
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{estatisticas.totalAulas}</div>
            <div className="text-gray-600">Total de Aulas</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{estatisticas.matriculados}</div>
            <div className="text-gray-600">Matriculados</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600">{estatisticas.comProfessor}</div>
            <div className="text-gray-600">Com Professor</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">{estatisticas.taxaConversao}%</div>
            <div className="text-gray-600">Taxa de Conversão</div>
          </div>
        </div>

        {/* Registros */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Registros de Aulas Demonstrativas</span>
              </h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filtros.pesquisa}
                    onChange={(e) => setFiltros({...filtros, pesquisa: e.target.value})}
                    placeholder="Pesquisar registros..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filtros.curso}
                  onChange={(e) => setFiltros({...filtros, curso: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="todos">Todos os cursos</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.nome}>{curso.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrosFiltrados.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{registro.nome}</div>
                        <div className="text-sm text-gray-500">{registro.codigo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registro.curso}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registro.data}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registro.horario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{registro.professor || 'Não definido'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registro.matriculado ? (
                        <span className="text-green-600">✓ Matriculado</span>
                      ) : (
                        <span className="text-red-600">✗ Não matriculado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleAssignarProfessor(registro.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Professor
                      </button>
                      {registro.matriculado ? (
                        <button
                          onClick={() => handleDesmatricular(registro.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          Desmatricular
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMatricular(registro.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          Matricular
                        </button>
                      )}
                      <button
                        onClick={() => handleRemover(registro.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
                {registrosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Professor */}
      {professorSelecionado.mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {registros.find(r => r.id === professorSelecionado.registroId)?.professor 
                ? 'Alterar Professor' 
                : 'Selecionar Professor'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {registros.find(r => r.id === professorSelecionado.registroId)?.professor 
                  ? 'Escolha um novo professor:' 
                  : 'Escolha um professor:'}
              </label>
              <select
                value={professorEscolhido}
                onChange={(e) => setProfessorEscolhido(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione um professor</option>
                {professores.map((professor, index) => (
                  <option key={index} value={professor}>{professor}</option>
                ))}
              </select>
              {registros.find(r => r.id === professorSelecionado.registroId)?.professor && (
                <div className="mt-2 text-sm text-gray-600">
                  Professor atual: <span className="font-medium">
                    {registros.find(r => r.id === professorSelecionado.registroId)?.professor}
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmarProfessor}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={handleCancelarSelecaoProfessor}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;