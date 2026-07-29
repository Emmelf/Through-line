<?php

namespace App\Tests\Functional\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AuthControllerTest extends WebTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    private function createUserDirectly(string $email, string $username, string $password): void
    {
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $passwordHasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $user = new User();
        $user->setEmail($email);
        $user->setUsername($username);
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        $user->setRoles(['ROLE_USER']);

        $em->persist($user);
        $em->flush();
    }

    public function testRegistrationWithValidData(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        $payload = json_encode([
            'email' => "new{$suffix}@test.com",
            'password' => 'SecurePassword123!',
            'username' => "usr{$suffix}"
        ]);

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        $response = $client->getResponse();
        $this->assertEquals(201, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $data);
        $this->assertEquals('User registered successfully', $data['message']);
        $this->assertArrayHasKey('user', $data);
        $this->assertEquals("new{$suffix}@test.com", $data['user']['email']);
        $this->assertEquals("usr{$suffix}", $data['user']['username']);
    }

    public function testRegistrationWithExistingEmail(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        $email = "ex{$suffix}@test.com";
        
        // Create a user first via API
        $payload = json_encode([
            'email' => $email,
            'password' => 'SecurePassword123!',
            'username' => "u1{$suffix}"
        ]);
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        // Try to register with the same email
        $payload = json_encode([
            'email' => $email,
            'password' => 'SecurePassword123!',
            'username' => "u2{$suffix}"
        ]);

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        $response = $client->getResponse();
        $this->assertEquals(409, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('already exists', $data['error']);
    }

    public function testRegistrationWithMissingData(): void
    {
        $client = self::createClient();
        $payload = json_encode([
            'email' => 'newuser@example.com'
            // Missing password and username
        ]);

        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        $response = $client->getResponse();
        $this->assertEquals(400, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
    }

    public function testLoginWithValidCredentials(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        
        // First create a user via API
        $payload = json_encode([
            'email' => "lg{$suffix}@test.com",
            'password' => 'password123',
            'username' => "usr{$suffix}"
        ]);
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        // Login with valid credentials
        $payload = json_encode([
            'email' => "lg{$suffix}@test.com",
            'password' => 'password123'
        ]);

        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $data);
        $this->assertEquals('Login successful', $data['message']);
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('user', $data);

        // Check for httpOnly cookie
        $cookies = $response->headers->getCookies();
        $bearerCookie = null;
        foreach ($cookies as $cookie) {
            if ($cookie->getName() === 'BEARER') {
                $bearerCookie = $cookie;
                break;
            }
        }

        $this->assertNotNull($bearerCookie, 'BEARER cookie not found');
        $this->assertTrue($bearerCookie->isHttpOnly(), 'Cookie is not httpOnly');
        $this->assertNotEmpty($bearerCookie->getValue(), 'Cookie value is empty');
    }

    public function testLoginWithInvalidPassword(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        
        // First create a user via API
        $payload = json_encode([
            'email' => "pw{$suffix}@test.com",
            'password' => 'correctpassword',
            'username' => "usr{$suffix}"
        ]);
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        // Login with wrong password
        $payload = json_encode([
            'email' => "pw{$suffix}@test.com",
            'password' => 'wrongpassword'
        ]);

        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        $response = $client->getResponse();
        $this->assertEquals(401, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('Invalid credentials', $data['error']);
    }

    public function testGetMeWithoutToken(): void
    {
        $client = self::createClient();
        $client->request('GET', '/api/me');

        $response = $client->getResponse();
        $this->assertEquals(401, $response->getStatusCode());
    }

    public function testGetMeWithValidToken(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        
        // First create a user via API
        $payload = json_encode([
            'email' => "me{$suffix}@test.com",
            'password' => 'password123',
            'username' => "usr{$suffix}"
        ]);
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);

        // Login to get token
        $payload = json_encode([
            'email' => "me{$suffix}@test.com",
            'password' => 'password123'
        ]);

        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], $payload);
        $loginResponse = $client->getResponse();
        $loginData = json_decode($loginResponse->getContent(), true);
        $token = $loginData['token'];

        // Use the token to call /api/me
        $client->request('GET', '/api/me', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);

        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertEquals("me{$suffix}@test.com", $data['user']['email']);
        $this->assertEquals("usr{$suffix}", $data['user']['username']);
    }
}
