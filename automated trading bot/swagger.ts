import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Automated Trading Bot Documentation',
      version: '1.0.0',
      description: 'API documentation for automated trading bot application',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'Bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/**/*.ts'],
}

const specs = swaggerJsdoc(options)

export { swaggerUi, specs }
