<?php

namespace App\Controller;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class PasswordResetController extends AbstractController
{
    private const TOKEN_TTL = '+1 hour';
    private const MIN_PASSWORD_LENGTH = 8;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly string $frontendUrl,
        private readonly string $mailerFrom,
    ) {
    }

    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request, MailerInterface $mailer, LoggerInterface $logger): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = is_array($data) ? ($data['email'] ?? null) : null;

        if (!is_string($email) || $email === '') {
            return new JsonResponse(['error' => 'Email is required'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($user !== null) {
            $this->sendResetEmail($user, $mailer, $logger);
        }

        // Same answer whether or not the account exists, to avoid revealing registered emails
        return new JsonResponse(['message' => 'If an account exists for this email, a reset link has been sent']);
    }

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = is_array($data) ? ($data['token'] ?? null) : null;
        $password = is_array($data) ? ($data['password'] ?? null) : null;

        if (!is_string($token) || $token === '' || !is_string($password) || $password === '') {
            return new JsonResponse(['error' => 'Token and password are required'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (mb_strlen($password) < self::MIN_PASSWORD_LENGTH) {
            return new JsonResponse(
                ['error' => sprintf('Password must be at least %d characters', self::MIN_PASSWORD_LENGTH)],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $resetToken = $this->entityManager->getRepository(PasswordResetToken::class)
            ->findOneBy(['tokenHash' => hash('sha256', $token)]);

        if ($resetToken === null || $resetToken->isExpired()) {
            if ($resetToken !== null) {
                $this->entityManager->remove($resetToken);
                $this->entityManager->flush();
            }

            return new JsonResponse(['error' => 'Invalid or expired token'], Response::HTTP_BAD_REQUEST);
        }

        $user = $resetToken->getUser();
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $this->entityManager->remove($resetToken);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Password updated successfully']);
    }

    private function sendResetEmail(User $user, MailerInterface $mailer, LoggerInterface $logger): void
    {
        $tokenRepository = $this->entityManager->getRepository(PasswordResetToken::class);
        foreach ($tokenRepository->findBy(['user' => $user]) as $oldToken) {
            $this->entityManager->remove($oldToken);
        }

        $token = bin2hex(random_bytes(32));
        $this->entityManager->persist(
            new PasswordResetToken($user, hash('sha256', $token), new \DateTimeImmutable(self::TOKEN_TTL))
        );
        $this->entityManager->flush();

        $link = sprintf('%s/reset-password?token=%s', rtrim($this->frontendUrl, '/'), $token);
        $message = (new Email())
            ->from($this->mailerFrom)
            ->to((string) $user->getEmail())
            ->subject('Reset your Through-line password')
            ->text("Hello {$user->getUsername()},\n\nUse this link to choose a new password (valid for 1 hour):\n{$link}\n\nIf you did not request this, you can ignore this email.");

        try {
            $mailer->send($message);
        } catch (TransportExceptionInterface $exception) {
            $logger->error('Password reset email could not be sent', ['exception' => $exception]);
        }
    }
}
