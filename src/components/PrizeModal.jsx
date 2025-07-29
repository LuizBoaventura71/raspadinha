import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trophy, Star, Gift } from 'lucide-react';

const PrizeModal = ({ gameType, onClose }) => {
  // Gerar estrutura de prêmios baseada no tipo de jogo
  const generatePrizeStructure = (gameType) => {
    const maxPrize = gameType.max_prize;
    const cost = gameType.cost;
    
    return [
      {
        category: 'Prêmio Máximo',
        icon: <Trophy className="h-5 w-5" />,
        color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        prizes: [
          { value: maxPrize, probability: '0.1%', description: 'Jackpot!' }
        ]
      },
      {
        category: 'Prêmios Grandes',
        icon: <Star className="h-5 w-5" />,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        prizes: [
          { value: maxPrize * 0.5, probability: '0.5%', description: 'Super prêmio' },
          { value: maxPrize * 0.3, probability: '1%', description: 'Grande prêmio' },
          { value: maxPrize * 0.2, probability: '2%', description: 'Ótimo prêmio' }
        ]
      },
      {
        category: 'Prêmios Médios',
        icon: <Gift className="h-5 w-5" />,
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        prizes: [
          { value: cost * 50, probability: '3%', description: 'Bom prêmio' },
          { value: cost * 25, probability: '5%', description: 'Prêmio legal' },
          { value: cost * 10, probability: '8%', description: 'Prêmio bacana' }
        ]
      },
      {
        category: 'Prêmios Pequenos',
        icon: <Gift className="h-5 w-5" />,
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        prizes: [
          { value: cost * 5, probability: '15%', description: 'Prêmio inicial' },
          { value: cost * 3, probability: '20%', description: 'Pequeno prêmio' },
          { value: cost * 2, probability: '25%', description: 'Prêmio mínimo' }
        ]
      }
    ];
  };

  const prizeStructure = generatePrizeStructure(gameType);
  const totalWinProbability = prizeStructure
    .flatMap(category => category.prizes)
    .reduce((sum, prize) => sum + parseFloat(prize.probability), 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Prêmios - {gameType.name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Custo: R$ {gameType.cost.toFixed(2)}</span>
            <span>Chance total de ganhar: {totalWinProbability.toFixed(1)}%</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {prizeStructure.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{category.category}</h3>
                </div>
                
                <div className="grid gap-3">
                  {category.prizes.map((prize, prizeIndex) => (
                    <div 
                      key={prizeIndex}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary">
                            R$ {prize.value.toLocaleString('pt-BR', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prize.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {prize.probability}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          de chance
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Informações adicionais */}
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2">Informações Importantes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Os prêmios são determinados aleatoriamente</li>
                <li>• Cada raspadinha é independente das anteriores</li>
                <li>• Prêmios são creditados automaticamente no seu saldo</li>
                <li>• Chance de não ganhar: {(100 - totalWinProbability).toFixed(1)}%</li>
              </ul>
            </div>
            
            {/* Estatísticas do jogo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">
                  R$ {gameType.max_prize.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">Prêmio Máximo</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="text-2xl font-bold text-secondary">
                  {totalWinProbability.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Chance de Ganhar</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={onClose} className="w-full max-w-xs">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrizeModal;

