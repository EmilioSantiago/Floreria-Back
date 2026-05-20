const sgMail = require('@sendgrid/mail');

const storeName = process.env.STORE_NAME || 'Floreria Chelito';
const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:8000';

const isSendGridConfigured = () => {
    return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
};

const formatMoney = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString('es-MX', {
        style: 'currency',
        currency: process.env.MERCADOPAGO_CURRENCY || 'MXN',
    });
};

const escapeHtml = (value) => {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[character]));
};

const buildItemsRows = (items = []) => {
    return items.map((item) => {
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${escapeHtml(item.name || item.product_name)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${escapeHtml(item.quantity)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatMoney(item.price)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatMoney(lineTotal)}</td>
            </tr>
        `;
    }).join('');
};

const buildOrderEmail = ({ order, items = [], paymentStatus = 'pending' }) => {
    const orderUrl = `${frontendUrl}/order-confirmation/?orderId=${order.id}`;
    const isPaid = paymentStatus === 'paid' || order.status === 'paid';
    const paymentLabel = isPaid ? 'Pago confirmado' : 'Pedido recibido';

    const html = `
        <div style="margin:0; padding:0; background:#f7f5f0; font-family: Arial, sans-serif; color:#263238;">
            <div style="max-width:680px; margin:0 auto; padding:28px 16px;">
                <div style="background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e8ded9;">
                    <div style="background:#bd3f5e; color:white; padding:28px;">
                        <p style="margin:0 0 8px; text-transform:uppercase; letter-spacing:.08em; font-size:12px;">${escapeHtml(storeName)}</p>
                        <h1 style="margin:0; font-size:28px;">${paymentLabel}</h1>
                    </div>
                    <div style="padding:28px;">
                        <p style="font-size:16px;">Hola ${escapeHtml(order.customer_name)},</p>
                        <p>Gracias por tu compra. Recibimos tu pedido y lo estamos preparando.</p>

                        <div style="background:#fbfaf8; border-left:4px solid #2f7d68; padding:16px; margin:20px 0;">
                            <p style="margin:0;"><strong>Pedido:</strong> #${escapeHtml(order.id)}</p>
                            <p style="margin:8px 0 0;"><strong>Estado:</strong> ${escapeHtml(order.status)}</p>
                            <p style="margin:8px 0 0;"><strong>Total:</strong> ${formatMoney(order.total)}</p>
                        </div>

                        <h2 style="font-size:20px; color:#853047;">Productos</h2>
                        <table style="width:100%; border-collapse:collapse; font-size:14px;">
                            <thead>
                                <tr style="background:#f4ece7;">
                                    <th style="padding:12px; text-align:left;">Producto</th>
                                    <th style="padding:12px; text-align:center;">Cant.</th>
                                    <th style="padding:12px; text-align:right;">Precio</th>
                                    <th style="padding:12px; text-align:right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${buildItemsRows(items)}
                            </tbody>
                        </table>

                        <h2 style="font-size:20px; color:#853047; margin-top:24px;">Entrega</h2>
                        <p style="margin-bottom:4px;">${escapeHtml(order.address)}</p>
                        <p style="margin-top:0;">${escapeHtml(order.city)}, CP ${escapeHtml(order.postal_code)}</p>

                        <p style="margin-top:24px;">
                            <a href="${orderUrl}" style="display:inline-block; background:#bd3f5e; color:white; padding:12px 18px; border-radius:999px; text-decoration:none; font-weight:bold;">
                                Ver estado del pedido
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const text = [
        `${storeName} - ${paymentLabel}`,
        `Pedido: #${order.id}`,
        `Cliente: ${order.customer_name}`,
        `Estado: ${order.status}`,
        `Total: ${formatMoney(order.total)}`,
        `Entrega: ${order.address}, ${order.city}, CP ${order.postal_code}`,
        `Ver pedido: ${orderUrl}`,
    ].join('\n');

    return { html, text };
};

const sendOrderConfirmation = async ({ order, items = [], paymentStatus = 'pending' }) => {
    if (!isSendGridConfigured()) {
        console.warn('SendGrid is not configured. Skipping order confirmation email.');
        return { skipped: true };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const { html, text } = buildOrderEmail({ order, items, paymentStatus });

    const message = {
        to: order.email,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME || storeName,
        },
        subject: `Confirmacion de pedido #${order.id} - ${storeName}`,
        text,
        html,
    };

    if (process.env.SENDGRID_REPLY_TO_EMAIL) {
        message.replyTo = {
            email: process.env.SENDGRID_REPLY_TO_EMAIL,
            name: process.env.SENDGRID_REPLY_TO_NAME || storeName,
        };
    }

    await sgMail.send(message);
    console.log(`Order confirmation email sent to ${order.email}`);
    return { sent: true };
};

const sendContactReply = async ({ email, name, subject }) => {
    if (!isSendGridConfigured()) {
        console.warn('SendGrid is not configured. Skipping contact confirmation email.');
        return { skipped: true };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
        to: email,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME || storeName,
        },
        subject: `Recibimos tu mensaje - ${storeName}`,
        text: `Hola ${name}, recibimos tu mensaje con asunto "${subject}". Te responderemos lo antes posible.`,
        html: `
            <h1>Hemos recibido tu mensaje</h1>
            <p>Hola ${escapeHtml(name)},</p>
            <p>Gracias por contactarnos. Recibimos tu mensaje con el asunto:</p>
            <p><strong>${escapeHtml(subject)}</strong></p>
            <p>Te responderemos lo antes posible.</p>
        `,
    });

    return { sent: true };
};

module.exports = {
    sendOrderConfirmation,
    sendContactReply,
};
