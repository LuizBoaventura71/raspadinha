import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  User, 
  LogOut, 
  Settings, 
  Users, 
  BarChart3, 
  GamepadIcon, 
  Plus, 
  Eye, 
  EyeOff,
  Trophy,
  Sparkles,
  CreditCard,
  Home,
  Menu,
  X
} from 'lucide-react';
import ScratchCard from './components/ScratchCard';
import PrizeModal from './components/PrizeModal';
import AdminPanel from './components/AdminPanel';
import DepositModal from './components/DepositModal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [realBalance, setRealBalance] = useState(0);
  const [testBalance, setTestBalance] = useState(0);
  const [balanceType, setBalanceType] = useState('real'); // 'real' ou 'test'
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [selectedGameForPrizes, setSelectedGameForPrizes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados de autenticação
  const [authMode, setAuthMode] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados do painel admin
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Estado para navegação
  const [currentSection, setCurrentSection] = useState('home'); // 'home', 'games', 'profile'

  // Configurações de probabilidades dos jogos (gerenciáveis pelo admin)
  const [gameSettings, setGameSettings] = useState({
    classica: { winChance: 0.15, minPrize: 1.50, maxPrize: 1000.00 },
    super: { winChance: 0.12, minPrize: 3.75, maxPrize: 5000.00 },
    mega: { winChance: 0.10, minPrize: 7.50, maxPrize: 15000.00 },
    suprema: { winChance: 0.08, minPrize: 75.00, maxPrize: 20000.00 },
    magica: { winChance: 0.05, minPrize: 150.00, maxPrize: 50000.00 }
  });

  // Dados mock dos tipos de raspadinha
  const gameTypes = {
    classica: {
      name: 'Raspadinha Clássica',
      cost: 1.00,
      max_prize: 1000.00,
      description: 'PRÊMIOS DE ATÉ R$ 1.000,00',
      color: 'from-purple-600 to-pink-600'
    },
    super: {
      name: 'Super Raspadinha',
      cost: 2.50,
      max_prize: 5000.00,
      description: 'PRÊMIOS DE ATÉ R$ 5.000,00',
      color: 'from-blue-600 to-cyan-600'
    },
    mega: {
      name: 'Mega Raspadinha',
      cost: 5.00,
      max_prize: 15000.00,
      description: 'PRÊMIOS DE ATÉ R$ 15.000,00',
      color: 'from-green-600 to-emerald-600'
    },
    suprema: {
      name: 'Raspadinha Suprema',
      cost: 50.00,
      max_prize: 20000.00,
      description: 'PRÊMIOS DE ATÉ R$ 20.000,00',
      color: 'from-orange-600 to-red-600'
    },
    magica: {
      name: 'Raspadinha Mágica',
      cost: 100.00,
      max_prize: 50000.00,
      description: 'PRÊMIOS DE ATÉ R$ 50.000,00',
      color: 'from-yellow-600 to-orange-600'
    }
  };

  // Dados mock dos últimos ganhadores
  const recentWinners = [
    { name: 'Mari S****', game: 'Raspadinha Suprema', prize: 15000.00 },
    { name: 'Lavínia G****', game: 'Sorte Instantânea', prize: 2500.00 },
    { name: 'Regina A****', game: 'Centavo da Sorte', prize: 500.00 },
    { name: 'Fabrício S****', game: 'Raspa Relâmpago', prize: 3000.00 },
    { name: 'Luciana T****', game: 'Raspadinha Mágica', prize: 20000.00 },
    { name: 'Minéia B****', game: 'Raspe e Ganhe', prize: 0.50 }
  ];

  useEffect(() => {
    // Simular carregamento inicial dos saldos
    setRealBalance(100.00);
    setTestBalance(50.75);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simular login
    setTimeout(() => {
      if ((loginData.email === 'admin@raspadinha.com' || loginData.email === 'master@raspadinha.com') && loginData.password === 'admin123') {
        setUser({ email: loginData.email, role: 'admin' });
        setToken('mock-token');
        localStorage.setItem('token', 'mock-token');
      } else if (loginData.email === 'master@raspadinha.com' && loginData.password === 'master123') {
        setUser({ email: loginData.email, role: 'admin' });
        setToken('mock-token');
        localStorage.setItem('token', 'mock-token');
      } else if (loginData.email && loginData.password) {
        setUser({ email: loginData.email, role: 'user' });
        setToken('mock-token');
        localStorage.setItem('token', 'mock-token');
      } else {
        setError('Email ou senha inválidos');
      }
      setLoading(false);
    }, 1000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }
    
    // Simular registro
    setTimeout(() => {
      setUser({ email: registerData.email, role: 'user' });
      setToken('mock-token');
      localStorage.setItem('token', 'mock-token');
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setShowAdminPanel(false);
  };

  const playGame = (gameType) => {
    const currentBalance = balanceType === 'real' ? realBalance : testBalance;
    
    if (currentBalance < gameTypes[gameType].cost) {
      setError(`Saldo ${balanceType === 'real' ? 'real' : 'de teste'} insuficiente para jogar`);
      return;
    }
    
    setCurrentGame({
      ...gameTypes[gameType],
      settings: gameSettings[gameType],
      balanceType: balanceType
    });
    setShowScratchCard(true);
  };

  const handleGameComplete = (prize) => {
    const gameCost = currentGame.cost;
    
    if (currentGame.balanceType === 'real') {
      // Atualizar saldo real
      const newRealBalance = realBalance - gameCost + (prize || 0);
      setRealBalance(newRealBalance);
    } else {
      // Atualizar saldo de teste
      const newTestBalance = testBalance - gameCost + (prize || 0);
      setTestBalance(newTestBalance);
    }
    
    if (prize > 0) {
      setSuccess(`Parabéns! Você ganhou R$ ${prize.toFixed(2)} no saldo ${currentGame.balanceType === 'real' ? 'real' : 'de teste'}!`);
    }
    
    setShowScratchCard(false);
    setCurrentGame(null);
  };

  const showPrizes = (gameType) => {
    setSelectedGameForPrizes(gameTypes[gameType]);
    setShowPrizeModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              🎰 Raspadinha Digital
            </CardTitle>
            <CardDescription>
              O maior site de raspadinha do Brasil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={setAuthMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">🎰 RASPE PIX</h1>
              <nav className="hidden md:flex space-x-6">
                <Button 
                  variant={currentSection === 'home' ? 'default' : 'ghost'} 
                  className="text-foreground hover:text-primary"
                  onClick={() => {
                    setCurrentSection('home');
                    setShowAdminPanel(false);
                  }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
                <Button 
                  variant={currentSection === 'games' ? 'default' : 'ghost'} 
                  className="text-foreground hover:text-primary"
                  onClick={() => {
                    setCurrentSection('games');
                    setShowAdminPanel(false);
                  }}
                >
                  <GamepadIcon className="h-4 w-4 mr-2" />
                  Raspadinhas
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {/* Seletor de tipo de saldo */}
                <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                  <Button
                    variant={balanceType === 'real' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBalanceType('real')}
                    className="text-xs"
                  >
                    Real
                  </Button>
                  <Button
                    variant={balanceType === 'test' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBalanceType('test')}
                    className="text-xs"
                  >
                    Teste
                  </Button>
                </div>
                
                {/* Exibição do saldo */}
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    R$ {(balanceType === 'real' ? realBalance : testBalance).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({balanceType === 'real' ? 'Real' : 'Teste'})
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowDepositModal(true)}
                className="hidden md:flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Depositar
              </Button>
              
              {user.role === 'admin' && (
                <Button
                  variant={showAdminPanel ? 'default' : 'secondary'}
                  onClick={() => {
                    setShowAdminPanel(!showAdminPanel);
                    setCurrentSection('admin');
                  }}
                  className="hidden md:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <Button variant="ghost" onClick={handleLogout} className="hidden md:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              {/* Seletor de tipo de saldo mobile */}
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                <Button
                  variant={balanceType === 'real' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBalanceType('real')}
                  className="text-xs flex-1"
                >
                  Real
                </Button>
                <Button
                  variant={balanceType === 'test' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBalanceType('test')}
                  className="text-xs flex-1"
                >
                  Teste
                </Button>
              </div>
              
              {/* Navegação mobile */}
              <div className="flex space-x-2 mb-2">
                <Button 
                  variant={currentSection === 'home' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setCurrentSection('home');
                    setShowAdminPanel(false);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Início
                </Button>
                <Button 
                  variant={currentSection === 'games' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setCurrentSection('games');
                    setShowAdminPanel(false);
                    setMobileMenuOpen(false);
                  }}
                >
                  <GamepadIcon className="h-4 w-4 mr-1" />
                  Jogos
                </Button>
              </div>
              
              {/* Exibição do saldo mobile */}
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Saldo {balanceType === 'real' ? 'Real' : 'de Teste'}:</span>
                <span className="font-semibold">
                  R$ {(balanceType === 'real' ? realBalance : testBalance).toFixed(2)}
                </span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowDepositModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Depositar
              </Button>
              {user.role === 'admin' && (
                <Button
                  variant={showAdminPanel ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => {
                    setShowAdminPanel(!showAdminPanel);
                    setCurrentSection('admin');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showAdminPanel && user.role === 'admin' ? (
          <AdminPanel 
            gameSettings={gameSettings}
            setGameSettings={setGameSettings}
            onUpdateBalance={(email, amount, type) => {
              // Callback para atualizar saldo quando o admin adicionar
              if (user.email === email) {
                if (type === 'real') {
                  setRealBalance(prev => prev + amount);
                } else {
                  setTestBalance(prev => prev + amount);
                }
              }
            }}
          />
        ) : (
          <>
            {/* Seção Início */}
            {currentSection === 'home' && (
              <>
                {/* Banner Principal */}
                <div className="mb-8 p-8 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-2">R$ 1.000 COM APENAS 1 REAL</h2>
                    <p className="text-muted-foreground">Descubra como milhares estão lucrando com poucos cliques.</p>
                  </div>
                </div>

                {/* Últimos Ganhadores */}
                <section className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-primary" />
                    Últimos Ganhadores
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentWinners.map((winner, index) => (
                      <Card key={index} className="game-card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-primary">{winner.name}</p>
                              <p className="text-sm text-muted-foreground">{winner.game}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-primary">
                                R$ {winner.prize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* Destaques - Preview dos Jogos */}
                <section>
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <Sparkles className="h-6 w-6 mr-2 text-primary" />
                    Destaques
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(gameTypes).slice(0, 3).map(([key, game]) => (
                      <Card key={key} className="game-card-hover overflow-hidden">
                        <div className={`h-32 bg-gradient-to-br ${game.color} relative`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="text-xl font-bold">{game.name}</h4>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                          <div className="flex items-center justify-between">
                            <Button 
                              className="flex-1 mr-2"
                              onClick={() => {
                                setCurrentSection('games');
                                playGame(key);
                              }}
                            >
                              Jogar R$ {game.cost.toFixed(2)}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => showPrizes(key)}
                            >
                              VER PRÊMIOS
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setCurrentSection('games')}
                    >
                      Ver Todos os Jogos
                    </Button>
                  </div>
                </section>
              </>
            )}

            {/* Seção Jogos/Raspadinhas */}
            {currentSection === 'games' && (
              <>
                {/* Cabeçalho da seção */}
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold mb-2">Todos os Jogos de Raspadinha</h2>
                  <p className="text-muted-foreground">
                    Escolha seu jogo favorito e teste sua sorte! 
                    Saldo atual: R$ {(balanceType === 'real' ? realBalance : testBalance).toFixed(2)} ({balanceType === 'real' ? 'Real' : 'Teste'})
                  </p>
                </div>

                {/* Todos os Jogos */}
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(gameTypes).map(([key, game]) => (
                      <Card key={key} className="game-card-hover overflow-hidden">
                        <div className={`h-32 bg-gradient-to-br ${game.color} relative`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="text-xl font-bold">{game.name}</h4>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                          
                          {/* Mostrar configurações do admin se disponíveis */}
                          {gameSettings[key] && (
                            <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted rounded">
                              <p>Chance de ganhar: {gameSettings[key].winChance}%</p>
                              <p>Prêmios: R$ {gameSettings[key].minPrize.toFixed(2)} - R$ {gameSettings[key].maxPrize.toFixed(2)}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Button 
                              className="flex-1 mr-2"
                              onClick={() => playGame(key)}
                              disabled={(balanceType === 'real' ? realBalance : testBalance) < game.cost}
                            >
                              Jogar R$ {game.cost.toFixed(2)}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => showPrizes(key)}
                            >
                              VER PRÊMIOS
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Regulamentos</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary">Jogo responsável</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">Política de Privacidade</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">Termos de Uso</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ajuda</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary">Perguntas Frequentes</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">Como Jogar</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">Suporte Técnico</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>© 2025 raspadinha.site. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modais */}
      {showScratchCard && currentGame && (
        <ScratchCard
          gameType={currentGame}
          onClose={() => setShowScratchCard(false)}
          onComplete={handleGameComplete}
        />
      )}

      {showPrizeModal && selectedGameForPrizes && (
        <PrizeModal
          gameType={selectedGameForPrizes}
          onClose={() => setShowPrizeModal(false)}
        />
      )}

      {/* Modal de Depósito PIX */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        user={user}
        onDepositSuccess={(amount) => {
          setRealBalance(prev => prev + amount);
          setSuccess(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`);
          setShowDepositModal(false);
        }}
      />

      {/* Alertas */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant="destructive" className="w-80">
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2"
              onClick={() => setError('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className="w-80 border-primary bg-primary/10">
            <AlertDescription className="text-primary">{success}</AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2"
              onClick={() => setSuccess('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default App;

