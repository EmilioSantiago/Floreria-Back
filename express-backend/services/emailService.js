const nodemailer = require('nodemailer');

// Configurar transportador (usar Mailtrap para desarrollo)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOrderConfirmation = async (email, orderNumber, orderData) => {
    try {
        const htmlContent = `
            <h1>Confirmación de Pedido</h1>
            <p>¡Gracias por tu compra!</p>
            <p><strong>Número de Pedido:</strong> ${orderNumber}</p>
            <p><strong>Precio Total:</strong> $${orderData.total_price}</p>
            <hr>
            <h3>Detalles de Envío:</h3>
            <p>${orderData.address}<br>${orderData.city}</p>
        `;

        await transporter.sendMail({
            from: '"Florería Chelito" <noreply@floreria.com>',
            to: email,
            subject: `Confirmación de Pedido #${orderNumber}`,
            html: htmlContent,
        });

        console.log(`✅ Email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

const sendContactReply = async (email, name, subject) => {
    try {
        const htmlContent = `
            <h1>Hemos recibido tu mensaje</h1>
            <p>Hola ${name},</p>
            <p>Gracias por contactarnos. Hemos recibido tu mensaje con el asunto:</p>
            <p><strong>"${subject}"</strong></p>
            <p>Te responderemos lo antes posible.</p>
            <p>Saludos,<br>Florería Chelito</p>
        `;

        await transporter.sendMail({
            from: '"Florería Chelito" <noreply@floreria.com>',
            to: email,
            subject: `Re: ${subject}`,
            html: htmlContent,
        });

        console.log(`✅ Confirmation email sent to ${email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error.message);
        throw error;
    }
};

module.exports = {
    sendOrderConfirmation,
    sendContactReply,
};
