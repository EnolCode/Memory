import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth System (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let refreshTokenCookie: string;

  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test1234@', // NOSONAR: Test password for e2e testing
    username: 'testuser',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar la misma configuración que en main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Cookie parser
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    await app.init();

    // Obtener conexión a la base de datos para limpiar después
    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    // Limpiar usuario de prueba
    await dataSource.query(`DELETE FROM users WHERE email = $1`, [
      testUser.email,
    ]);

    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user).not.toHaveProperty('password');

      // Verificar que se estableció la cookie de refresh token
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toContain('El email ya está registrado');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234@', // NOSONAR: Test password for e2e testing
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.message).toContain('El email debe ser válido');
    });

    it('should fail with weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'another@example.com',
          password: 'weak', // NOSONAR: Test password for e2e testing
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.message).toContain(
        'La contraseña debe tener al menos 8 caracteres',
      );
    });

    it('should fail without required password pattern', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'another@example.com',
          password: 'password123', // NOSONAR: Test password for e2e testing
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.message).toContain(
        'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales',
      );
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      // Guardar token para próximas pruebas
      accessToken = response.body.accessToken;

      // Guardar cookie para pruebas de refresh
      const cookies = response.headers['set-cookie'];
      refreshTokenCookie = cookies[0];
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should fail with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword1@', // NOSONAR: Test password for e2e testing
        })
        .expect(401);
    });

    it('should fail with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(401); // LocalStrategy rechaza las credenciales vacías con 401
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should fail with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token cookie', async () => {
      // Esperar 1 segundo para asegurar que el token tenga un iat diferente
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');

      // Verificar que se obtuvo un nuevo access token (diferente del anterior)
      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');

      // Decodificar los tokens para verificar que tienen diferentes iat (issued at)
      const oldTokenPayload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString(),
      );
      const newTokenPayload = JSON.parse(
        Buffer.from(
          response.body.accessToken.split('.')[1],
          'base64',
        ).toString(),
      );
      expect(newTokenPayload.iat).toBeGreaterThan(oldTokenPayload.iat);

      // Verificar que se estableció una nueva cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken');
    });

    it('should fail without refresh token cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout exitoso');

      // Verificar que se limpió la cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=;');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('Security Tests', () => {
    it('should not expose password hash in any response', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `security${Date.now()}@example.com`,
          password: 'Secure1234@', // NOSONAR: Test password for e2e testing
          username: 'securitytest',
        })
        .expect(201);

      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toContain('password');
      expect(responseStr).not.toContain('hashedRefreshToken');
      expect(responseStr).not.toContain('$2b$'); // bcrypt hash prefix
    });

    it('should rate limit registration attempts (if implemented)', async () => {
      // Este test es para cuando implementes rate limiting
      // Por ahora solo documentamos que debería existir
      expect(true).toBe(true);
    });

    it('should validate token expiration', async () => {
      // Crear un token expirado manualmente
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjN9.invalid'; // NOSONAR: Test token for e2e testing

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
