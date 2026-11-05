<?php

namespace App\Tests\Functional\Controller;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordResetControllerTest extends WebTestCase
{
    private function createUser(string $suffix): User
    {
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = new User();
        $user->setEmail("reset{$suffix}@test.com");
        $user->setUsername("rst{$suffix}");
        $user->setRoles(['ROLE_USER']);
        $user->setPassword(
            self::getContainer()->get(UserPasswordHasherInterface::class)->hashPassword($user, 'OldPassword123!')
        );
        $em->persist($user);
        $em->flush();

        return $user;
    }

    private function postJson(KernelBrowser $client, string $uri, array $payload): array
    {
        $client->request('POST', $uri, [], [], ['CONTENT_TYPE' => 'application/json'], json_encode($payload));

        return json_decode($client->getResponse()->getContent(), true);
    }

    private function requestResetToken(KernelBrowser $client, string $email): string
    {
        $this->postJson($client, '/api/forgot-password', ['email' => $email]);

        $message = self::getMailerMessage();
        $this->assertInstanceOf(Email::class, $message);
        $this->assertSame(1, preg_match('/reset-password\?token=([a-f0-9]{64})/', $message->getTextBody(), $matches));

        return $matches[1];
    }

    public function testForgotPasswordWithoutEmailReturns422(): void
    {
        $client = self::createClient();

        $this->postJson($client, '/api/forgot-password', []);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testForgotPasswordWithUnknownEmailRevealsNothing(): void
    {
        $client = self::createClient();

        $this->postJson($client, '/api/forgot-password', ['email' => 'nobody' . uniqid() . '@test.com']);

        $this->assertResponseStatusCodeSame(200);
        $this->assertEmailCount(0);
    }

    public function testForgotPasswordSendsEmailWithLink(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        $this->createUser($suffix);

        $this->postJson($client, '/api/forgot-password', ['email' => "reset{$suffix}@test.com"]);

        $this->assertResponseStatusCodeSame(200);
        $this->assertEmailCount(1);
        $this->assertEmailAddressContains(self::getMailerMessage(), 'To', "reset{$suffix}@test.com");
        $this->assertEmailTextBodyContains(self::getMailerMessage(), '/reset-password?token=');
    }

    public function testResetPasswordWithValidTokenAllowsLoginWithNewPassword(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        $this->createUser($suffix);
        $token = $this->requestResetToken($client, "reset{$suffix}@test.com");

        $this->postJson($client, '/api/reset-password', ['token' => $token, 'password' => 'NewPassword456!']);
        $this->assertResponseStatusCodeSame(200);

        $this->postJson($client, '/api/login', ['email' => "reset{$suffix}@test.com", 'password' => 'NewPassword456!']);
        $this->assertResponseStatusCodeSame(200);

        $this->postJson($client, '/api/login', ['email' => "reset{$suffix}@test.com", 'password' => 'OldPassword123!']);
        $this->assertResponseStatusCodeSame(401);
    }

    public function testResetTokenCanOnlyBeUsedOnce(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        $this->createUser($suffix);
        $token = $this->requestResetToken($client, "reset{$suffix}@test.com");

        $this->postJson($client, '/api/reset-password', ['token' => $token, 'password' => 'NewPassword456!']);
        $this->assertResponseStatusCodeSame(200);

        $this->postJson($client, '/api/reset-password', ['token' => $token, 'password' => 'AnotherPass789!']);
        $this->assertResponseStatusCodeSame(400);
    }

    public function testResetPasswordWithInvalidTokenReturns400(): void
    {
        $client = self::createClient();

        $this->postJson($client, '/api/reset-password', ['token' => 'not-a-real-token', 'password' => 'NewPassword456!']);

        $this->assertResponseStatusCodeSame(400);
    }

    public function testResetPasswordWithExpiredTokenReturns400(): void
    {
        $client = self::createClient();
        $suffix = substr(uniqid(), -6);
        $user = $this->createUser($suffix);
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $em->persist(new PasswordResetToken($user, hash('sha256', 'expired-token'), new \DateTimeImmutable('-1 minute')));
        $em->flush();

        $this->postJson($client, '/api/reset-password', ['token' => 'expired-token', 'password' => 'NewPassword456!']);

        $this->assertResponseStatusCodeSame(400);
    }

    public function testResetPasswordWithTooShortPasswordReturns422(): void
    {
        $client = self::createClient();

        $this->postJson($client, '/api/reset-password', ['token' => 'whatever', 'password' => 'short']);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testResetPasswordWithMissingFieldsReturns422(): void
    {
        $client = self::createClient();

        $this->postJson($client, '/api/reset-password', ['token' => 'whatever']);

        $this->assertResponseStatusCodeSame(422);
    }
}
