<?php

namespace App\Controller;

use App\Entity\User;
use App\Exception\GoogleOAuthException;
use App\Service\GoogleOAuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthenticationController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required'], Response::HTTP_BAD_REQUEST);
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'])) {
            return new JsonResponse(['error' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        // Generate JWT token
        $token = $jwtManager->create($user);

        $response = new JsonResponse([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
                'roles' => $user->getRoles()
            ]
        ], Response::HTTP_OK);

        // Set token in httpOnly cookie
        $cookie = Cookie::create('BEARER')
            ->withValue($token)
            ->withExpires(time() + 3600) // 1 hour
            ->withHttpOnly(true)
            ->withPath('/')
            ->withSecure(false) // Set to false for localhost development
            ->withSameSite(Cookie::SAMESITE_LAX);

        $response->headers->setCookie($cookie);

        return $response;
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $response = new JsonResponse(['message' => 'Logout successful'], Response::HTTP_OK);

        // Clear the JWT token cookie
        $cookie = Cookie::create('BEARER')
            ->withValue('')
            ->withExpires(0)
            ->withHttpOnly(true)
            ->withPath('/')
            ->withSecure(false)
            ->withSameSite(Cookie::SAMESITE_LAX);

        $response->headers->setCookie($cookie);

        return $response;
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?UserInterface $user): JsonResponse
    {
        if (!$user) {
            return new JsonResponse(['error' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Invalid user'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
                'roles' => $user->getRoles()
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/api/auth/google', name: 'api_auth_google', methods: ['GET'])]
    public function googleRedirect(
        Request $request,
        GoogleOAuthService $googleOAuthService
    ): RedirectResponse {
        // Generate state for CSRF protection
        $state = $googleOAuthService->generateState();
        
        // Store state in session
        $request->getSession()->set('oauth_state', $state);
        
        $authUrl = $googleOAuthService->getAuthorizationUrl($state);
        return new RedirectResponse($authUrl);
    }

    #[Route('/api/auth/google/callback', name: 'api_auth_google_callback', methods: ['GET'])]
    public function googleCallback(
        Request $request,
        GoogleOAuthService $googleOAuthService,
        EntityManagerInterface $entityManager,
        JWTTokenManagerInterface $jwtManager
    ): RedirectResponse {
        $code = $request->query->get('code');
        $state = $request->query->get('state');
        $session = $request->getSession();

        // Validate state parameter (CSRF protection)
        $expectedState = $session->get('oauth_state');
        $session->remove('oauth_state');

        if (!$code || !$state || !$expectedState || $state !== $expectedState) {
            return new RedirectResponse('http://localhost:5173/login?error=invalid_state');
        }

        try {
            $googleUserInfo = $googleOAuthService->getUserInfo($code);

            // Find or create user
            $user = $entityManager->getRepository(User::class)->findOneBy(['googleId' => $googleUserInfo['google_id']]);

            if (!$user) {
                // Check if user exists by email
                $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $googleUserInfo['email']]);

                if (!$user) {
                    // Create new user
                    $user = new User();
                    $user->setEmail($googleUserInfo['email']);
                    $user->setUsername($googleUserInfo['name'] ?? explode('@', $googleUserInfo['email'])[0]);
                    $user->setRoles(['ROLE_USER']);
                    // No password for OAuth users
                    $user->setPassword('');
                } else {
                    // Link existing email to Google account
                    $user->setGoogleId($googleUserInfo['google_id']);
                }
            }

            $user->setGoogleId($googleUserInfo['google_id']);
            $entityManager->persist($user);
            $entityManager->flush();

            // Generate JWT token
            $token = $jwtManager->create($user);

            // Create response with redirect and cookie
            $response = new RedirectResponse('http://localhost:5173');

            // Set token in httpOnly cookie
            $cookie = Cookie::create('BEARER')
                ->withValue($token)
                ->withExpires(time() + 3600) // 1 hour
                ->withHttpOnly(true)
                ->withPath('/')
                ->withSecure(false) // Set to false for localhost development
                ->withSameSite(Cookie::SAMESITE_LAX);

            $response->headers->setCookie($cookie);

            return $response;
        } catch (GoogleOAuthException $e) {
            return new RedirectResponse('http://localhost:5173/login?error=auth_failed');
        }
    }
}

