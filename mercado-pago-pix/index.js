import express from 'express';
import { MercadoPagoConfig } from 'mercadopago';
import dotenv from 'dotenv';

// Carrega variáveis do .env
dotenv.config();

const app = express();
app.use(express.json());

// Cria instância do Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: 'APP_USR-4737646285883259-041217-26cb17d7afd961469cfb4163a290941e-452277118' // coloque seu access token aqui se não usar .env
});

// Rota para criar pagamento (checkout)
app.post('/criar-pagamento', async (req, res) => {
  try {
    const result = await mercadopago.preferences.create({
      body: {
        items: [
          {
            title: 'JAPA SLOT Créditos',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: 10.0
          }
        ]
      }
    });

    res.json({ url: result.init_point });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
