import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, X } from 'lucide-react';

const ScratchCard = ({ gameType, onClose, onComplete }) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Simular resultado do jogo usando configurações do admin
  useEffect(() => {
    const settings = gameType.settings;
    if (!settings) {
      // Fallback para configurações padrão se não houver configurações do admin
      const isWinner = Math.random() < 0.15;
      if (isWinner) {
        const maxPrize = gameType.max_prize;
        const minPrize = gameType.cost * 1.5;
        const randomPrize = Math.random() * (maxPrize - minPrize) + minPrize;
        setPrize(Math.round(randomPrize * 100) / 100);
      } else {
        setPrize(0);
      }
      return;
    }

    // Usar configurações do admin
    const winChance = settings.winChance / 100; // Converter porcentagem para decimal
    const isWinner = Math.random() < winChance;
    
    if (isWinner) {
      // Gerar prêmio aleatório entre min e max
      const randomPrize = Math.random() * (settings.maxPrize - settings.minPrize) + settings.minPrize;
      setPrize(Math.round(randomPrize * 100) / 100);
    } else {
      setPrize(0);
    }
  }, [gameType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Configurar canvas
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Desenhar camada de cobertura
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.5, '#E0E0E0');
    gradient.addColorStop(1, '#C0C0C0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Adicionar padrão de textura
    ctx.fillStyle = '#B0B0B0';
    for (let i = 0; i < rect.width; i += 20) {
      for (let j = 0; j < rect.height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }
    
    // Adicionar texto "RASPE AQUI"
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RASPE AQUI', rect.width / 2, rect.height / 2);
    
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * 2,
      y: (e.clientY - rect.top) * 2
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.touches[0].clientX - rect.left) * 2,
      y: (e.touches[0].clientY - rect.top) * 2
    };
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    // Calcular porcentagem raspada
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }
    
    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchedPercentage(percentage);
    
    if (percentage > 50 && !isRevealed) {
      setIsRevealed(true);
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }
  };

  const handleMouseDown = (e) => {
    setIsScratching(true);
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    if (!isScratching) return;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsScratching(true);
    const pos = getTouchPos(e);
    scratch(pos.x, pos.y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isScratching) return;
    const pos = getTouchPos(e);
    scratch(pos.x, pos.y);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsScratching(false);
  };

  const handleComplete = () => {
    onComplete && onComplete(prize);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{gameType.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-6">
          <div className="relative">
            {/* Fundo da raspadinha com o resultado */}
            <div className={`w-full h-48 rounded-lg flex items-center justify-center relative overflow-hidden ${
              prize > 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-600 to-gray-800'
            }`}>
              {prize > 0 ? (
                <div className="text-center text-white">
                  <Trophy className="h-12 w-12 mx-auto mb-2" />
                  <div className="text-2xl font-bold">PARABÉNS!</div>
                  <div className="text-3xl font-bold">R$ {prize.toFixed(2)}</div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-xl font-bold">Tente novamente!</div>
                  <div className="text-sm opacity-75">Mais sorte na próxima</div>
                </div>
              )}
              
              {/* Canvas de cobertura */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-pointer"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              />
            </div>
            
            {/* Instruções */}
            {!isRevealed && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Raspe a área acima para revelar seu prêmio
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scratchedPercentage}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Resultado revelado */}
            {showResult && (
              <div className="mt-4 text-center">
                {prize > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-primary">
                      <Sparkles className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Você ganhou!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      O valor foi adicionado ao seu saldo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Não foi desta vez!</p>
                    <p className="text-sm text-muted-foreground">
                      Continue jogando para aumentar suas chances
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleComplete}
                >
                  Continuar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScratchCard;

