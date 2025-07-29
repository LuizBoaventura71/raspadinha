import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const DepositModal = ({ isOpen, onClose, user, onDepositSuccess }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: QR Code, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    name: user?.name || '',
    email: user?.email || '',
    taxNumber: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { amount, name, email, taxNumber, phone } = formData;
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return false;
    }
    
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Email válido é obrigatório');
      return false;
    }
    
    if (!taxNumber.trim()) {
      setError('CPF/CNPJ é obrigatório');
      return false;
    }
    
    if (!phone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }
    
    return true;
  };

  const handleCreatePayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://5000-i6aktsismcvt3mi1ke5pi-b63ddde2.manusvm.computer/api/create-pix-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          productName: `Depósito Raspadinha Digital - R$ ${formData.amount}`,
          client: {
            name: formData.name,
            email: formData.email,
            taxNumber: formData.taxNumber,
            phone: formData.phone
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentData(data);
        setStep(2);
        // Iniciar verificação de status
        startStatusCheck(data.orderId);
      } else {
        setError(data.error || 'Erro ao criar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const startStatusCheck = (orderId) => {
    if (!orderId) {
      console.error('OrderId não fornecido para verificação de status');
      return;
    }
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`https://5000-i6aktsismcvt3mi1ke5pi-b63ddde2.manusvm.computer/api/check-payment-status/${orderId}`);
        const data = await response.json();
        
        if (data.success && (data.status === 'Paid' || data.status === 'Approved')) {
          setStep(3);
          if (onDepositSuccess) {
            onDepositSuccess(parseFloat(formData.amount));
          }
          return;
        }
        
        // Continuar verificando se ainda não foi pago
        setTimeout(checkStatus, 5000); // Verificar a cada 5 segundos
      } catch (err) {
        console.error('Erro ao verificar status:', err);
        setTimeout(checkStatus, 10000); // Tentar novamente em 10 segundos
      }
    };
    
    setTimeout(checkStatus, 5000); // Primeira verificação em 5 segundos
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar uma notificação de "copiado"
  };

  const handleClose = () => {
    setStep(1);
    setError('');
    setPaymentData(null);
    setFormData({
      amount: '',
      name: user?.name || '',
      email: user?.email || '',
      taxNumber: '',
      phone: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Depósito PIX
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Preencha os dados para gerar o PIX'}
                {step === 2 && 'Escaneie o QR Code para pagar'}
                {step === 3 && 'Depósito realizado com sucesso!'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Depósito (R$)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">CPF/CNPJ</Label>
                  <Input
                    id="taxNumber"
                    name="taxNumber"
                    placeholder="000.000.000-00"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCreatePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar PIX
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {step === 2 && paymentData && (
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    Aguardando Pagamento
                  </Badge>
                  <p className="text-lg font-semibold">
                    R$ {parseFloat(formData.amount).toFixed(2)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {paymentData.qrCode && (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border">
                        <img 
                          src={`data:image/png;base64,${paymentData.qrCode}`}
                          alt="QR Code PIX"
                          className="w-full max-w-[200px] mx-auto"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Escaneie o QR Code ou copie o código PIX:
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {!paymentData.qrCode && (
                      <p className="text-sm font-medium text-gray-700">
                        Copie o código PIX abaixo:
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        value={paymentData.pixKey || ''}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(paymentData.pixKey || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Como pagar:
                    </p>
                    <ol className="text-xs text-blue-700 space-y-1 text-left">
                      <li>1. Abra o app do seu banco</li>
                      <li>2. Escolha a opção PIX</li>
                      <li>3. {paymentData.qrCode ? 'Escaneie o QR Code ou selecione "Pix Copia e Cola"' : 'Selecione "Pix Copia e Cola"'}</li>
                      <li>4. {paymentData.qrCode ? 'Se escolheu copia e cola, cole o código' : 'Cole o código copiado'}</li>
                      <li>5. Confirme o pagamento</li>
                    </ol>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• O pagamento será confirmado automaticamente</p>
                  <p>• Tempo limite: {paymentData.expire ? `${paymentData.expire} minutos` : '30 minutos'}</p>
                  <p>• ID do pedido: {paymentData.orderId}</p>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold text-green-700">
                    Pagamento Confirmado!
                  </h3>
                  <p className="text-gray-600">
                    R$ {parseFloat(formData.amount).toFixed(2)} foi adicionado ao seu saldo
                  </p>
                </div>
                
                <Button className="w-full" onClick={handleClose}>
                  Continuar Jogando
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepositModal;

