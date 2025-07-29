import os
import requests
import qrcode
import base64
from io import BytesIO
from flask import Blueprint, request, jsonify
from datetime import datetime

payment_bp = Blueprint('payment', __name__)

# Configurações da Sacapay
SACAPAY_BASE_URL = "https://api.sacapay.com.br"
SACAPAY_PUBLIC_TOKEN = "0f745d43-58a5-42c5-8561-7a8d4e75e9cc"
SACAPAY_PRIVATE_TOKEN = "bf33339a-ef11-4477-b0ce-e6941b040a87"

def generate_qr_code_from_pix(pix_code):
    """
    Gera um QR Code a partir do código PIX e retorna como base64
    """
    try:
        # Criar QR Code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(pix_code)
        qr.make(fit=True)
        
        # Criar imagem
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Converter para base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str
    except Exception as e:
        print(f"Erro ao gerar QR Code: {str(e)}")
        return None

@payment_bp.route('/create-pix-payment', methods=['POST'])
def create_pix_payment():
    """
    Cria um pagamento PIX via Sacapay
    """
    try:
        print("=== DEBUG: Iniciando create_pix_payment ===")
        data = request.get_json()
        print(f"=== DEBUG: Dados recebidos: {data} ===")
        
        # Validação dos dados obrigatórios
        required_fields = ['amount', 'client']
        for field in required_fields:
            if field not in data:
                print(f"=== DEBUG: Campo obrigatório ausente: {field} ===")
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        # Validação dos dados do cliente
        client_required_fields = ['name', 'email', 'taxNumber', 'phone']
        for field in client_required_fields:
            if field not in data['client']:
                print(f"=== DEBUG: Campo obrigatório do cliente ausente: {field} ===")
                return jsonify({'error': f'Campo obrigatório do cliente: {field}'}), 400
        
        # Preparar dados para a Sacapay
        sacapay_payload = {
            "amount": float(data['amount']),
            "productName": data.get('productName', 'Depósito Raspadinha Digital'),
            "sellUrl": data.get('sellUrl', 'https://raspadinha.digital'),
            "paymentType": "Pix",
            "client": {
                "name": data['client']['name'],
                "email": data['client']['email'],
                "taxNumber": data['client']['taxNumber'],
                "phone": data['client']['phone']
            }
        }
        
        print(f"=== DEBUG: Payload para Sacapay: {sacapay_payload} ===")
        
        # Adicionar postBackUrl se fornecido
        if 'postBackUrl' in data:
            sacapay_payload['postBackUrl'] = data['postBackUrl']
        
        # Headers para a requisição
        headers = {
            'Content-Type': 'application/json',
            'x-token-private': SACAPAY_PRIVATE_TOKEN
        }
        
        print(f"=== DEBUG: Headers: {headers} ===")
        print(f"=== DEBUG: URL: {SACAPAY_BASE_URL}/api/Order/External/Create ===")
        
        # Fazer requisição para a Sacapay
        response = requests.post(
            f"{SACAPAY_BASE_URL}/api/Order/External/Create",
            json=sacapay_payload,
            headers=headers
        )
        
        print(f"=== DEBUG: Status da resposta Sacapay: {response.status_code} ===")
        print(f"=== DEBUG: Resposta Sacapay: {response.text} ===")
        
        if response.status_code == 200:
            sacapay_response = response.json()
            
            # Verificar se a operação foi bem-sucedida
            if sacapay_response.get('success'):
                object_data = sacapay_response.get('object', {})
                pix_code = object_data.get('pix')
                
                # Gerar QR Code a partir do código PIX
                qr_code_base64 = generate_qr_code_from_pix(pix_code) if pix_code else None
                
                return jsonify({
                    'success': True,
                    'orderId': object_data.get('orderId'),
                    'qrCode': qr_code_base64,  # QR Code gerado como base64
                    'pixKey': pix_code,  # String PIX para copiar/colar
                    'expire': object_data.get('expire'),
                    'value': object_data.get('value'),
                    'status': object_data.get('status'),
                    'message': sacapay_response.get('message')
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': sacapay_response.get('message', 'Erro desconhecido da Sacapay')
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': f'Erro na comunicação com Sacapay: {response.status_code} - {response.text}'
            }), 500
            
    except Exception as e:
        print(f"=== DEBUG: Erro capturado: {str(e)} ===")
        import traceback
        print(f"=== DEBUG: Traceback: {traceback.format_exc()} ===")
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@payment_bp.route('/check-payment-status/<order_id>', methods=['GET'])
def check_payment_status(order_id):
    """
    Verifica o status de um pagamento PIX
    """
    try:
        headers = {
            'x-token-private': SACAPAY_PRIVATE_TOKEN
        }
        
        response = requests.get(
            f"{SACAPAY_BASE_URL}/api/Order/External/GetOrderStatusById/{order_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            sacapay_response = response.json()
            return jsonify({
                'success': True,
                'orderId': order_id,
                'status': sacapay_response.get('status'),
                'data': sacapay_response
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': f'Erro ao verificar status: {response.status_code}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro interno: {str(e)}'
        }), 500

@payment_bp.route('/webhook/sacapay', methods=['POST'])
def sacapay_webhook():
    """
    Webhook para receber notificações da Sacapay sobre mudanças de status
    """
    try:
        data = request.get_json()
        
        # Log do webhook recebido (em produção, usar logging adequado)
        print(f"Webhook recebido da Sacapay: {data}")
        
        # Aqui você pode processar a notificação
        # Por exemplo, atualizar o status do pagamento no banco de dados
        # e creditar o saldo do usuário se o pagamento foi aprovado
        
        order_id = data.get('orderId')
        status = data.get('status')
        
        if status == 'Paid' or status == 'Approved':
            # Pagamento aprovado - aqui você creditaria o saldo do usuário
            print(f"Pagamento {order_id} aprovado!")
            # TODO: Implementar lógica de crédito de saldo
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

