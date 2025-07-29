import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  CreditCard, 
  History, 
  Settings, 
  Plus, 
  UserPlus,
  DollarSign,
  BarChart3,
  TrendingUp,
  GamepadIcon,
  Percent,
  Search,
  Edit,
  Trash2,
  Wallet,
  Calculator,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

const AdminPanel = ({ gameSettings, setGameSettings, onUpdateBalance }) => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalGames: 0,
    todayGames: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [addBalanceForm, setAddBalanceForm] = useState({
    email: '',
    amount: '',
    type: 'real'
  });
  
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    role: 'user'
  });

  const [editingGame, setEditingGame] = useState(null);
  const [suggestedPrizes, setSuggestedPrizes] = useState({});

  useEffect(() => {
    setUsers([
      { id: 1, email: 'usuario1@teste.com', balance: 150.75, testBalance: 50.00, role: 'user', createdAt: '2025-01-15' },
      { id: 2, email: 'usuario2@teste.com', balance: 89.30, testBalance: 25.00, role: 'user', createdAt: '2025-01-20' },
      { id: 3, email: 'admin@raspadinha.com', balance: 1000.00, testBalance: 100.00, role: 'admin', createdAt: '2025-01-01' },
      { id: 4, email: 'usuario3@teste.com', balance: 45.60, testBalance: 0.00, role: 'user', createdAt: '2025-01-25' }
    ]);
    
    setTransactions([
      { id: 1, userId: 1, type: 'deposit', amount: 100.00, description: 'Depósito PIX', date: '2025-01-29 10:30' },
      { id: 2, userId: 1, type: 'game', amount: -5.00, description: 'Mega Raspadinha', date: '2025-01-29 10:35' },
      { id: 3, userId: 2, type: 'prize', amount: 25.00, description: 'Prêmio - Super Raspadinha', date: '2025-01-29 09:15' },
      { id: 4, userId: 1, type: 'admin_add', amount: 50.75, description: 'Saldo adicionado pelo admin', date: '2025-01-29 08:00' }
    ]);
    
    setStats({
      totalUsers: 1234,
      totalRevenue: 45678.90,
      totalGames: 8765,
      todayGames: 234
    });
  }, []);

  const handleAddBalance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amount = parseFloat(addBalanceForm.amount);
      
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.email === addBalanceForm.email) {
            if (addBalanceForm.type === 'real') {
              return { ...user, balance: user.balance + amount };
            } else {
              return { ...user, testBalance: user.testBalance + amount };
            }
          }
          return user;
        })
      );
      
      const newTransaction = {
        id: transactions.length + 1,
        userId: users.find(u => u.email === addBalanceForm.email)?.id || 0,
        type: 'admin_add',
        amount: amount,
        description: `Saldo ${addBalanceForm.type} adicionado pelo admin`,
        date: new Date().toLocaleString('pt-BR')
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (onUpdateBalance) {
        onUpdateBalance(addBalanceForm.email, amount, addBalanceForm.type);
      }
      
      setSuccess(`Saldo de R$ ${amount.toFixed(2)} adicionado com sucesso!`);
      setAddBalanceForm({ email: '', amount: '', type: 'real' });
      
    } catch (err) {
      setError('Erro ao adicionar saldo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: users.length + 1,
        email: createUserForm.email,
        balance: 0,
        testBalance: 0,
        role: createUserForm.role,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setUsers(prev => [...prev, newUser]);
      setSuccess(`Usuário ${createUserForm.email} criado com sucesso!`);
      setCreateUserForm({ email: '', password: '', role: 'user' });
      
    } catch (err) {
      setError('Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'game': return 'bg-red-100 text-red-800';
      case 'prize': return 'bg-yellow-100 text-yellow-800';
      case 'admin_add': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'deposit': return 'Depósito';
      case 'game': return 'Jogo';
      case 'prize': return 'Prêmio';
      case 'admin_add': return 'Admin';
      default: return type;
    }
  };

  const gameCosts = {
    classica: 1.00,
    super: 2.50,
    mega: 5.00,
    suprema: 50.00,
    magica: 100.00
  };

  // Função para calcular métricas de lucro
  const calculateProfitMetrics = useCallback((gameKey, settings) => {
    const cost = gameCosts[gameKey];
    const winChance = settings.winChance / 100;
    const minPrize = settings.minPrize;
    const maxPrize = settings.maxPrize;
    
    const avgPrize = (minPrize + maxPrize) / 2;
    const expectedPayout = winChance * avgPrize;
    const expectedProfit = cost - expectedPayout;
    const profitMargin = (expectedProfit / cost) * 100;
    const rtp = (expectedPayout / cost) * 100;
    const actualHouseEdge = 100 - rtp;
    const profitPer100Games = expectedProfit * 100;
    const revenuePer100Games = cost * 100;
    
    return {
      expectedPayout,
      expectedProfit,
      profitMargin,
      rtp,
      actualHouseEdge,
      profitPer100Games,
      revenuePer100Games
    };
  }, []);

  // Função para sugerir prêmios com base na margem da casa desejada
  const suggestPrizesForHouseEdge = useCallback((gameKey, winChance, targetHouseEdge) => {
    const cost = gameCosts[gameKey];
    const targetRTP = 100 - targetHouseEdge;
    const targetExpectedPayout = (targetRTP / 100) * cost;

    if (winChance === 0) return { min: 0, max: 0 };

    const targetAvgPrize = targetExpectedPayout / (winChance / 100);

    // Tentar manter a proporção original entre minPrize e maxPrize, se existirem
    const currentSettings = gameSettings[gameKey];
    let suggestedMin = 0;
    let suggestedMax = 0;

    if (currentSettings && currentSettings.minPrize > 0 && currentSettings.maxPrize > 0) {
      const currentAvg = (currentSettings.minPrize + currentSettings.maxPrize) / 2;
      const ratioMin = currentSettings.minPrize / currentAvg;
      const ratioMax = currentSettings.maxPrize / currentAvg;
      suggestedMin = targetAvgPrize * ratioMin;
      suggestedMax = targetAvgPrize * ratioMax;
    } else {
      // Se não houver configurações anteriores, ou se forem inválidas, usar uma proporção padrão
      suggestedMin = targetAvgPrize * 0.5; // Exemplo: minPrize é metade do avgPrize
      suggestedMax = targetAvgPrize * 1.5; // Exemplo: maxPrize é 1.5 vezes o avgPrize
    }

    // Garantir que os prêmios não sejam negativos e sejam razoáveis
    suggestedMin = Math.max(0.01, parseFloat(suggestedMin.toFixed(2)));
    suggestedMax = Math.max(suggestedMin, parseFloat(suggestedMax.toFixed(2)));

    // Limitar os prêmios para não exceder um valor razoável (ex: 1000x o custo do jogo)
    const maxAllowedPrize = cost * 1000;
    suggestedMin = Math.min(suggestedMin, maxAllowedPrize);
    suggestedMax = Math.min(suggestedMax, maxAllowedPrize);

    return { min: suggestedMin, max: suggestedMax };
  }, [gameSettings]);

  const handleSuggestPrizes = useCallback((gameKey) => {
    const currentSettings = gameSettings[gameKey];
    if (!currentSettings) return;

    // Sugerir prêmios para uma margem da casa de 30% (exemplo)
    const suggested = suggestPrizesForHouseEdge(gameKey, currentSettings.winChance, 30);
    setSuggestedPrizes(prev => ({ ...prev, [gameKey]: suggested }));
  }, [gameSettings, suggestPrizesForHouseEdge]);

  const handleApplySuggestedPrizes = useCallback((gameKey) => {
    const suggested = suggestedPrizes[gameKey];
    if (suggested) {
      setGameSettings(prev => ({
        ...prev,
        [gameKey]: { ...prev[gameKey], minPrize: suggested.min, maxPrize: suggested.max }
      }));
      setSuggestedPrizes(prev => ({ ...prev, [gameKey]: undefined })); // Limpar sugestão
    }
  }, [suggestedPrizes, setGameSettings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Painel Administrativo</h2>
        <Badge variant="secondary" className="text-sm">
          Admin Dashboard
        </Badge>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-primary bg-primary/10">
          <AlertDescription className="text-primary">{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogos Hoje</CardTitle>
            <GamepadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayGames}</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação a ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jogos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Desde o lançamento
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="balance">Gerenciar Saldo</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="games">Jogos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="balance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Adicionar Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBalance} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email do Usuário</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={addBalanceForm.email}
                      onChange={(e) => setAddBalanceForm({...addBalanceForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={addBalanceForm.amount}
                      onChange={(e) => setAddBalanceForm({...addBalanceForm, amount: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="balance-type">Tipo de Saldo</Label>
                    <select
                      id="balance-type"
                      className="w-full p-2 border rounded-md bg-background"
                      value={addBalanceForm.type}
                      onChange={(e) => setAddBalanceForm({...addBalanceForm, type: e.target.value})}
                    >
                      <option value="real">Saldo Real</option>
                      <option value="test">Saldo Fictício (Teste)</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adicionando...' : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Saldo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="novo@usuario.com"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Senha do usuário"
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Papel</Label>
                    <select
                      id="user-role"
                      className="w-full p-2 border rounded-md bg-background"
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Criando...' : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Criar Usuário
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Criado em: {user.createdAt}
                        </p>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
                        Saldo Real: R$ {user.balance.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Saldo Teste: R$ {user.testBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {getTransactionTypeLabel(transaction.type)}
                      </Badge>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GamepadIcon className="h-5 w-5 mr-2" />
                Configurações dos Jogos
              </CardTitle>
              <CardDescription>
                Gerencie as probabilidades e prêmios para maximizar o lucro da casa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(gameSettings).map(([gameKey, settings]) => {
                  const gameNames = {
                    classica: 'Raspadinha Clássica (R$ 1,00)',
                    super: 'Super Raspadinha (R$ 2,50)',
                    mega: 'Mega Raspadinha (R$ 5,00)',
                    suprema: 'Raspadinha Suprema (R$ 50,00)',
                    magica: 'Raspadinha Mágica (R$ 100,00)'
                  };
                  
                  const metrics = calculateProfitMetrics(gameKey, settings);
                  const suggested = suggestedPrizes[gameKey];

                  return (
                    <Card key={gameKey} className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{gameNames[gameKey]}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={metrics.profitMargin > 50 ? 'default' : metrics.profitMargin > 30 ? 'secondary' : 'destructive'}>
                              Margem: {metrics.profitMargin.toFixed(1)}%
                            </Badge>
                            <Badge variant="outline">
                              RTP: {metrics.rtp.toFixed(1)}%
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGame(editingGame === gameKey ? null : gameKey)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {editingGame === gameKey ? 'Cancelar' : 'Editar'}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingGame === gameKey ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Chance de Ganhar (%)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  max="99.99"
                                  step="0.01"
                                  value={settings.winChance}
                                  onChange={(e) => setGameSettings(prev => ({
                                    ...prev,
                                    [gameKey]: { ...prev[gameKey], winChance: parseFloat(e.target.value) || 0 }
                                  }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {settings.winChance}% = {settings.winChance} ganhos a cada 100 jogadas
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Margem da Casa (%)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  max="99.99"
                                  step="0.01"
                                  value={settings.houseEdge}
                                  onChange={(e) => setGameSettings(prev => ({
                                    ...prev,
                                    [gameKey]: { ...prev[gameKey], houseEdge: parseFloat(e.target.value) || 0 }
                                  }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Percentual que a casa mantém como lucro
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Prêmio Mínimo (R$)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={settings.minPrize}
                                  onChange={(e) => setGameSettings(prev => ({
                                    ...prev,
                                    [gameKey]: { ...prev[gameKey], minPrize: parseFloat(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Prêmio Máximo (R$)</Label>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={settings.maxPrize}
                                  onChange={(e) => setGameSettings(prev => ({
                                    ...prev,
                                    [gameKey]: { ...prev[gameKey], maxPrize: parseFloat(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                            </div>

                            {/* Seção de Sugestões */}
                            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                                    <p className="text-sm text-blue-800 font-medium">
                                        Sugestão de Prêmios para Margem de 30%:
                                        Min: R$ {suggested?.min?.toFixed(2) || 'N/A'} | Max: R$ {suggested?.max?.toFixed(2) || 'N/A'}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleSuggestPrizes(gameKey)}
                                    >
                                        Gerar Sugestão
                                    </Button>
                                    {suggested && (
                                        <Button 
                                            variant="default" 
                                            size="sm" 
                                            onClick={() => handleApplySuggestedPrizes(gameKey)}
                                        >
                                            Aplicar Sugestão
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-3 flex items-center">
                                <Calculator className="h-4 w-4 mr-2" />
                                Análise de Lucro
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Payout Esperado</p>
                                  <p className="font-semibold">R$ {metrics.expectedPayout.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Lucro por Jogada</p>
                                  <p className="font-semibold text-green-600">R$ {metrics.expectedProfit.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Lucro/100 Jogadas</p>
                                  <p className="font-semibold text-green-600">R$ {metrics.profitPer100Games.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Receita/100 Jogadas</p>
                                  <p className="font-semibold">R$ {metrics.revenuePer100Games.toFixed(2)}</p>
                                </div>
                              </div>
                              
                              {metrics.profitMargin < 30 && (
                                <Alert className="mt-3">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    Margem de lucro baixa! Considere ajustar as configurações para garantir maior rentabilidade.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                            
                            <Button 
                              className="w-full"
                              onClick={() => {
                                setEditingGame(null);
                                setSuccess(`Configurações do jogo ${gameNames[gameKey]} atualizadas!`);
                              }}
                            >
                              Salvar Configurações
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Chance de Ganhar</p>
                                <p className="font-semibold">{settings.winChance}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Prêmio Médio</p>
                                <p className="font-semibold">R$ {((settings.minPrize + settings.maxPrize) / 2).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Margem da Casa</p>
                                <p className="font-semibold">{metrics.actualHouseEdge.toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lucro Esperado</p>
                                <p className="font-semibold text-green-600">R$ {metrics.expectedProfit.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              <p>• A cada 100 jogadas: Receita R$ {metrics.revenuePer100Games.toFixed(2)} | Lucro R$ {metrics.profitPer100Games.toFixed(2)}</p>
                              <p>• RTP (Return to Player): {metrics.rtp.toFixed(1)}% | Margem de Lucro: {metrics.profitMargin.toFixed(1)}%</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações gerais do sistema serão implementadas aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

